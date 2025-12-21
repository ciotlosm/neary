/**
 * File System Operations Service
 * Handles actual file system operations for refactoring with safety checks
 */

import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';

export interface FileOperation {
  type: 'create' | 'move' | 'delete' | 'modify';
  sourcePath?: string;
  targetPath: string;
  content?: string;
  backup?: string;
}

export interface BackupInfo {
  id: string;
  timestamp: Date;
  operations: FileOperation[];
  backupDir: string;
}

export class FileSystemOperations {
  private backupDir: string;
  private activeBackups: Map<string, BackupInfo> = new Map();

  constructor(private projectRoot: string = process.cwd()) {
    this.backupDir = path.join(projectRoot, '.refactoring-backups');
  }

  /**
   * Creates a backup before performing operations
   */
  async createBackup(operations: FileOperation[]): Promise<string> {
    const backupId = this.generateBackupId();
    const backupPath = path.join(this.backupDir, backupId);
    
    await fs.mkdir(backupPath, { recursive: true });
    
    const backupInfo: BackupInfo = {
      id: backupId,
      timestamp: new Date(),
      operations: [],
      backupDir: backupPath
    };

    // Backup all files that will be affected
    for (const operation of operations) {
      let fileToBackup: string | undefined;
      
      // Determine which file needs to be backed up based on operation type
      switch (operation.type) {
        case 'move':
        case 'delete':
          fileToBackup = operation.sourcePath || operation.targetPath;
          break;
        case 'modify':
          fileToBackup = operation.targetPath;
          break;
        case 'create':
          // No backup needed for create operations
          break;
      }
      
      if (fileToBackup && await this.fileExists(fileToBackup)) {
        const fullSourcePath = path.resolve(this.projectRoot, fileToBackup);
        const relativePath = path.relative(this.projectRoot, fullSourcePath);
        const backupFilePath = path.join(backupPath, relativePath);
        
        await fs.mkdir(path.dirname(backupFilePath), { recursive: true });
        await fs.copyFile(fullSourcePath, backupFilePath);
        
        backupInfo.operations.push({
          type: 'create',
          targetPath: backupFilePath,
          sourcePath: fullSourcePath
        });
      }
    }

    // Save backup metadata
    const metadataPath = path.join(backupPath, 'backup-metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(backupInfo, null, 2));
    
    this.activeBackups.set(backupId, backupInfo);
    return backupId;
  }

  /**
   * Restores from backup
   */
  async restoreBackup(backupId: string): Promise<void> {
    const backupInfo = this.activeBackups.get(backupId);
    if (!backupInfo) {
      throw new Error(`Backup ${backupId} not found`);
    }

    const metadataPath = path.join(backupInfo.backupDir, 'backup-metadata.json');
    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8')) as BackupInfo;

    // Restore all backed up files
    for (const operation of metadata.operations) {
      if (operation.sourcePath && operation.targetPath) {
        await fs.mkdir(path.dirname(operation.sourcePath), { recursive: true });
        await fs.copyFile(operation.targetPath, operation.sourcePath);
      }
    }
  }

  /**
   * Moves a file from source to target
   */
  async moveFile(sourcePath: string, targetPath: string): Promise<void> {
    const fullSourcePath = path.resolve(this.projectRoot, sourcePath);
    const fullTargetPath = path.resolve(this.projectRoot, targetPath);

    // Ensure target directory exists
    await fs.mkdir(path.dirname(fullTargetPath), { recursive: true });
    
    // Move the file
    await fs.rename(fullSourcePath, fullTargetPath);
  }

  /**
   * Creates a new file with content
   */
  async createFile(filePath: string, content: string): Promise<void> {
    const fullPath = path.resolve(this.projectRoot, filePath);
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    
    // Write the file
    await fs.writeFile(fullPath, content, 'utf8');
  }

  /**
   * Deletes a file
   */
  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.resolve(this.projectRoot, filePath);
    await fs.unlink(fullPath);
  }

  /**
   * Reads file content
   */
  async readFile(filePath: string): Promise<string> {
    const fullPath = path.resolve(this.projectRoot, filePath);
    return await fs.readFile(fullPath, 'utf8');
  }

  /**
   * Modifies file content
   */
  async modifyFile(filePath: string, content: string): Promise<void> {
    const fullPath = path.resolve(this.projectRoot, filePath);
    await fs.writeFile(fullPath, content, 'utf8');
  }

  /**
   * Creates a directory
   */
  async createDirectory(dirPath: string): Promise<void> {
    const fullPath = path.resolve(this.projectRoot, dirPath);
    await fs.mkdir(fullPath, { recursive: true });
  }

  /**
   * Lists files in a directory
   */
  async listFiles(dirPath: string, recursive: boolean = false): Promise<string[]> {
    const fullPath = path.resolve(this.projectRoot, dirPath);
    
    if (!await this.directoryExists(fullPath)) {
      return [];
    }

    const files: string[] = [];
    
    const scanDirectory = async (currentPath: string, relativePath: string = '') => {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const entryPath = path.join(currentPath, entry.name);
        const relativeEntryPath = path.join(relativePath, entry.name);
        
        if (entry.isFile()) {
          files.push(relativeEntryPath);
        } else if (entry.isDirectory() && recursive) {
          await scanDirectory(entryPath, relativeEntryPath);
        }
      }
    };

    await scanDirectory(fullPath);
    return files;
  }

  /**
   * Checks if file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.resolve(this.projectRoot, filePath);
      const stat = await fs.stat(fullPath);
      return stat.isFile();
    } catch {
      return false;
    }
  }

  /**
   * Checks if directory exists
   */
  async directoryExists(dirPath: string): Promise<boolean> {
    try {
      const fullPath = path.resolve(this.projectRoot, dirPath);
      const stat = await fs.stat(fullPath);
      return stat.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Gets file stats
   */
  async getFileStats(filePath: string): Promise<{ size: number; lines: number; modified: Date }> {
    const fullPath = path.resolve(this.projectRoot, filePath);
    const stat = await fs.stat(fullPath);
    const content = await fs.readFile(fullPath, 'utf8');
    
    return {
      size: stat.size,
      lines: content.split('\n').length,
      modified: stat.mtime
    };
  }

  /**
   * Executes multiple file operations atomically
   */
  async executeOperations(operations: FileOperation[]): Promise<void> {
    const backupId = await this.createBackup(operations);
    
    try {
      for (const operation of operations) {
        switch (operation.type) {
          case 'create':
            if (operation.content) {
              await this.createFile(operation.targetPath, operation.content);
            }
            break;
          case 'move':
            if (operation.sourcePath) {
              await this.moveFile(operation.sourcePath, operation.targetPath);
            }
            break;
          case 'delete':
            await this.deleteFile(operation.targetPath);
            break;
          case 'modify':
            if (operation.content) {
              await this.modifyFile(operation.targetPath, operation.content);
            }
            break;
        }
      }
    } catch (error) {
      // Rollback on error
      try {
        await this.restoreBackup(backupId);
      } catch (rollbackError) {
        console.error('Failed to rollback after error:', rollbackError);
      }
      throw error;
    }
  }

  /**
   * Cleans up old backups
   */
  async cleanupBackups(olderThanDays: number = 7): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    for (const [backupId, backupInfo] of this.activeBackups) {
      if (backupInfo.timestamp < cutoffDate) {
        await fs.rm(backupInfo.backupDir, { recursive: true, force: true });
        this.activeBackups.delete(backupId);
      }
    }
  }

  /**
   * Generates a unique backup ID
   */
  private generateBackupId(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const hash = createHash('md5').update(Math.random().toString()).digest('hex').substring(0, 8);
    return `backup-${timestamp}-${hash}`;
  }
}

export default FileSystemOperations;