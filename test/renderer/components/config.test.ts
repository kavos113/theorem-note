import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

let tempDir: string;

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => tempDir)
  }
}));

describe('ConfigManager', () => {
  let configManager: import('../../../src/main/config').ConfigManager;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'theorem-note-test-'));

    vi.clearAllMocks();

    const { ConfigManager } = await import('../../../src/main/config');
    configManager = new ConfigManager();
  });

  afterEach(async () => {
    // 一時ディレクトリを削除
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Failed to cleanup temp directory:', error);
    }
  });

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(configManager).toBeDefined();
    });
  });

  describe('loadConfig', () => {
    it('should return empty config when file does not exist', async () => {
      const result = await configManager.loadConfig();
      expect(result).toEqual({});
    });

    it('should return parsed config when file exists', async () => {
      // 実際にファイルを作成
      const mockConfig = { lastOpenedDirectory: '/test/path' };
      const configPath = path.join(tempDir, 'config.json');
      await fs.writeFile(configPath, JSON.stringify(mockConfig), 'utf-8');

      const result = await configManager.loadConfig();
      expect(result).toEqual(mockConfig);
    });

    it('should handle invalid JSON in config file', async () => {
      // 無効なJSONファイルを作成
      const configPath = path.join(tempDir, 'config.json');
      await fs.writeFile(configPath, '{ invalid json', 'utf-8');

      const result = await configManager.loadConfig();
      expect(result).toEqual({});
    });
  });

  describe('saveConfig', () => {
    it('should save config to file', async () => {
      const testConfig = { lastOpenedDirectory: '/new/test/path' };
      await configManager.saveConfig(testConfig);

      // ファイルが実際に作成されたか確認
      const configPath = path.join(tempDir, 'config.json');
      const fileExists = await fs
        .access(configPath)
        .then(() => true)
        .catch(() => false);
      expect(fileExists).toBe(true);

      // ファイルの内容を確認
      const savedContent = await fs.readFile(configPath, 'utf-8');
      const savedConfig = JSON.parse(savedContent);
      expect(savedConfig).toEqual(testConfig);
    });

    it('should create directory if it does not exist', async () => {
      // tempDirを削除して、ディレクトリが存在しない状態を作る
      await fs.rm(tempDir, { recursive: true });

      const testConfig = { lastOpenedDirectory: '/test/path' };
      await configManager.saveConfig(testConfig);

      // ディレクトリとファイルが作成されたか確認
      const configPath = path.join(tempDir, 'config.json');
      const fileExists = await fs
        .access(configPath)
        .then(() => true)
        .catch(() => false);
      expect(fileExists).toBe(true);
    });

    it('should merge with existing config', async () => {
      // 既存の設定を保存
      const existingConfig = { lastOpenedDirectory: '/existing/path', someOtherSetting: 'value' };
      await configManager.saveConfig(existingConfig);

      // 新しい設定を保存（マージされるはず）
      const newConfig = { lastOpenedDirectory: '/new/path' };
      await configManager.saveConfig(newConfig);

      // マージされた設定を確認
      const result = await configManager.loadConfig();
      expect(result).toEqual({
        lastOpenedDirectory: '/new/path',
        someOtherSetting: 'value'
      });
    });
  });

  describe('getLastOpenedDirectory', () => {
    it('should return undefined when no directory is saved', async () => {
      const result = await configManager.getLastOpenedDirectory();
      expect(result).toBeUndefined();
    });

    it('should return saved directory', async () => {
      const testPath = '/test/directory/path';
      await configManager.setLastOpenedDirectory(testPath);

      const result = await configManager.getLastOpenedDirectory();
      expect(result).toBe(testPath);
    });
  });

  describe('setLastOpenedDirectory', () => {
    it('should save directory path', async () => {
      const testPath = '/another/test/path';
      await configManager.setLastOpenedDirectory(testPath);

      // 設定ファイルから直接読み取って確認
      const configPath = path.join(tempDir, 'config.json');
      const content = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(content);

      expect(config.lastOpenedDirectory).toBe(testPath);
    });
  });
});
