/**
 * Tests for FileFolderSizeOptimizer
 * Validates Requirements: 2.2, 2.4, 3.2, 3.4, 3.5
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as path from 'path';
import { FileFolderSizeOptimizer } from './FileFolderSizeOptimizer';
import type { FileInfo, FolderInfo } from '../types/architectureSimplification';

// Mock fs module
vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  readdirSync: vi.fn(),
  statSync: vi.fn(),
}));

// Import fs after mocking
import * as fs from 'fs';
const mockFs = vi.mocked(fs);

describe('FileFolderSizeOptimizer', () => {
  let optimizer: FileFolderSizeOptimizer;
  const mockRootPath = '/test/project';

  beforeEach(() => {
    vi.clearAllMocks();
    optimizer = new FileFolderSizeOptimizer(mockRootPath);
  });

  describe('createFileSplitPlan', () => {
    it('should create split plan for oversized file', async () => {
      const oversizedFile: FileInfo = {
        path: 'src/LargeComponent.tsx',
        lineCount: 250,
        complexity: 15,
        dependencies: ['react', './utils'],
        exports: ['LargeComponent', 'helper'],
        sizeBytes: 10000,
        fileType: 'tsx',
        lastModified: new Date()
      };

      // Mock file content with functions and classes
      const mockContent = `
import React from 'react';
import { helper } from './utils';

export class LargeComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }
  
  handleClick() {
    this.setState({ count: this.state.count + 1 });
  }
  
  handleReset() {
    this.setState({ count: 0 });
  }
  
  componentDidMount() {
    console.log('Component mounted');
  }
  
  componentWillUnmount() {
    console.log('Component will unmount');
  }
  
  render() {
    return (
      <div>
        <h1>Large Component</h1>
        <p>Count: {this.state.count}</p>
        <button onClick={this.handleClick}>Increment</button>
        <button onClick={this.handleReset}>Reset</button>
      </div>
    );
  }
}

export function helper() {
  const data = fetchData();
  const processed = processData(data);
  const validated = validateData(processed);
  const formatted = formatData(validated);
  const cached = cacheData(formatted);
  const optimized = optimizeData(cached);
  const finalized = finalizeData(optimized);
  const result = transformData(finalized);
  const output = generateOutput(result);
  const cleaned = cleanupData(output);
  const verified = verifyData(cleaned);
  const prepared = prepareData(verified);
  const delivered = deliverData(prepared);
  const logged = logData(delivered);
  const completed = completeData(logged);
  const success = markSuccess(completed);
  const notification = sendNotification(success);
  const archived = archiveData(notification);
  const summary = generateSummary(archived);
  const report = createReport(summary);
  const final = finalizeReport(report);
  return final;
}
`;

      mockFs.readFileSync.mockReturnValue(mockContent);

      const splitPlan = await optimizer.createFileSplitPlan(oversizedFile);

      expect(splitPlan.type).toBe('split');
      expect(splitPlan.affectedFiles).toContain('src/LargeComponent.tsx');
      expect(splitPlan.riskLevel).toBe('medium');
      expect(splitPlan.parameters.config?.splitPoints).toBeDefined();
    });

    it('should handle files with no split opportunities', async () => {
      const smallFile: FileInfo = {
        path: 'src/SmallComponent.tsx',
        lineCount: 50,
        complexity: 3,
        dependencies: ['react'],
        exports: ['SmallComponent'],
        sizeBytes: 2000,
        fileType: 'tsx',
        lastModified: new Date()
      };

      const mockContent = `
import React from 'react';

export function SmallComponent() {
  return <div>Small</div>;
}
`;

      mockFs.readFileSync.mockReturnValue(mockContent);

      const splitPlan = await optimizer.createFileSplitPlan(smallFile);

      expect(splitPlan.type).toBe('split');
      expect(splitPlan.riskLevel).toBe('low');
    });
  });

  describe('createFolderReorganizationPlan', () => {
    it('should create reorganization plan for overcrowded folder', async () => {
      const overcrowdedFolder: FolderInfo = {
        path: 'src/components',
        fileCount: 15,
        subfolderCount: 0,
        totalSize: 50000,
        files: [
          'Button.tsx', 'Input.tsx', 'Modal.tsx',
          'UserService.ts', 'ApiService.ts',
          'userUtils.ts', 'dateUtils.ts',
          'UserComponent.tsx', 'AdminComponent.tsx',
          'types.ts', 'interfaces.ts',
          'UserStore.ts', 'AppStore.ts',
          'useUser.ts', 'useApi.ts'
        ],
        subfolders: []
      };

      // Mock file system calls to return the files from the folder info
      mockFs.readdirSync.mockReturnValue(
        overcrowdedFolder.files.map(name => ({ 
          name, 
          isFile: () => true, 
          isDirectory: () => false 
        })) as any
      );

      mockFs.readFileSync.mockReturnValue('export const Component = () => {};');
      mockFs.statSync.mockReturnValue({ size: 1000, mtime: new Date() } as any);

      const reorganizationPlan = await optimizer.createFolderReorganizationPlan(overcrowdedFolder);

      expect(reorganizationPlan.type).toBe('move');
      expect(reorganizationPlan.parameters.config?.reorganizationPlan).toBeDefined();
      expect(reorganizationPlan.riskLevel).toBe('medium');
      
      // The plan should have some affected files (at minimum the files being reorganized)
      const reorganization = reorganizationPlan.parameters.config?.reorganizationPlan;
      expect(reorganization.suggestedStructure).toBeDefined();
    });

    it('should group files by functionality', async () => {
      const folder: FolderInfo = {
        path: 'src/mixed',
        fileCount: 12,
        subfolderCount: 0,
        totalSize: 30000,
        files: [
          'UserComponent.tsx', 'AdminComponent.tsx',
          'userService.ts', 'authService.ts',
          'userUtils.ts', 'stringUtils.ts',
          'User.types.ts', 'Api.types.ts',
          'userHook.ts', 'apiHook.ts',
          'userStore.ts', 'appStore.ts'
        ],
        subfolders: []
      };

      // Create mock FileInfo objects that match the folder files
      const mockFiles: FileInfo[] = folder.files.map(fileName => ({
        path: path.join(folder.path, fileName),
        lineCount: 50,
        complexity: 5,
        dependencies: [],
        exports: [],
        sizeBytes: 1000,
        fileType: path.extname(fileName).slice(1),
        lastModified: new Date()
      }));

      // Mock the file system to return our mock files
      mockFs.readdirSync.mockReturnValue(
        folder.files.map(name => ({ 
          name, 
          isFile: () => true, 
          isDirectory: () => false 
        })) as any
      );

      mockFs.readFileSync.mockReturnValue('export const test = () => {};');
      mockFs.statSync.mockReturnValue({ size: 1000, mtime: new Date() } as any);

      // Override the getDetailedFilesInFolder method to return our mock files
      const originalMethod = (optimizer as any).getDetailedFilesInFolder;
      (optimizer as any).getDetailedFilesInFolder = async () => mockFiles;

      const plan = await optimizer.createFolderReorganizationPlan(folder);
      const reorganization = plan.parameters.config?.reorganizationPlan;

      // Restore the original method
      (optimizer as any).getDetailedFilesInFolder = originalMethod;

      expect(reorganization).toBeDefined();
      expect(reorganization.suggestedStructure).toBeDefined();
      
      // Should have some organization structure
      const structure = reorganization.suggestedStructure;
      expect(structure.name).toBe('mixed');
      
      // Should have either subfolders or files organized
      const totalOrganized = structure.subfolders.length + structure.files.length;
      expect(totalOrganized).toBeGreaterThan(0);
    });
  });

  describe('enforceSizeLimits', () => {
    it('should create comprehensive plan for size limit enforcement', async () => {
      const oversizedFiles: FileInfo[] = [
        {
          path: 'src/LargeFile1.ts',
          lineCount: 250,
          complexity: 20,
          dependencies: [],
          exports: [],
          sizeBytes: 10000,
          fileType: 'ts',
          lastModified: new Date()
        },
        {
          path: 'src/LargeFile2.ts',
          lineCount: 300,
          complexity: 25,
          dependencies: [],
          exports: [],
          sizeBytes: 12000,
          fileType: 'ts',
          lastModified: new Date()
        }
      ];

      const overcrowdedFolders: FolderInfo[] = [
        {
          path: 'src/components',
          fileCount: 15,
          subfolderCount: 0,
          totalSize: 50000,
          files: Array.from({ length: 15 }, (_, i) => `Component${i}.tsx`),
          subfolders: []
        }
      ];

      // Mock file system operations
      mockFs.readFileSync.mockReturnValue('export const test = () => {};');
      mockFs.readdirSync.mockReturnValue([]);

      const plan = await optimizer.enforceSizeLimits(oversizedFiles, overcrowdedFolders);

      expect(plan.operations.length).toBe(3); // 2 split + 1 reorganize
      expect(plan.operations.filter(op => op.type === 'split')).toHaveLength(2);
      expect(plan.operations.filter(op => op.type === 'move')).toHaveLength(1);
      expect(plan.executionOrder).toBeDefined();
      expect(plan.impact).toBeDefined();
    });

    it('should handle empty inputs gracefully', async () => {
      const plan = await optimizer.enforceSizeLimits([], []);

      expect(plan.operations).toHaveLength(0);
      expect(plan.executionOrder).toHaveLength(0);
      expect(plan.impact.filesAffected).toBe(0);
    });
  });

  describe('updateImportPaths', () => {
    it('should update import paths correctly', async () => {
      const importUpdates = [
        {
          file: 'src/App.tsx',
          oldPath: './components/LargeComponent',
          newPath: './components/LargeComponent/index',
          symbols: ['LargeComponent']
        }
      ];

      const originalContent = `
import React from 'react';
import { LargeComponent } from './components/LargeComponent';

export function App() {
  return <LargeComponent />;
}
`;

      const expectedContent = `
import React from 'react';
import { LargeComponent } from './components/LargeComponent/index';

export function App() {
  return <LargeComponent />;
}
`;

      mockFs.readFileSync.mockReturnValue(originalContent);
      let writtenContent = '';
      mockFs.writeFileSync.mockImplementation((path, content) => {
        writtenContent = content as string;
      });

      await optimizer.updateImportPaths(importUpdates);

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        path.join(mockRootPath, 'src/App.tsx'),
        expectedContent,
        'utf-8'
      );
    });

    it('should handle multiple import updates in single file', async () => {
      const importUpdates = [
        {
          file: 'src/App.tsx',
          oldPath: './utils/helper',
          newPath: './utils/helpers/helper',
          symbols: ['helper']
        },
        {
          file: 'src/App.tsx',
          oldPath: './components/Button',
          newPath: './components/ui/Button',
          symbols: ['Button']
        }
      ];

      const originalContent = `
import { helper } from './utils/helper';
import { Button } from './components/Button';
`;

      mockFs.readFileSync.mockReturnValue(originalContent);

      await optimizer.updateImportPaths(importUpdates);

      expect(mockFs.writeFileSync).toHaveBeenCalledTimes(2);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle file read errors gracefully', async () => {
      const file: FileInfo = {
        path: 'src/NonExistent.ts',
        lineCount: 100,
        complexity: 5,
        dependencies: [],
        exports: [],
        sizeBytes: 5000,
        fileType: 'ts',
        lastModified: new Date()
      };

      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      const splitPlan = await optimizer.createFileSplitPlan(file);

      expect(splitPlan.type).toBe('split');
      expect(splitPlan.riskLevel).toBe('low'); // Should default to low risk when no split points found
    });

    it('should handle complex dependency chains', async () => {
      const file: FileInfo = {
        path: 'src/ComplexFile.ts',
        lineCount: 300,
        complexity: 30,
        dependencies: ['react', 'lodash', './utils', './types', './services'],
        exports: ['ComplexClass', 'helper1', 'helper2'],
        sizeBytes: 15000,
        fileType: 'ts',
        lastModified: new Date()
      };

      const mockContent = `
import React from 'react';
import _ from 'lodash';
import { util1, util2 } from './utils';
import { Type1, Type2 } from './types';

export class ComplexClass {
  constructor(props) {
    this.props = props;
    this.state = { initialized: false };
  }
  
  initialize() {
    this.state.initialized = true;
    this.setupEventListeners();
    this.loadInitialData();
    this.configureSettings();
    this.validateConfiguration();
    this.establishConnections();
    this.registerHandlers();
    this.startProcessing();
    this.enableFeatures();
    this.finalizeSetup();
  }
  
  process() {
    const data = this.getData();
    const validated = this.validate(data);
    const transformed = this.transform(validated);
    const optimized = this.optimize(transformed);
    const cached = this.cache(optimized);
    const delivered = this.deliver(cached);
    return delivered;
  }
  
  cleanup() {
    this.removeEventListeners();
    this.clearCache();
    this.closeConnections();
    this.resetState();
    this.finalizeCleanup();
  }
}

export function helper1() {
  const step1 = util1.process();
  const step2 = util1.validate(step1);
  const step3 = util1.transform(step2);
  const step4 = util1.optimize(step3);
  const step5 = util1.cache(step4);
  const step6 = util1.deliver(step5);
  const step7 = util1.finalize(step6);
  const step8 = util1.cleanup(step7);
  const step9 = util1.verify(step8);
  const step10 = util1.complete(step9);
  const step11 = util1.archive(step10);
  const step12 = util1.report(step11);
  const step13 = util1.notify(step12);
  const step14 = util1.log(step13);
  const step15 = util1.finish(step14);
  const step16 = util1.success(step15);
  const step17 = util1.done(step16);
  const step18 = util1.end(step17);
  const step19 = util1.final(step18);
  const step20 = util1.ultimate(step19);
  return step20;
}

export function helper2() {
  const data = util2.getData();
  const processed = util2.processData(data);
  const validated = util2.validateData(processed);
  const transformed = util2.transformData(validated);
  const optimized = util2.optimizeData(transformed);
  const cached = util2.cacheData(optimized);
  const delivered = util2.deliverData(cached);
  const finalized = util2.finalizeData(delivered);
  const completed = util2.completeData(finalized);
  const archived = util2.archiveData(completed);
  const reported = util2.reportData(archived);
  const notified = util2.notifyData(reported);
  const logged = util2.logData(notified);
  const finished = util2.finishData(logged);
  const succeeded = util2.successData(finished);
  const done = util2.doneData(succeeded);
  const ended = util2.endData(done);
  const final = util2.finalData(ended);
  const ultimate = util2.ultimateData(final);
  return ultimate;
}
`;

      mockFs.readFileSync.mockReturnValue(mockContent);

      const splitPlan = await optimizer.createFileSplitPlan(file);

      expect(splitPlan.riskLevel).toBe('high'); // High complexity should result in high risk
      expect(splitPlan.estimatedTime).toBeGreaterThan(5000); // Should take longer due to complexity
    });
  });
});