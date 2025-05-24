import path from 'path';
import fs from 'fs/promises';
import { dialog } from 'electron';
import { configManager } from './config';

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileItem[];
}

export const onGetNewDirectoryFileTree = async (): Promise<FileItem[]> => {
  try {
    // ダイアログを開いて新しいディレクトリを選択
    const path = await showOpenDirectoryDialog();
    if (!path) {
      return []; // ユーザーがキャンセルした場合
    }

    // 選択されたディレクトリのツリーを取得
    return await getDirectoryTree(path);
  } catch (err) {
    console.error('Error getting new directory file tree:', err);
    throw new Error('新しいディレクトリのファイルツリーの取得中にエラーが発生しました');
  }
};

export const onGetFileTree = async (_event, rootPath: string): Promise<FileItem[]> => {
  try {
    // ルートパスが指定されていない場合は、前回のディレクトリまたはダイアログからフォルダを選択
    if (!rootPath) {
      // 前回開いたディレクトリを取得
      const lastDirectory = await configManager.getLastOpenedDirectory();

      if (lastDirectory) {
        try {
          // 前回のディレクトリが存在するかチェック
          await fs.access(lastDirectory);
          rootPath = lastDirectory;
        } catch {
          // 前回のディレクトリが存在しない場合はダイアログを開く
          console.log('Last opened directory not found, opening dialog');
        }
      }

      // 前回のディレクトリが存在しない、または取得できない場合はダイアログを開く
      if (!rootPath) {
        const path = await showOpenDirectoryDialog();
        if (!path) {
          return []; // ユーザーがキャンセルした場合
        } else {
          rootPath = path;
        }
      }
    }

    // 選択されたディレクトリを設定に保存
    await configManager.setLastOpenedDirectory(rootPath);

    return await getDirectoryTree(rootPath);
  } catch (err) {
    console.error('Error getting file tree:', err);
    throw new Error('ファイルツリーの取得中にエラーが発生しました');
  }
};

export const onReadFile = async (_event, filePath: string): Promise<string> => {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (err) {
    console.error('Error reading file:', err);
    throw new Error('ファイルの読み込み中にエラーが発生しました');
  }
};

export const onWriteFile = async (_event, filePath: string, content: string): Promise<void> => {
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (err) {
    console.error('Error writing file:', err);
    throw new Error('ファイルの書き込み中にエラーが発生しました');
  }
};

async function getDirectoryTree(dirPath: string): Promise<FileItem[]> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const result = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          try {
            const children = await getDirectoryTree(fullPath);
            return {
              name: entry.name,
              path: fullPath,
              isDirectory: true,
              children
            };
          } catch {
            return {
              name: entry.name,
              path: fullPath,
              isDirectory: true,
              children: []
            };
          }
        } else {
          return {
            name: entry.name,
            path: fullPath,
            isDirectory: false
          };
        }
      })
    );

    result.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    return result;
  } catch (err) {
    console.error('Error reading directory:', err);
    return [];
  }
}

async function showOpenDirectoryDialog(): Promise<string | undefined> {
  const { filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  return filePaths[0];
}
