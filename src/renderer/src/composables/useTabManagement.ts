import { ref, computed, type Ref, type ComputedRef } from 'vue';

// タブで開いているファイルの型定義
export interface OpenFile {
  path: string;
  content: string;
  isModified: boolean;
  displayName: string;
}

// タブ管理の戻り値型定義
interface UseTabManagementReturn {
  openFiles: Ref<OpenFile[]>;
  activeTabIndex: Ref<number>;
  activeFile: ComputedRef<OpenFile | undefined>;
  selectedFilePath: ComputedRef<string | undefined>;
  isLoading: Ref<boolean>;
  openFileInTab: (filePath: string) => Promise<void>;
  closeTab: (index: number) => void;
  switchToTab: (index: number) => void;
  handleContentUpdate: (newContent: string) => void;
  markFileAsSaved: (filePath: string) => void;
}

// タブ管理関連のロジック
export function useTabManagement(): UseTabManagementReturn {
  const openFiles = ref<OpenFile[]>([]);
  const activeTabIndex = ref<number>(-1);
  const isLoading = ref(false);

  // 現在アクティブなファイルの計算プロパティ
  const activeFile = computed((): OpenFile | undefined => {
    if (activeTabIndex.value >= 0 && activeTabIndex.value < openFiles.value.length) {
      return openFiles.value[activeTabIndex.value];
    }
    return undefined;
  });

  // 現在選択されているファイルパス（後方互換性のため）
  const selectedFilePath = computed(() => activeFile.value?.path);

  // ファイル名からタブ表示用の名前を取得
  const getDisplayName = (filePath: string): string => {
    return filePath.split('\\').pop() || filePath.split('/').pop() || filePath;
  };

  // 新しいタブでファイルを開く
  const openFileInTab = async (filePath: string): Promise<void> => {
    try {
      isLoading.value = true;

      // 既に開いているファイルかチェック
      const existingIndex = openFiles.value.findIndex((file) => file.path === filePath);
      if (existingIndex !== -1) {
        // 既に開いている場合はそのタブをアクティブにする
        activeTabIndex.value = existingIndex;
        return;
      }

      // ファイルの内容を読み込む
      const content = await window.electronAPI.readFile(filePath);

      // 新しいタブを作成
      const newFile: OpenFile = {
        path: filePath,
        content,
        isModified: false,
        displayName: getDisplayName(filePath)
      };

      openFiles.value.push(newFile);
      activeTabIndex.value = openFiles.value.length - 1;
    } catch (err) {
      console.error('ファイル読み込みエラー:', err);
      // エラーの場合でもタブを作成（エラーメッセージを表示）
      const newFile: OpenFile = {
        path: filePath,
        content: '# エラー\nファイルを読み込めませんでした',
        isModified: false,
        displayName: getDisplayName(filePath)
      };
      openFiles.value.push(newFile);
      activeTabIndex.value = openFiles.value.length - 1;
    } finally {
      isLoading.value = false;
    }
  };

  // タブを閉じる
  const closeTab = (index: number): void => {
    if (index < 0 || index >= openFiles.value.length) return;

    openFiles.value.splice(index, 1);

    // アクティブタブのインデックスを調整
    if (openFiles.value.length === 0) {
      activeTabIndex.value = -1;
    } else if (index <= activeTabIndex.value) {
      if (activeTabIndex.value > 0) {
        activeTabIndex.value--;
      } else {
        activeTabIndex.value = 0;
      }
    }
  };

  // タブを切り替える
  const switchToTab = (index: number): void => {
    if (index >= 0 && index < openFiles.value.length) {
      activeTabIndex.value = index;
    }
  };

  // MarkdownEditorからのコンテンツ更新を処理
  const handleContentUpdate = (newContent: string): void => {
    const active = activeFile.value;
    if (!active) return;

    // アクティブファイルのコンテンツを更新
    const fileIndex = openFiles.value.findIndex((f) => f.path === active.path);
    if (fileIndex !== -1) {
      openFiles.value[fileIndex].content = newContent;
      openFiles.value[fileIndex].isModified = true;
    }
  };

  // ファイル保存後に変更フラグをリセット
  const markFileAsSaved = (filePath: string): void => {
    const fileIndex = openFiles.value.findIndex((f) => f.path === filePath);
    if (fileIndex !== -1) {
      openFiles.value[fileIndex].isModified = false;
    }
  };

  return {
    openFiles,
    activeTabIndex,
    activeFile,
    selectedFilePath,
    isLoading,
    openFileInTab,
    closeTab,
    switchToTab,
    handleContentUpdate,
    markFileAsSaved
  };
}
