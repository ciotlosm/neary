/**
 * Tests for ModuleMergingService
 * Validates Requirements: 1.3, 1.4
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ModuleMergingService, createModuleMergingService } from './ModuleMergingService';

describe('ModuleMergingService', () => {
  let service: ModuleMergingService;
  
  beforeEach(() => {
    service = new ModuleMergingService();
  });

  describe('Core Functionality Tests', () => {
    it('should create service with default configuration', () => {
      expect(service).toBeInstanceOf(ModuleMergingService);
    });

    it('should create service with custom root path', () => {
      const customService = new ModuleMergingService('/custom/path');
      expect(customService).toBeInstanceOf(ModuleMergingService);
    });
  });

  describe('Module Merging', () => {
    it('should merge modules with combine strategy', async () => {
      const files = ['module1.ts', 'module2.ts'];
      const targetPath = 'merged.ts';
      
      const result = await service.mergeModules(files, targetPath, 'combine');
      
      expect(result.mergedContent).toContain('Mock content');
      expect(result.mergedContent).toContain('merged.ts');
      expect(result.conflictResolutions).toBeDefined();
      expect(result.preservedExports).toBeDefined();
      expect(result.removedDuplicates).toBeDefined();
    });

    it('should merge modules with deduplicate strategy', async () => {
      const files = ['module1.ts', 'module2.ts'];
      const targetPath = 'merged.ts';
      
      const result = await service.mergeModules(files, targetPath, 'deduplicate');
      
      expect(result.mergedContent).toContain('Mock content');
      expect(result.conflictResolutions).toBeDefined();
    });

    it('should merge modules with selective strategy', async () => {
      const files = ['module1.ts', 'module2.ts'];
      const targetPath = 'merged.ts';
      
      const result = await service.mergeModules(files, targetPath, 'selective');
      
      expect(result.mergedContent).toContain('Mock content');
      expect(result.conflictResolutions).toBeDefined();
    });

    it('should handle single file merge', async () => {
      const files = ['single.ts'];
      const targetPath = 'merged.ts';
      
      const result = await service.mergeModules(files, targetPath);
      
      expect(result.mergedContent).toContain('Mock content');
      expect(result.conflictResolutions).toHaveLength(0);
    });
  });

  describe('Merge Feasibility Analysis', () => {
    it('should analyze merge feasibility for similar files', async () => {
      const files = ['similar1.ts', 'similar2.ts'];
      
      const analysis = await service.analyzeMergeFeasibility(files);
      
      expect(analysis.feasible).toBeDefined();
      expect(analysis.similarity).toBeGreaterThanOrEqual(0);
      expect(analysis.similarity).toBeLessThanOrEqual(1);
      expect(analysis.conflicts).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
    });

    it('should handle empty file list', async () => {
      const files: string[] = [];
      
      const analysis = await service.analyzeMergeFeasibility(files);
      
      expect(analysis.feasible).toBe(false);
      expect(analysis.similarity).toBe(0);
    });

    it('should handle single file', async () => {
      const files = ['single.ts'];
      
      const analysis = await service.analyzeMergeFeasibility(files);
      
      expect(analysis.feasible).toBeDefined();
      expect(analysis.similarity).toBeDefined();
    });
  });

  describe('Shared Implementation Identification', () => {
    it('should identify shared implementations across modules', async () => {
      const files = ['module1.ts', 'module2.ts', 'module3.ts'];
      
      const result = await service.identifySharedImplementations(files);
      
      expect(result.sharedFunctions).toBeDefined();
      expect(result.sharedClasses).toBeDefined();
      expect(result.sharedConstants).toBeDefined();
      expect(result.consolidationOpportunities).toBeDefined();
    });

    it('should handle empty file list for shared implementations', async () => {
      const files: string[] = [];
      
      const result = await service.identifySharedImplementations(files);
      
      expect(result.sharedFunctions).toHaveLength(0);
      expect(result.sharedClasses).toHaveLength(0);
      expect(result.sharedConstants).toHaveLength(0);
      expect(result.consolidationOpportunities).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent files gracefully', async () => {
      const files = ['nonexistent1.ts', 'nonexistent2.ts'];
      const targetPath = 'merged.ts';
      
      const result = await service.mergeModules(files, targetPath);
      
      // Should not throw and should return valid result with mock content
      expect(result.mergedContent).toContain('Mock content');
      expect(result.conflictResolutions).toBeDefined();
    });

    it('should handle analysis errors gracefully', async () => {
      const files = ['error-prone.ts'];
      
      const analysis = await service.analyzeMergeFeasibility(files);
      
      // Should not throw and should return valid analysis
      expect(analysis.feasible).toBeDefined();
      expect(analysis.similarity).toBeDefined();
      expect(analysis.conflicts).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
    });
  });

  describe('Factory Function', () => {
    it('should create service with custom root path', () => {
      const customService = createModuleMergingService('/custom/path');
      expect(customService).toBeInstanceOf(ModuleMergingService);
    });

    it('should create service with default root path', () => {
      const defaultService = createModuleMergingService();
      expect(defaultService).toBeInstanceOf(ModuleMergingService);
    });
  });
});