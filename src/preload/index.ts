import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI as toolkitElectronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api = {};

const electronAPI = {
  getFileTree: (rootPath: string) => ipcRenderer.invoke('getFileTree', rootPath),
  getNewDirectoryFileTree: () => ipcRenderer.invoke('getNewDirectoryFileTree'),
  readFile: (filePath: string) => ipcRenderer.invoke('readFile', filePath),
  writeFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('writeFile', filePath, content),
  getLastOpenedDirectory: () => ipcRenderer.invoke('getLastOpenedDirectory'),

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
