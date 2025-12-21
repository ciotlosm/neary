import { describe, it, expect } from 'vitest';
import { NamingConventionService } from './NamingConventionService';

describe('NamingConventionService', () => {
  let service: NamingConventionService;

  beforeEach(() => {
    service = new NamingConventionService();
  });

  describe('analyzeNaming', () => {
    it('should identify unclear abbreviations', () => {
      const filePaths = [
        'src/services/authSvc.ts',
        'src/utils/valUtil.ts',
        'src/components/userMgr.ts'
      ];

      const result = service.analyzeNaming(filePaths);

      expect(result.issuesFound).toBeGreaterThan(0);
      expect(result.issues.some(issue => issue.reason.includes('abbreviations'))).toBe(true);
    });

    it('should identify inconsistent casing', () => {
      const filePaths = [
        'src/services/user_service.ts',
        'src/utils/data-processor.ts'
      ];

      const result = service.analyzeNaming(filePaths);

      expect(result.issues.some(issue => issue.reason.includes('casing'))).toBe(true);
    });

    it('should identify redundant naming', () => {
      const filePaths = [
        'src/services/userService.ts',
        'src/utils/validationUtils.ts'
      ];

      const result = service.analyzeNaming(filePaths);

      expect(result.issues.some(issue => issue.reason.includes('redundant'))).toBe(true);
    });

    it('should not flag well-named files', () => {
      const filePaths = [
        'src/services/user.ts',
        'src/utils/validation.ts',
        'src/components/Card.ts'
      ];

      const result = service.analyzeNaming(filePaths);

      expect(result.issuesFound).toBe(0);
    });
  });

  describe('suggestImprovedName', () => {
    it('should expand abbreviations', () => {
      const result = service.suggestImprovedName('src/services/authSvc.ts');
      expect(result).toBe('authentication');
    });

    it('should remove redundant suffixes', () => {
      const result = service.suggestImprovedName('src/services/userService.ts');
      expect(result).toBe('user');
    });

    it('should fix casing issues', () => {
      const result = service.suggestImprovedName('src/utils/data_processor.ts');
      expect(result).toBe('dataProcessor');
    });

    it('should add appropriate prefixes for hooks', () => {
      const result = service.suggestImprovedName('src/hooks/apiData.ts');
      expect(result).toBe('useApiData');
    });
  });

  describe('suggestFolderName', () => {
    it('should suggest name based on dominant purpose', () => {
      const files = [
        'src/services/userValidation.ts',
        'src/services/dataValidation.ts',
        'src/services/inputValidator.ts'
      ];

      const result = service.suggestFolderName(files);
      expect(result).toBe('validation');
    });

    it('should suggest name based on common terms', () => {
      const files = [
        'src/utils/userFormatter.ts',
        'src/utils/dateFormatter.ts',
        'src/utils/stringFormatter.ts'
      ];

      const result = service.suggestFolderName(files);
      expect(result).toBe('formatting');
    });

    it('should fallback to misc for unrelated files', () => {
      const files = [
        'src/utils/randomThing.ts',
        'src/utils/anotherFile.ts'
      ];

      const result = service.suggestFolderName(files);
      expect(result).toBe('misc');
    });
  });

  describe('private methods', () => {
    it('should extract file name correctly', () => {
      const fileName = (service as any).extractFileName('src/services/userService.ts');
      expect(fileName).toBe('userService');
    });

    it('should detect unclear abbreviations', () => {
      const hasAbbr = (service as any).hasUnclearAbbreviations('authSvc');
      expect(hasAbbr).toBe(true);
    });

    it('should detect inconsistent casing', () => {
      const hasInconsistent = (service as any).hasInconsistentCasing('user_service');
      expect(hasInconsistent).toBe(true);
    });

    it('should detect redundant naming', () => {
      const hasRedundant = (service as any).hasRedundantNaming('userService', 'src/services/userService.ts');
      expect(hasRedundant).toBe(true);
    });

    it('should fix casing properly', () => {
      const fixed = (service as any).fixCasing('user_service_manager');
      expect(fixed).toBe('userServiceManager');
    });

    it('should remove redundancy correctly', () => {
      const cleaned = (service as any).removeRedundancy('userService', 'src/services/userService.ts');
      expect(cleaned).toBe('user');
    });
  });
});