import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI as toolkitElectronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api = {};

// ファイルシステム関連のAPIを追加
const electronAPI = {
  // ファイルツリーを取得
  getFileTree: (rootPath: string) => ipcRenderer.invoke('getFileTree', rootPath),

  // ファイルの内容を読み込む
  readFile: (filePath: string) => ipcRenderer.invoke('readFile', filePath),

  // ファイルに内容を書き込む
  writeFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('writeFile', filePath, content),

  // 前回開いたディレクトリを取得
  getLastOpenedDirectory: () => ipcRenderer.invoke('getLastOpenedDirectory'),

  // 一般的なIPCイベント
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    const subscription = (_event: unknown, ...args: unknown[]): void => callback(...args);
    ipcRenderer.on(channel, subscription);
    return () => ipcRenderer.removeListener(channel, subscription);
  }
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', toolkitElectronAPI);
    contextBridge.exposeInMainWorld('electronAPI', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = toolkitElectronAPI;
  // @ts-ignore (define in dts)
  window.electronAPI = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
