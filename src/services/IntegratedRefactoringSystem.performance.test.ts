/**
 * Large-Scale Performance Tests for IntegratedRefactoringSystem
 * Tests performance characteristics with 100+ files
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { IntegratedRefactoringSystem } from './IntegratedRefactoringSystem.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('IntegratedRefactoringSystem Performance Tests', () => {
  let testDir: string;
  let refactoringSystem: IntegratedRefactoringSystem;

  beforeEach(async () => {
    testDir = path.join(__dirname, '../../test-performance', `perf-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
    
    const config = {
      maxFileSize: 100,
      maxFilesPerFolder: 10,
      duplicateSimilarityThreshold: 0.8,
      includePatterns: ['src/**/*.ts'],
      excludePatterns: ['**/*.test.*'],
      createBackups: true,
      stopOnError: false
    };
    
    refactoringSystem = new IntegratedRefactoringSystem(testDir, config);
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Cleanup warning:', error);
    }
  });

  describe('Large Codebase Performance', () => {
    it('should handle 100 files efficiently (< 30 seconds)', async () => {
      const fileCount = 100;
      const startSetup = Date.now();
      
      // Create realistic file structure
      await createLargeCodebase(testDir, fileCount);
      const setupTime = Date.now() - startSetup;
      console.log(`Setup time for ${fileCount} files: ${setupTime}ms`);
      
      const startAnalysis = Date.now();
      const analysis = await refactoringSystem.analyzeCodebase();
      const analysisTime = Date.now() - startAnalysis;
      
      console.log(`Analysis time: ${analysisTime}ms`);
      console.log(`Files analyzed: ${analysis.totalFiles}`);
      console.log(`Analysis rate: ${Math.round(analysis.totalFiles / (analysisTime / 1000))} files/second`);
      
      // Performance assertions
      expect(analysisTime).toBeLessThan(10000); // < 10 seconds for analysis
      expect(analysis.totalFiles).toBe(fileCount);
      
      if (analysis.oversizedFiles.length > 0 || analysis.overcrowdedFolders.length > 0) {
        const startRefactoring = Date.now();
        const report = await refactoringSystem.executeRefactoring();
        const refactoringTime = Date.now() - startRefactoring;
        
        console.log(`Refactoring time: ${refactoringTime}ms`);
        console.log(`Total operations: ${report.operations.length}`);
        
        // Should complete within 30 seconds for 100 files
        expect(refactoringTime).toBeLessThan(30000);
        expect(report.success).toBe(true);
      }
    }, 60000); // 60 second timeout

    it('should handle 250 files with reasonable performance (< 60 seconds)', async () => {
      const fileCount = 250;
      const startSetup = Date.now();
      
      await createLargeCodebase(testDir, fileCount);
      const setupTime = Date.now() - startSetup;
      console.log(`Setup time for ${fileCount} files: ${setupTime}ms`);
      
      const startAnalysis = Date.now();
      const analysis = await refactoringSystem.analyzeCodebase();
      const analysisTime = Date.now() - startAnalysis;
      
      console.log(`Analysis time: ${analysisTime}ms`);
      console.log(`Analysis rate: ${Math.round(analysis.totalFiles / (analysisTime / 1000))} files/second`);
      
      // Performance assertions for larger codebase
      expect(analysisTime).toBeLessThan(20000); // < 20 seconds for analysis
      expect(analysis.totalFiles).toBe(fileCount);
      
      // Memory usage should be reasonable
      const memUsage = process.memoryUsage();
      console.log(`Memory usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
      expect(memUsage.heapUsed).toBeLessThan(500 * 1024 * 1024); // < 500MB
      
    }, 120000); // 2 minute timeout

    it('should scale linearly with file count', async () => {
      const fileCounts = [50, 100, 150];
      const results: Array<{ fileCount: number; analysisTime: number; rate: number }> = [];
      
      for (const fileCount of fileCounts) {
        // Clean and recreate test directory
        await fs.rm(testDir, { recursive: true, force: true });
        await fs.mkdir(testDir, { recursive: true });
        
        await createLargeCodebase(testDir, fileCount);
        
        const startTime = Date.now();
        const analysis = await refactoringSystem.analyzeCodebase();
        const analysisTime = Date.now() - startTime;
        const rate = analysis.totalFiles / (analysisTime / 1000);
        
        results.push({ fileCount, analysisTime, rate });
        console.log(`${fileCount} files: ${analysisTime}ms (${Math.round(rate)} files/sec)`);
      }
      
      // Check that performance scales reasonably (not exponentially)
      const rate50 = results[0].rate;
      const rate150 = results[2].rate;
      const performanceDegradation = (rate50 - rate150) / rate50;
      
      console.log(`Performance degradation: ${Math.round(performanceDegradation * 100)}%`);
      
      // Performance should not degrade more than 50% when tripling file count
      expect(performanceDegradation).toBeLessThan(0.5);
      
    }, 180000); // 3 minute timeout
  });

  describe('Memory Usage Optimization', () => {
    it('should maintain reasonable memory usage with large codebases', async () => {
      const fileCount = 200;
      
      // Measure baseline memory
      const baselineMemory = process.memoryUsage().heapUsed;
      
      await createLargeCodebase(testDir, fileCount);
      
      // Measure memory after file creation
      const afterSetupMemory = process.memoryUsage().heapUsed;
      
      const analysis = await refactoringSystem.analyzeCodebase();
      
      // Measure memory after analysis
      const afterAnalysisMemory = process.memoryUsage().heapUsed;
      
      console.log(`Baseline memory: ${Math.round(baselineMemory / 1024 / 1024)}MB`);
      console.log(`After setup: ${Math.round(afterSetupMemory / 1024 / 1024)}MB`);
      console.log(`After analysis: ${Math.round(afterAnalysisMemory / 1024 / 1024)}MB`);
      
      const memoryIncrease = afterAnalysisMemory - baselineMemory;
      const memoryPerFile = memoryIncrease / fileCount;
      
      console.log(`Memory increase: ${Math.round(memoryIncrease / 1024 / 1024)}MB`);
      console.log(`Memory per file: ${Math.round(memoryPerFile / 1024)}KB`);
      
      // Memory usage should be reasonable
      expect(memoryPerFile).toBeLessThan(100 * 1024); // < 100KB per file
      expect(memoryIncrease).toBeLessThan(200 * 1024 * 1024); // < 200MB total increase
      
    }, 120000);

    it('should handle memory cleanup properly', async () => {
      const fileCount = 150;
      
      await createLargeCodebase(testDir, fileCount);
      
      // Run multiple analysis cycles to test memory cleanup
      const memoryReadings: number[] = [];
      
      for (let i = 0; i < 3; i++) {
        const analysis = await refactoringSystem.analyzeCodebase();
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
        
        const memUsage = process.memoryUsage().heapUsed;
        memoryReadings.push(memUsage);
        console.log(`Cycle ${i + 1} memory: ${Math.round(memUsage / 1024 / 1024)}MB`);
        
        expect(analysis.totalFiles).toBe(fileCount);
      }
      
      // Memory should not continuously increase (no major leaks)
      const firstReading = memoryReadings[0];
      const lastReading = memoryReadings[memoryReadings.length - 1];
      const memoryIncrease = (lastReading - firstReading) / firstReading;
      
      console.log(`Memory increase across cycles: ${Math.round(memoryIncrease * 100)}%`);
      
      // Should not increase more than 20% across multiple cycles
      expect(memoryIncrease).toBeLessThan(0.2);
      
    }, 180000);
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent analysis requests efficiently', async () => {
      const fileCount = 100;
      await createLargeCodebase(testDir, fileCount);
      
      // Run multiple concurrent analyses
      const concurrentCount = 3;
      const startTime = Date.now();
      
      const promises = Array(concurrentCount).fill(0).map(async (_, index) => {
        const system = new IntegratedRefactoringSystem(testDir, {
          maxFileSize: 100,
          maxFilesPerFolder: 10,
          duplicateSimilarityThreshold: 0.8,
          includePatterns: ['src/**/*.ts'],
          excludePatterns: ['**/*.test.*'],
          createBackups: true,
          stopOnError: false
        });
        
        const analysis = await system.analyzeCodebase();
        return { index, fileCount: analysis.totalFiles, time: Date.now() - startTime };
      });
      
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      console.log(`Concurrent analysis results:`, results);
      console.log(`Total time for ${concurrentCount} concurrent analyses: ${totalTime}ms`);
      
      // All should complete successfully
      results.forEach(result => {
        expect(result.fileCount).toBe(fileCount);
      });
      
      // Should not take more than 2x the time of a single analysis
      expect(totalTime).toBeLessThan(20000); // < 20 seconds for concurrent operations
      
    }, 120000);
  });
});

/**
 * Creates a large, realistic codebase for performance testing
 */
async function createLargeCodebase(baseDir: string, fileCount: number): Promise<void> {
  const folders = [
    'src/components',
    'src/services', 
    'src/utils',
    'src/hooks',
    'src/types',
    'src/stores',
    'src/pages',
    'src/layouts'
  ];
  
  // Create folder structure
  for (const folder of folders) {
    await fs.mkdir(path.join(baseDir, folder), { recursive: true });
  }
  
  const fileTemplates = {
    component: `
import React from 'react';
import { useState, useEffect } from 'react';

interface Props {
  id: string;
  title: string;
  onAction?: (id: string) => void;
}

export const Component{{INDEX}} = ({ id, title, onAction }: Props) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(\`/api/data/\${id}\`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  const handleClick = () => {
    if (onAction) {
      onAction(id);
    }
  };
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="component-{{INDEX}}">
      <h2>{title}</h2>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      <button onClick={handleClick}>Action</button>
    </div>
  );
};
`,
    service: `
export class Service{{INDEX}} {
  private baseUrl = '/api/service{{INDEX}}';
  private cache = new Map<string, any>();
  
  async getData(id: string): Promise<any> {
    if (this.cache.has(id)) {
      return this.cache.get(id);
    }
    
    try {
      const response = await fetch(\`\${this.baseUrl}/\${id}\`);
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
      }
      
      const data = await response.json();
      this.cache.set(id, data);
      return data;
    } catch (error) {
      console.error('Service{{INDEX}} error:', error);
      throw error;
    }
  }
  
  async createData(payload: any): Promise<any> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
      }
      
      const data = await response.json();
      this.cache.set(data.id, data);
      return data;
    } catch (error) {
      console.error('Service{{INDEX}} create error:', error);
      throw error;
    }
  }
  
  clearCache(): void {
    this.cache.clear();
  }
}
`,
    util: `
export const util{{INDEX}} = {
  formatDate: (date: Date): string => {
    return date.toISOString().split('T')[0];
  },
  
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return emailRegex.test(email);
  },
  
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },
  
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};
`,
    hook: `
import { useState, useEffect, useCallback } from 'react';

export const useHook{{INDEX}} = (initialValue: any = null) => {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchData = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(\`/api/hook{{INDEX}}/\${id}\`);
      if (!response.ok) {
        throw new Error(\`Failed to fetch: \${response.statusText}\`);
      }
      
      const data = await response.json();
      setValue(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);
  
  const updateValue = useCallback((newValue: any) => {
    setValue(newValue);
  }, []);
  
  const resetValue = useCallback(() => {
    setValue(initialValue);
    setError(null);
  }, [initialValue]);
  
  return {
    value,
    loading,
    error,
    fetchData,
    updateValue,
    resetValue
  };
};
`
  };
  
  const filesPerFolder = Math.ceil(fileCount / folders.length);
  let currentIndex = 0;
  
  for (const folder of folders) {
    const folderType = folder.split('/')[1];
    let template: string;
    
    switch (folderType) {
      case 'components':
        template = fileTemplates.component;
        break;
      case 'services':
        template = fileTemplates.service;
        break;
      case 'utils':
        template = fileTemplates.util;
        break;
      case 'hooks':
        template = fileTemplates.hook;
        break;
      default:
        template = fileTemplates.util; // Default template
    }
    
    for (let i = 0; i < filesPerFolder && currentIndex < fileCount; i++) {
      const fileName = `${folderType}${currentIndex}.ts`;
      const content = template.replace(/\{\{INDEX\}\}/g, currentIndex.toString());
      
      await fs.writeFile(path.join(baseDir, folder, fileName), content);
      currentIndex++;
    }
  }
  
  console.log(`Created ${currentIndex} files across ${folders.length} folders`);
}