import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FolderRestructuringService } from './FolderRestructuringService';

// Mock fs module
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  readdirSync: vi.fn(),
  renameSync: vi.fn()
}));

// Mock ImportPathUpdater
vi.mock('./ImportPathUpdater', () => ({
  ImportPathUpdater: class MockImportPathUpdater {
    async updateImportPaths() {
      return {
        success: true,
        updatedFiles: [],
        totalUpdates: 0,
        errors: []
      };
    }
  }
}));

// Mock NamingConventionService
vi.mock('./NamingConventionService', () => ({
  NamingConventionService: class MockNamingConventionService {
    suggestImprovedName(path: string) {
      const fileName = path.split('/').pop()?.replace('.ts', '') || '';
      return fileName;
    }
  }
}));

describe('FolderRestructuringService', () => {
  let service: FolderRestructuringService;

  beforeEach(() => {
    service = new FolderRestructuringService();
    vi.clearAllMocks();
  });

  describe('categorizeServices', () => {
    it('should categorize API services correctly', () => {
      const files = ['tranzyApiService.ts', 'geocodingService.ts', 'agencyService.ts'];
      const result = service.categorizeServices(files);
      
      expect(result.api).toHaveLength(3);
      expect(result.api[0].name).toBe('tranzyApiService.ts');
      expect(result.api[0].category).toBe('api');
    });

    it('should categorize business logic services correctly', () => {
      const files = ['routePlanningService.ts', 'stationSelector.ts', 'routeAssociationFilter.ts'];
      const result = service.categorizeServices(files);
      
      expect(result.businessLogic).toHaveLength(3);
      expect(result.businessLogic[0].category).toBe('business-logic');
    });

    it('should categorize data processing services correctly', () => {
      const files = ['VehicleTransformationService.ts', 'DuplicationConsolidationEngine.ts'];
      const result = service.categorizeServices(files);
      
      expect(result.dataProcessing).toHaveLength(2);
      expect(result.dataProcessing[0].category).toBe('data-processing');
    });

    it('should categorize utility services correctly', () => {
      const files = ['ErrorReporter.ts', 'GracefulDegradationService.ts'];
      const result = service.categorizeServices(files);
      
      expect(result.utilities).toHaveLength(2);
      expect(result.utilities[0].category).toBe('utilities');
    });
  });

  describe('categorizeUtils', () => {
    it('should categorize validation utils correctly', () => {
      const files = ['validation.ts', 'propValidation.ts'];
      const result = service.categorizeUtils(files);
      
      expect(result.validation).toHaveLength(2);
      expect(result.validation[0].category).toBe('validation');
    });

    it('should categorize formatting utils correctly', () => {
      const files = ['timeFormat.ts'];
      const result = service.categorizeUtils(files);
      
      expect(result.formatting).toHaveLength(1);
      expect(result.formatting[0].category).toBe('formatting');
    });

    it('should categorize data processing utils correctly', () => {
      const files = ['VehicleDataFactory.ts', 'VehicleTypeGuards.ts', 'directionIntelligence.ts'];
      const result = service.categorizeUtils(files);
      
      expect(result.dataProcessing).toHaveLength(3);
      expect(result.dataProcessing[0].category).toBe('data-processing');
    });

    it('should categorize performance utils correctly', () => {
      const files = ['performance.ts', 'cacheUtils.ts', 'debounce.ts', 'retryUtils.ts'];
      const result = service.categorizeUtils(files);
      
      expect(result.performance).toHaveLength(4);
      expect(result.performance[0].category).toBe('performance');
    });

    it('should categorize shared utils correctly', () => {
      const files = ['logger.ts', 'mapUtils.ts', 'distanceUtils.ts'];
      const result = service.categorizeUtils(files);
      
      expect(result.shared).toHaveLength(3);
      expect(result.shared[0].category).toBe('shared');
    });
  });

  describe('enforceFolderLimits', () => {
    it('should create subfolders when files exceed limit', async () => {
      const files = Array.from({ length: 15 }, (_, i) => ({
        name: `file${i}.ts`,
        path: `src/services/file${i}.ts`,
        category: 'test'
      }));

      const fs = await import('fs');
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.mkdirSync).mockReturnValue(undefined);

      const createdFolders = service.enforceFolderLimits(files, 'src/services/test');
      
      expect(createdFolders).toHaveLength(2); // Should create 2 subfolders for 15 files
      expect(files[0].subcategory).toBe('group-1');
      expect(files[10].subcategory).toBe('group-2');
    });

    it('should not create subfolders when files are within limit', () => {
      const files = Array.from({ length: 5 }, (_, i) => ({
        name: `file${i}.ts`,
        path: `src/services/file${i}.ts`,
        category: 'test'
      }));

      const createdFolders = service.enforceFolderLimits(files, 'src/services/test');
      
      expect(createdFolders).toHaveLength(0);
      expect(files[0].subcategory).toBeUndefined();
    });
  });

  describe('createRestructuringPlan', () => {
    it('should create a complete restructuring plan', async () => {
      // Mock file system calls
      const fs = await import('fs');
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync)
        .mockReturnValueOnce(['tranzyApiService.ts', 'stationSelector.ts', 'index.ts'] as any)
        .mockReturnValueOnce(['validation.ts', 'timeFormat.ts', 'index.ts'] as any);

      const plan = service.createRestructuringPlan();
      
      expect(plan.services).toBeDefined();
      expect(plan.utils).toBeDefined();
      expect(plan.services.api).toHaveLength(1);
      expect(plan.services.businessLogic).toHaveLength(1);
      expect(plan.utils.validation).toHaveLength(1);
      expect(plan.utils.formatting).toHaveLength(1);
    });
  });

  describe('executeRestructuring', () => {
    it('should execute restructuring successfully', async () => {
      const plan = {
        services: {
          api: [{
            name: 'tranzyApiService.ts',
            path: 'src/services/tranzyApiService.ts',
            category: 'api'
          }],
          businessLogic: [],
          dataProcessing: [],
          utilities: []
        },
        utils: {
          validation: [{
            name: 'validation.ts',
            path: 'src/utils/validation.ts',
            category: 'validation'
          }],
          formatting: [],
          dataProcessing: [],
          performance: [],
          shared: []
        }
      };

      const fs = await import('fs');
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
      vi.mocked(fs.renameSync).mockReturnValue(undefined);

      const result = await service.executeRestructuring(plan);
      
      expect(result.success).toBe(true);
      expect(result.movedFiles).toHaveLength(2);
      expect(result.createdFolders).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle errors during restructuring', async () => {
      const plan = {
        services: {
          api: [{
            name: 'tranzyApiService.ts',
            path: 'src/services/tranzyApiService.ts',
            category: 'api'
          }],
          businessLogic: [],
          dataProcessing: [],
          utilities: []
        },
        utils: {
          validation: [],
          formatting: [],
          dataProcessing: [],
          performance: [],
          shared: []
        }
      };

      const fs = await import('fs');
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
      vi.mocked(fs.renameSync).mockImplementation(() => {
        throw new Error('File move failed');
      });

      const result = await service.executeRestructuring(plan);
      
      expect(result.success).toBe(true); // Service continues despite individual file errors
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});