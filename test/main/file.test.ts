import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { onReadFile, onWriteFile, onGetFileTree } from '../../src/main/file';

// electronモジュールをモック
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/mock/app/data')
  },
  dialog: {
    showOpenDialog: vi.fn()
  }
}));

// configManagerをモック
vi.mock('../../src/main/config', () => ({
  configManager: {
    setLastOpenedDirectory: vi.fn(),
    getLastOpenedDirectory: vi.fn()
  }
}));

// electronモジュールをモック
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/mock/app/data')
  },
  dialog: {
    showOpenDialog: vi.fn()
  }
}));

// configManagerをモック
vi.mock('../../src/main/config', () => ({
  configManager: {
    setLastOpenedDirectory: vi.fn(),
    getLastOpenedDirectory: vi.fn()
  }
}));

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileItem[];
}

describe('File Operations', () => {
  let tempDir: string;

  beforeEach(async () => {
    vi.clearAllMocks();

    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'theorem-note-test-'));
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // クリーンアップの失敗は無視
    }
  });

  describe('onReadFile', () => {
    it('should read file content successfully', async () => {
      const testContent = 'Test file content';
      const testFile = path.join(tempDir, 'test.txt');

      // 実際にファイルを作成
      await fs.writeFile(testFile, testContent, 'utf-8');

      const result = await onReadFile(null, testFile);

      expect(result).toBe(testContent);
    });

    it('should throw error when file read fails', async () => {
      const nonExistentFile = path.join(tempDir, 'nonexistent.txt');

      await expect(onReadFile(null, nonExistentFile)).rejects.toThrow(
        'ファイルの読み込み中にエラーが発生しました'
      );
    });
  });

  describe('onWriteFile', () => {
    it('should write file content successfully', async () => {
      const testContent = 'Test content to write';
      const testFile = path.join(tempDir, 'subdir', 'test.txt');

      await onWriteFile(null, testFile, testContent);

      // ファイルが正しく作成されているかチェック
      const writtenContent = await fs.readFile(testFile, 'utf-8');
      expect(writtenContent).toBe(testContent);

      // ディレクトリも作成されているかチェック
      const dirExists = await fs
        .access(path.dirname(testFile))
        .then(() => true)
        .catch(() => false);
      expect(dirExists).toBe(true);
    });

    it.skip('should throw error when file write fails', async () => {
      const invalidPath = '';
      await expect(onWriteFile(null, invalidPath, 'content')).rejects.toThrow(
        'ファイルの書き込み中にエラーが発生しました'
      );
    });
  });

  describe('onGetFileTree', () => {
    it('should get file tree for existing directory', async () => {
      const { configManager } = await import('../../src/main/config');

      // テスト用のディレクトリ構造を作成
      const subDir = path.join(tempDir, 'subdir');
      await fs.mkdir(subDir, { recursive: true });

      await fs.writeFile(path.join(tempDir, 'file1.txt'), 'content1', 'utf-8');
      await fs.writeFile(path.join(subDir, 'file2.txt'), 'content2', 'utf-8');

      const result = await onGetFileTree(null, tempDir);

      expect(configManager.setLastOpenedDirectory).toHaveBeenCalledWith(tempDir);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // ファイルとディレクトリが含まれていることを確認
      const fileNames = result.map((item: FileItem) => item.name);
      expect(fileNames).toContain('file1.txt');
      expect(fileNames).toContain('subdir');
    });

    it('should handle directory read errors gracefully', async () => {
      const invalidPath = path.join(tempDir, 'nonexistent');

      const result = await onGetFileTree(null, invalidPath);

      // エラーが発生した場合は空の配列が返される（現在の実装）
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([]);
    });
  });
});
