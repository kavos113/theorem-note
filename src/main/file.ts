// ファイル項目の型定義
import path from 'path';
import fs from 'fs/promises';
import { dialog } from 'electron';

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileItem[];
}

export const onGetFileTree = async (_event, rootPath: string): Promise<FileItem[]> => {
  try {
    // ルートパスが指定されていない場合は、ダイアログを開いてフォルダを選択させる
    if (!rootPath) {
      const { filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory']
      });
      rootPath = filePaths[0];
      if (!rootPath) {
        return []; // ユーザーがキャンセルした場合
      }
    }

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
