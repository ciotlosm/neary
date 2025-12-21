/**
 * ImportPathResolver Tests
 * Tests import path resolution and updates when files are moved
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ImportPathResolver } from './ImportPathResolver.js';
import { FileSystemOperations } from './FileSystemOperations.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('ImportPathResolver', () => {
  let resolver: ImportPathResolver;
  let fsOps: FileSystemOperations;
  let testDir: string;

  beforeEach(async () => {
    testDir = path.join(__dirname, '../../test-temp', `import-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
    resolver = new ImportPathResolver(testDir);
    fsOps = new FileSystemOperations(testDir);
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Import Path Updates', () => {
    it('should update relative import paths when files are moved', async () => {
      // Create source files
      const utilFile = 'src/utils/helper.ts';
      const serviceFile = 'src/services/userService.ts';
      
      const utilContent = `
export const helperFunction = () => 'helper';
`;
      
      const serviceContent = `
import { helperFunction } from '../utils/helper';

export class UserService {
  getHelper() {
    return helperFunction();
  }
}
`;

      await fsOps.createFile(utilFile, utilContent);
      await fsOps.createFile(serviceFile, serviceContent);

      // Move the helper file
      const newUtilFile = 'src/shared/helper.ts';
      const pathMappings = [{
        oldPath: utilFile,
        newPath: newUtilFile
      }];

      // Move the actual file
      await fsOps.moveFile(utilFile, newUtilFile);

      // Update import paths
      const updates = await resolver.updateImportPaths(pathMappings);

      // Check that the service file was updated
      const updatedServiceContent = await fsOps.readFile(serviceFile);
      expect(updatedServiceContent).toContain('../shared/helper');
      expect(updatedServiceContent).not.toContain('../utils/helper');

      expect(updates.length).toBeGreaterThan(0);
      const serviceUpdate = updates.find(u => u.filePath.includes('userService'));
      expect(serviceUpdate).toBeDefined();
      expect(serviceUpdate?.newImport).toBe('../shared/helper');
    });

    it('should handle multiple import updates in one file', async () => {
      const file1 = 'src/utils/util1.ts';
      const file2 = 'src/utils/util2.ts';
      const consumerFile = 'src/services/consumer.ts';

      await fsOps.createFile(file1, 'export const util1 = "util1";');
      await fsOps.createFile(file2, 'export const util2 = "util2";');
      
      const consumerContent = `
import { util1 } from '../utils/util1';
import { util2 } from '../utils/util2';

export const combined = util1 + util2;
`;
      await fsOps.createFile(consumerFile, consumerContent);

      // Move both utility files
      const newFile1 = 'src/shared/util1.ts';
      const newFile2 = 'src/shared/util2.ts';
      
      await fsOps.moveFile(file1, newFile1);
      await fsOps.moveFile(file2, newFile2);

      const pathMappings = [
        { oldPath: file1, newPath: newFile1 },
        { oldPath: file2, newPath: newFile2 }
      ];

      await resolver.updateImportPaths(pathMappings);

      const updatedContent = await fsOps.readFile(consumerFile);
      expect(updatedContent).toContain('../shared/util1');
      expect(updatedContent).toContain('../shared/util2');
      expect(updatedContent).not.toContain('../utils/util1');
      expect(updatedContent).not.toContain('../utils/util2');
    });

    it('should update imports when importing file is moved', async () => {
      const utilFile = 'src/utils/helper.ts';
      const serviceFile = 'src/services/userService.ts';
      
      await fsOps.createFile(utilFile, 'export const helper = "helper";');
      
      const serviceContent = `
import { helper } from '../utils/helper';
export const service = helper;
`;
      await fsOps.createFile(serviceFile, serviceContent);

      // Move the service file to a different location
      const newServiceFile = 'src/api/userService.ts';
      await fsOps.moveFile(serviceFile, newServiceFile);

      const pathMappings = [{
        oldPath: serviceFile,
        newPath: newServiceFile
      }];

      await resolver.updateImportPaths(pathMappings);

      const updatedContent = await fsOps.readFile(newServiceFile);
      expect(updatedContent).toContain('../utils/helper'); // Path should be updated for new location
    });
  });

  describe('Barrel Export Management', () => {
    it('should create barrel exports for reorganized folders', async () => {
      const folderPath = 'src/services';
      const subfolders = ['api', 'business-logic', 'utilities'];

      // Create some files in subfolders
      await fsOps.createFile('src/services/api/userApi.ts', 'export const userApi = {};');
      await fsOps.createFile('src/services/api/productApi.ts', 'export const productApi = {};');
      await fsOps.createFile('src/services/business-logic/userLogic.ts', 'export const userLogic = {};');

      await resolver.createBarrelExports(folderPath, subfolders);

      // Check main index.ts
      const mainIndex = await fsOps.readFile('src/services/index.ts');
      expect(mainIndex).toContain("export * from './api';");
      expect(mainIndex).toContain("export * from './business-logic';");
      expect(mainIndex).toContain("export * from './utilities';");

      // Check subfolder index.ts
      const apiIndex = await fsOps.readFile('src/services/api/index.ts');
      expect(apiIndex).toContain("export * from './userApi';");
      expect(apiIndex).toContain("export * from './productApi';");
    });

    it('should update existing barrel exports', async () => {
      const indexFile = 'src/services/index.ts';
      const originalContent = `
export * from './userService';
export * from './productService';
`;
      
      await fsOps.createFile(indexFile, originalContent);

      // Simulate moving services to subfolders
      const pathMappings = [
        { oldPath: 'src/services/userService.ts', newPath: 'src/services/api/userService.ts' },
        { oldPath: 'src/services/productService.ts', newPath: 'src/services/api/productService.ts' }
      ];

      await resolver.updateBarrelExports(indexFile, pathMappings);

      const updatedContent = await fsOps.readFile(indexFile);
      expect(updatedContent).toContain('./api/userService');
      expect(updatedContent).toContain('./api/productService');
    });
  });

  describe('Import Validation', () => {
    it('should validate that imports are resolvable', async () => {
      const file1 = 'src/valid.ts';
      const file2 = 'src/invalid.ts';
      
      // Create a valid file with resolvable import
      await fsOps.createFile('src/helper.ts', 'export const helper = true;');
      await fsOps.createFile(file1, "import { helper } from './helper';");
      
      // Create an invalid file with non-resolvable import
      await fsOps.createFile(file2, "import { missing } from './non-existent';");

      const results = await resolver.validateImports([file1, file2]);

      expect(results.length).toBe(1); // Only invalid file should have errors
      expect(results[0].file).toBe(file2);
      expect(results[0].errors.length).toBeGreaterThan(0);
      expect(results[0].errors[0]).toContain('Cannot resolve import');
    });

    it('should handle different file extensions', async () => {
      const tsFile = 'src/component.tsx';
      
      // Create files with different extensions
      await fsOps.createFile('src/utils.ts', 'export const util = true;');
      await fsOps.createFile('src/types/index.ts', 'export type MyType = string;');
      
      const content = `
import { util } from './utils'; // Should resolve to utils.ts
import { MyType } from './types'; // Should resolve to types/index.ts
`;
      await fsOps.createFile(tsFile, content);

      const results = await resolver.validateImports([tsFile]);
      expect(results.length).toBe(0); // No errors expected
    });
  });

  describe('Folder Reorganization Mappings', () => {
    it('should generate correct mappings for folder reorganization', async () => {
      const folderPath = 'src/services';
      
      // Create some service files
      await fsOps.createFile('src/services/userService.ts', 'export const userService = {};');
      await fsOps.createFile('src/services/apiService.ts', 'export const apiService = {};');
      await fsOps.createFile('src/services/utilityHelper.ts', 'export const utilityHelper = {};');

      const subfolderMappings = {
        'userService.ts': 'business-logic',
        'apiService.ts': 'api',
        'utilityHelper.ts': 'utilities'
      };

      const mappings = await resolver.generateFolderReorganizationMappings(folderPath, subfolderMappings);

      expect(mappings.length).toBe(3);
      
      const userMapping = mappings.find(m => m.oldPath.includes('userService'));
      expect(userMapping?.newPath).toContain('business-logic/userService.ts');
      
      const apiMapping = mappings.find(m => m.oldPath.includes('apiService'));
      expect(apiMapping?.newPath).toContain('api/apiService.ts');
    });
  });

  describe('Error Handling', () => {
    it('should handle files that cannot be analyzed', async () => {
      const invalidFile = 'src/invalid.ts';
      await fsOps.createFile(invalidFile, 'this is not valid typescript {{{');

      const pathMappings = [{ oldPath: 'src/old.ts', newPath: 'src/new.ts' }];
      
      // Should not throw, but may not update the invalid file
      await expect(resolver.updateImportPaths(pathMappings)).resolves.not.toThrow();
    });

    it('should skip external module imports', async () => {
      const file = 'src/external.ts';
      const content = `
import React from 'react';
import { lodash } from 'lodash';
import { localUtil } from './utils';
`;
      
      await fsOps.createFile(file, content);
      await fsOps.createFile('src/utils.ts', 'export const localUtil = true;');

      const pathMappings = [{ oldPath: 'src/utils.ts', newPath: 'src/shared/utils.ts' }];
      await fsOps.moveFile('src/utils.ts', 'src/shared/utils.ts');
      
      const updates = await resolver.updateImportPaths(pathMappings);

      const updatedContent = await fsOps.readFile(file);
      
      // External imports should remain unchanged
      expect(updatedContent).toContain("import React from 'react'");
      expect(updatedContent).toContain("import { lodash } from 'lodash'");
      
      // Local import should be updated
      expect(updatedContent).toContain('./shared/utils');
    });
  });
});