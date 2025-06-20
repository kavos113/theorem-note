import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { saveWorkspaceInfo, loadWorkspaceInfo, hasWorkspaceInfo } from '../../src/main/workspace';
import fs from 'fs/promises';
import path from 'path';
import { tmpdir } from 'os';

describe('Workspace Functions', () => {
  let testDir: string;
  let theoremNoteDir: string;

  beforeEach(async () => {
    // テスト用の一時ディレクトリを作成
    testDir = path.join(tmpdir(), `theorem-note-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });

    theoremNoteDir = path.join(testDir, '.theoremnote');
  });

  afterEach(async () => {
    // テスト後にクリーンアップ
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // クリーンアップエラーは無視
    }
  });

  describe('saveWorkspaceInfo', () => {
    it('should create .theoremnote directory if it does not exist', async () => {
      const workspaceInfo = {
        openTabs: ['/path/to/file1.md', '/path/to/file2.md'],
        activeTab: '/path/to/file1.md'
      };

      await saveWorkspaceInfo(testDir, workspaceInfo);

      const dirExists = await fs
        .access(theoremNoteDir)
        .then(() => true)
        .catch(() => false);
      expect(dirExists).toBe(true);
    });

    it('should save workspace info to .theoremnote/workspace.json', async () => {
      const workspaceInfo = {
        openTabs: ['/path/to/file1.md', '/path/to/file2.md'],
        activeTab: '/path/to/file1.md'
      };

      await saveWorkspaceInfo(testDir, workspaceInfo);

      const workspaceFilePath = path.join(theoremNoteDir, 'workspace.json');
      const savedData = await fs.readFile(workspaceFilePath, 'utf-8');
      const parsedData = JSON.parse(savedData);

      expect(parsedData).toEqual(workspaceInfo);
    });

    it('should overwrite existing workspace info', async () => {
      const initialInfo = {
        openTabs: ['/path/to/file1.md'],
        activeTab: '/path/to/file1.md'
      };

      const updatedInfo = {
        openTabs: ['/path/to/file1.md', '/path/to/file2.md', '/path/to/file3.md'],
        activeTab: '/path/to/file2.md'
      };

      await saveWorkspaceInfo(testDir, initialInfo);
      await saveWorkspaceInfo(testDir, updatedInfo);

      const workspaceFilePath = path.join(theoremNoteDir, 'workspace.json');
      const savedData = await fs.readFile(workspaceFilePath, 'utf-8');
      const parsedData = JSON.parse(savedData);

      expect(parsedData).toEqual(updatedInfo);
    });
  });

  describe('loadWorkspaceInfo', () => {
    it('should return null if .theoremnote directory does not exist', async () => {
      const result = await loadWorkspaceInfo('/nonexistent/path');
      expect(result).toBeNull();
    });

    it('should return null if workspace.json does not exist', async () => {
      await fs.mkdir(theoremNoteDir, { recursive: true });
      const result = await loadWorkspaceInfo(testDir);
      expect(result).toBeNull();
    });

    it('should load existing workspace info', async () => {
      const workspaceInfo = {
        openTabs: ['/path/to/file1.md', '/path/to/file2.md'],
        activeTab: '/path/to/file1.md'
      };

      await saveWorkspaceInfo(testDir, workspaceInfo);
      const loadedInfo = await loadWorkspaceInfo(testDir);

      expect(loadedInfo).toEqual(workspaceInfo);
    });

    it('should return null if workspace.json is corrupted', async () => {
      await fs.mkdir(theoremNoteDir, { recursive: true });
      const workspaceFilePath = path.join(theoremNoteDir, 'workspace.json');
      await fs.writeFile(workspaceFilePath, 'invalid json', 'utf-8');

      const result = await loadWorkspaceInfo(testDir);
      expect(result).toBeNull();
    });
  });

  describe('hasWorkspaceInfo', () => {
    it('should return false if workspace info does not exist', async () => {
      const result = await hasWorkspaceInfo(testDir);
      expect(result).toBe(false);
    });

    it('should return true if workspace info exists', async () => {
      const workspaceInfo = {
        openTabs: ['/path/to/file1.md'],
        activeTab: '/path/to/file1.md'
      };

      await saveWorkspaceInfo(testDir, workspaceInfo);
      const result = await hasWorkspaceInfo(testDir);
      expect(result).toBe(true);
    });
  });
});
