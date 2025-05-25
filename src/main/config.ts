import { app } from 'electron';
import path from 'path';
import fs from 'fs/promises';

interface AppConfig {
  lastOpenedDirectory?: string;
}

export class ConfigManager {
  private configPath: string;
  private config: AppConfig = {};

  constructor() {
    // AppDataフォルダ内にconfigファイルを作成
    const userDataPath = app.getPath('userData');
    this.configPath = path.join(userDataPath, 'config.json');
  }

  async loadConfig(): Promise<AppConfig> {
    try {
      const configData = await fs.readFile(this.configPath, 'utf-8');
      this.config = JSON.parse(configData);
      return this.config;
    } catch {
      // ファイルが存在しない場合は空の設定を返す
      console.log('Config file not found, using default config');
      this.config = {};
      return this.config;
    }
  }

  async saveConfig(config: AppConfig): Promise<void> {
    try {
      this.config = { ...this.config, ...config };
      await fs.mkdir(path.dirname(this.configPath), { recursive: true });
      await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving config:', err);
      throw new Error('設定の保存中にエラーが発生しました');
    }
  }

  async getLastOpenedDirectory(): Promise<string | undefined> {
    const config = await this.loadConfig();
    return config.lastOpenedDirectory;
  }

  async setLastOpenedDirectory(directoryPath: string): Promise<void> {
    await this.saveConfig({ lastOpenedDirectory: directoryPath });
  }
}

export const configManager = new ConfigManager();
