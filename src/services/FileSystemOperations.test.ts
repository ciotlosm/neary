/**
 * FileSystemOperations Tests
 * Tests the actual file system operations with safety checks
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FileSystemOperations } from './FileSystemOperations.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('FileSystemOperations', () => {
  let fsOps: FileSystemOperations;
  let testDir: string;

  beforeEach(async () => {
    // Create a temporary test directory
    testDir = path.join(__dirname, '../../test-temp', `test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
    fsOps = new FileSystemOperations(testDir);
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Basic File Operations', () => {
    it('should create a file with content', async () => {
      const filePath = 'test.ts';
      const content = 'export const test = "hello";';

      await fsOps.createFile(filePath, content);

      const exists = await fsOps.fileExists(filePath);
      expect(exists).toBe(true);

      const readContent = await fsOps.readFile(filePath);
      expect(readContent).toBe(content);
    });

    it('should create nested directories automatically', async () => {
      const filePath = 'nested/deep/test.ts';
      const content = 'export const nested = true;';

      await fsOps.createFile(filePath, content);

      const exists = await fsOps.fileExists(filePath);
      expect(exists).toBe(true);
    });

    it('should move files correctly', async () => {
      const sourcePath = 'source.ts';
      const targetPath = 'target/moved.ts';
      const content = 'export const moved = true;';

      await fsOps.createFile(sourcePath, content);
      await fsOps.moveFile(sourcePath, targetPath);

      const sourceExists = await fsOps.fileExists(sourcePath);
      const targetExists = await fsOps.fileExists(targetPath);
      
      expect(sourceExists).toBe(false);
      expect(targetExists).toBe(true);

      const readContent = await fsOps.readFile(targetPath);
      expect(readContent).toBe(content);
    });

    it('should modify file content', async () => {
      const filePath = 'modify.ts';
      const originalContent = 'export const original = true;';
      const newContent = 'export const modified = true;';

      await fsOps.createFile(filePath, originalContent);
      await fsOps.modifyFile(filePath, newContent);

      const readContent = await fsOps.readFile(filePath);
      expect(readContent).toBe(newContent);
    });

    it('should delete files', async () => {
      const filePath = 'delete.ts';
      const content = 'export const toDelete = true;';

      await fsOps.createFile(filePath, content);
      expect(await fsOps.fileExists(filePath)).toBe(true);

      await fsOps.deleteFile(filePath);
      expect(await fsOps.fileExists(filePath)).toBe(false);
    });
  });

  describe('Directory Operations', () => {
    it('should create directories', async () => {
      const dirPath = 'new/directory';

      await fsOps.createDirectory(dirPath);

      const exists = await fsOps.directoryExists(dirPath);
      expect(exists).toBe(true);
    });

    it('should list files in directory', async () => {
      await fsOps.createFile('file1.ts', 'content1');
      await fsOps.createFile('file2.ts', 'content2');
      await fsOps.createFile('subdir/file3.ts', 'content3');

      const files = await fsOps.listFiles('.', false);
      expect(files).toContain('file1.ts');
      expect(files).toContain('file2.ts');
      expect(files).not.toContain('subdir/file3.ts'); // Not recursive

      const recursiveFiles = await fsOps.listFiles('.', true);
      expect(recursiveFiles).toContain('file1.ts');
      expect(recursiveFiles).toContain('file2.ts');
      expect(recursiveFiles).toContain('subdir/file3.ts'); // Recursive
    });

    it('should get file stats', async () => {
      const filePath = 'stats.ts';
      const content = 'line1\nline2\nline3\n';

      await fsOps.createFile(filePath, content);

      const stats = await fsOps.getFileStats(filePath);
      expect(stats.lines).toBe(4); // 3 lines + empty line at end
      expect(stats.size).toBeGreaterThan(0);
      expect(stats.modified).toBeInstanceOf(Date);
    });
  });

  describe('Backup and Restore', () => {
    it('should create and restore backups', async () => {
      const filePath = 'backup-test.ts';
      const originalContent = 'export const original = true;';
      const modifiedContent = 'export const modified = true;';

      // Create original file
      await fsOps.createFile(filePath, originalContent);

      // Create backup
      const operations = [{
        type: 'modify' as const,
        sourcePath: filePath,
        targetPath: filePath,
        content: modifiedContent
      }];

      const backupId = await fsOps.createBackup(operations);
      expect(backupId).toBeTruthy();

      // Modify file
      await fsOps.modifyFile(filePath, modifiedContent);
      expect(await fsOps.readFile(filePath)).toBe(modifiedContent);

      // Restore backup
      await fsOps.restoreBackup(backupId);
      expect(await fsOps.readFile(filePath)).toBe(originalContent);
    });

    it('should execute operations atomically', async () => {
      const operations = [
        {
          type: 'create' as const,
          targetPath: 'atomic1.ts',
          content: 'export const atomic1 = true;'
        },
        {
          type: 'create' as const,
          targetPath: 'atomic2.ts',
          content: 'export const atomic2 = true;'
        }
      ];

      await fsOps.executeOperations(operations);

      expect(await fsOps.fileExists('atomic1.ts')).toBe(true);
      expect(await fsOps.fileExists('atomic2.ts')).toBe(true);
    });

    it('should rollback on operation failure', async () => {
      const filePath = 'rollback-test.ts';
      const originalContent = 'export const original = true;';

      // Create original file
      await fsOps.createFile(filePath, originalContent);

      const operations = [
        {
          type: 'modify' as const,
          targetPath: filePath,
          content: 'export const modified = true;'
        },
        {
          type: 'delete' as const,
          targetPath: 'non-existent-file-that-will-fail.ts' // This will fail
        }
      ];

      // This should fail and rollback
      await expect(fsOps.executeOperations(operations)).rejects.toThrow();

      // Original file should be restored
      const content = await fsOps.readFile(filePath);
      expect(content).toBe(originalContent);
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent files gracefully', async () => {
      expect(await fsOps.fileExists('non-existent.ts')).toBe(false);
      expect(await fsOps.directoryExists('non-existent-dir')).toBe(false);

      await expect(fsOps.readFile('non-existent.ts')).rejects.toThrow();
      await expect(fsOps.deleteFile('non-existent.ts')).rejects.toThrow();
    });

    it('should handle invalid paths', async () => {
      await expect(fsOps.createFile('/invalid/path/file.ts', 'content')).rejects.toThrow();
    });
  });
});