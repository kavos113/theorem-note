import { ElectronAPI } from '@electron-toolkit/preload';

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileItem[];
}

interface ElectronFileAPI {
  getFileTree: (rootPath: string) => Promise<FileItem[]>;
  getNewDirectoryFileTree: () => Promise<FileItem[]>;
  readFile: (filePath: string) => Promise<string>;
  writeFile: (filePath: string, content: string) => Promise<void>;
  getLastOpenedDirectory: () => Promise<string | undefined>;
  on: (channel: string, callback: (...args: unknown[]) => void) => () => void;
}

declare global {
  interface Window {
    electron: ElectronAPI;
    electronAPI: ElectronFileAPI;
    api: unknown;
  }
}
