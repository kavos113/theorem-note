import { ref, type Ref } from 'vue';

// ファイル管理の戻り値型定義
interface UseFileManagementReturn {
  rootPath: Ref<string>;
  isLoading: Ref<boolean>;
  openFolder: () => Promise<void>;
  getDisplayName: (filePath: string) => string;
  saveFile: (filePath: string, content: string) => Promise<void>;
  loadLastDirectory: () => Promise<void>;
}

// ファイル操作関連のロジック
export function useFileManagement(): UseFileManagementReturn {
  const rootPath = ref<string>('');
  const isLoading = ref(false);

  // フォルダ選択ダイアログを開く
  const openFolder = async (): Promise<void> => {
    try {
      // getFileTreeに空文字列を渡すとダイアログが開く
      const fileTree = await window.electronAPI.getNewDirectoryFileTree();
      if (fileTree && fileTree.length > 0) {
        rootPath.value = fileTree[0].path.split('\\').slice(0, -1).join('\\');
      }
    } catch (err) {
      console.error('フォルダ選択エラー:', err);
    }
  };

  // ファイル名からタブ表示用の名前を取得
  const getDisplayName = (filePath: string): string => {
    return filePath.split('\\').pop() || filePath.split('/').pop() || filePath;
  };

  // ファイルを保存する
  const saveFile = async (filePath: string, content: string): Promise<void> => {
    try {
      await window.electronAPI.writeFile(filePath, content);
      console.log('ファイルが保存されました');
    } catch (err) {
      console.error('ファイル保存エラー:', err);
      throw err;
    }
  };

  // アプリケーション開始時に前回開いたディレクトリを読み込む
  const loadLastDirectory = async (): Promise<void> => {
    try {
      const lastDirectory = await window.electronAPI.getLastOpenedDirectory();
      if (lastDirectory) {
        const fileTree = await window.electronAPI.getFileTree(lastDirectory);
        if (fileTree && fileTree.length > 0) {
          rootPath.value = lastDirectory;
        }
      }
    } catch (err) {
      console.log('前回のディレクトリの読み込みに失敗:', err);
      // エラーが発生した場合は何もしない（手動でフォルダを開く必要がある）
    }
  };

  return {
    rootPath,
    isLoading,
    openFolder,
    getDisplayName,
    saveFile,
    loadLastDirectory
  };
}
