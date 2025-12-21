#!/usr/bin/env node

/**
 * Refactoring Performance Benchmark Script
 * Measures and reports performance characteristics for various codebase sizes
 */

import { IntegratedRefactoringSystem } from '../src/services/IntegratedRefactoringSystem.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

class PerformanceBenchmark {
  constructor() {
    this.results = [];
  }

  async runBenchmarks() {
    console.log('🚀 Refactoring Performance Benchmark Suite\n');
    
    const testSizes = [25, 50, 100, 200, 300, 500];
    
    for (const size of testSizes) {
      console.log(`📊 Testing with ${size} files...`);
      
      try {
        const result = await this.benchmarkSize(size);
        this.results.push(result);
        
        console.log(`✅ ${size} files completed in ${result.totalTime}ms`);
        console.log(`   Analysis: ${result.analysisTime}ms (${result.analysisRate} files/sec)`);
        console.log(`   Memory: ${result.memoryUsage}MB peak\n`);
        
      } catch (error) {
        console.error(`❌ Failed benchmark for ${size} files:`, error.message);
      }
    }
    
    this.generateReport();
  }

  async benchmarkSize(fileCount) {
    const testDir = path.join(projectRoot, 'benchmark-temp', `benchmark-${fileCount}-${Date.now()}`);
    
    try {
      // Setup
      const setupStart = Date.now();
      await this.createTestCodebase(testDir, fileCount);
      const setupTime = Date.now() - setupStart;
      
      const config = {
        maxFileSize: 80,
        maxFilesPerFolder: 8,
        duplicateSimilarityThreshold: 0.8,
        includePatterns: ['src/**/*.ts'],
        excludePatterns: ['**/*.test.*'],
        createBackups: true,
        stopOnError: false
      };
      
      const system = new IntegratedRefactoringSystem(testDir, config);
      
      // Measure baseline memory
      const baselineMemory = process.memoryUsage().heapUsed;
      
      // Analysis benchmark
      const analysisStart = Date.now();
      const analysis = await system.analyzeCodebase();
      const analysisTime = Date.now() - analysisStart;
      const analysisRate = Math.round(analysis.totalFiles / (analysisTime / 1000));
      
      // Memory measurement
      const peakMemory = process.memoryUsage().heapUsed;
      const memoryUsage = Math.round((peakMemory - baselineMemory) / 1024 / 1024);
      
      // Refactoring benchmark (if needed)
      let refactoringTime = 0;
      let operationsCount = 0;
      
      if (analysis.oversizedFiles.length > 0 || analysis.overcrowdedFolders.length > 0) {
        const refactoringStart = Date.now();
        const report = await system.executeRefactoring();
        refactoringTime = Date.now() - refactoringStart;
        operationsCount = report.operations.length;
      }
      
      const totalTime = analysisTime + refactoringTime;
      
      return {
        fileCount,
        setupTime,
        analysisTime,
        analysisRate,
        refactoringTime,
        totalTime,
        memoryUsage,
        operationsCount,
        issuesFound: {
          oversized: analysis.oversizedFiles.length,
          overcrowded: analysis.overcrowdedFolders.length,
          duplicates: analysis.duplicatePatterns.length,
          naming: analysis.namingIssues.length
        }
      };
      
    } finally {
      // Cleanup
      try {
        await fs.rm(testDir, { recursive: true, force: true });
      } catch (error) {
        console.warn(`Cleanup warning for ${testDir}:`, error.message);
      }
    }
  }

  async createTestCodebase(baseDir, fileCount) {
    await fs.mkdir(baseDir, { recursive: true });
    
    const folders = [
      'src/components',
      'src/services',
      'src/utils',
      'src/hooks',
      'src/types'
    ];
    
    // Create folders
    for (const folder of folders) {
      await fs.mkdir(path.join(baseDir, folder), { recursive: true });
    }
    
    // Distribute files across folders
    const filesPerFolder = Math.ceil(fileCount / folders.length);
    let currentIndex = 0;
    
    for (const folder of folders) {
      for (let i = 0; i < filesPerFolder && currentIndex < fileCount; i++) {
        const fileName = `file${currentIndex}.ts`;
        const content = this.generateFileContent(currentIndex, folder);
        
        await fs.writeFile(path.join(baseDir, folder, fileName), content);
        currentIndex++;
      }
    }
  }

  generateFileContent(index, folder) {
    const folderType = folder.split('/')[1];
    const lineCount = 20 + (index % 100); // Vary file sizes to trigger different refactoring needs
    
    let content = `// Generated file ${index} for ${folderType}\n`;
    
    if (folderType === 'services') {
      content += `export class Service${index} {\n`;
      content += `  private data: any[] = [];\n\n`;
      
      for (let i = 0; i < lineCount; i++) {
        content += `  method${i}() { return this.data.filter(item => item.id === ${i}); }\n`;
      }
      
      content += `}\n`;
    } else if (folderType === 'components') {
      content += `import React from 'react';\n\n`;
      content += `export const Component${index} = () => {\n`;
      
      for (let i = 0; i < lineCount; i++) {
        content += `  const value${i} = ${i};\n`;
      }
      
      content += `  return <div>Component ${index}</div>;\n`;
      content += `};\n`;
    } else {
      content += `export const util${index} = {\n`;
      
      for (let i = 0; i < lineCount; i++) {
        content += `  func${i}: () => ${i},\n`;
      }
      
      content += `};\n`;
    }
    
    return content;
  }

  generateReport() {
    console.log('\n📈 PERFORMANCE BENCHMARK REPORT\n');
    console.log('=' .repeat(80));
    
    // Summary table
    console.log('\nFile Count | Analysis Time | Analysis Rate | Memory Usage | Total Time');
    console.log('-'.repeat(70));
    
    this.results.forEach(result => {
      console.log(
        `${result.fileCount.toString().padStart(10)} | ` +
        `${result.analysisTime.toString().padStart(13)}ms | ` +
        `${result.analysisRate.toString().padStart(13)}/s | ` +
        `${result.memoryUsage.toString().padStart(12)}MB | ` +
        `${result.totalTime.toString().padStart(10)}ms`
      );
    });
    
    // Performance analysis
    console.log('\n📊 PERFORMANCE ANALYSIS\n');
    
    if (this.results.length >= 2) {
      const firstResult = this.results[0];
      const lastResult = this.results[this.results.length - 1];
      
      const scalingFactor = lastResult.fileCount / firstResult.fileCount;
      const timeScaling = lastResult.analysisTime / firstResult.analysisTime;
      const memoryScaling = lastResult.memoryUsage / firstResult.memoryUsage;
      
      console.log(`Scaling Factor: ${scalingFactor.toFixed(1)}x files`);
      console.log(`Time Scaling: ${timeScaling.toFixed(1)}x (${timeScaling < scalingFactor ? 'Sub-linear ✅' : 'Super-linear ⚠️'})`);
      console.log(`Memory Scaling: ${memoryScaling.toFixed(1)}x (${memoryScaling < scalingFactor ? 'Sub-linear ✅' : 'Super-linear ⚠️'})`);
      
      // Calculate performance per file
      const avgTimePerFile = this.results.map(r => r.analysisTime / r.fileCount);
      const avgMemoryPerFile = this.results.map(r => r.memoryUsage / r.fileCount);
      
      console.log(`\nAverage Analysis Time per File: ${avgTimePerFile.map(t => Math.round(t)).join(', ')}ms`);
      console.log(`Average Memory per File: ${avgMemoryPerFile.map(m => m.toFixed(1)).join(', ')}MB`);
    }
    
    // Performance thresholds
    console.log('\n🎯 PERFORMANCE THRESHOLDS\n');
    
    const thresholds = {
      analysisRate: 10, // files per second
      memoryPerFile: 2, // MB per file
      maxAnalysisTime: 30000 // 30 seconds for any size
    };
    
    this.results.forEach(result => {
      const memoryPerFile = result.memoryUsage / result.fileCount;
      const meetsRate = result.analysisRate >= thresholds.analysisRate;
      const meetsMemory = memoryPerFile <= thresholds.memoryPerFile;
      const meetsTime = result.analysisTime <= thresholds.maxAnalysisTime;
      
      const status = meetsRate && meetsMemory && meetsTime ? '✅' : '⚠️';
      
      console.log(`${result.fileCount} files: ${status}`);
      if (!meetsRate) console.log(`  - Analysis rate too slow: ${result.analysisRate}/s (min: ${thresholds.analysisRate}/s)`);
      if (!meetsMemory) console.log(`  - Memory usage too high: ${memoryPerFile.toFixed(1)}MB/file (max: ${thresholds.memoryPerFile}MB/file)`);
      if (!meetsTime) console.log(`  - Analysis time too long: ${result.analysisTime}ms (max: ${thresholds.maxAnalysisTime}ms)`);
    });
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS\n');
    
    const largestTest = this.results[this.results.length - 1];
    if (largestTest) {
      if (largestTest.analysisRate < 5) {
        console.log('- Consider implementing file analysis caching');
        console.log('- Optimize AST parsing for better performance');
      }
      
      if (largestTest.memoryUsage / largestTest.fileCount > 1) {
        console.log('- Implement streaming analysis to reduce memory usage');
        console.log('- Consider processing files in batches');
      }
      
      if (largestTest.analysisTime > 20000) {
        console.log('- Consider parallel processing for large codebases');
        console.log('- Implement incremental analysis');
      }
    }
    
    // Save detailed results
    const reportPath = path.join(projectRoot, `performance-report-${Date.now()}.json`);
    fs.writeFile(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      results: this.results,
      thresholds,
      summary: {
        totalTests: this.results.length,
        maxFileCount: Math.max(...this.results.map(r => r.fileCount)),
        avgAnalysisRate: this.results.reduce((sum, r) => sum + r.analysisRate, 0) / this.results.length
      }
    }, null, 2));
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

// Run benchmarks
const benchmark = new PerformanceBenchmark();
benchmark.runBenchmarks().catch(error => {
  console.error('💥 Benchmark failed:', error);
  process.exit(1);
});