<script setup lang="ts">
import { ref, onMounted } from 'vue';
import HeaderToolbar from './components/HeaderToolbar.vue';
import MainLayout from './components/MainLayout.vue';
import { useFileManagement } from './composables/useFileManagement';
import { useTabManagement } from './composables/useTabManagement';

// ファイル管理composable
const { rootPath, isLoading, openFolder, saveFile, loadLastDirectory } = useFileManagement();

// タブ管理composable
const {
  openFiles,
  activeTabIndex,
  activeFile,
  selectedFilePath,
  openFileInTab,
  closeTab,
  switchToTab,
  handleContentUpdate,
  markFileAsSaved
} = useTabManagement();

// プレビュー表示状態
const showPreview = ref<boolean>(true);

// プレビューの表示/非表示を切り替える
const togglePreview = (): void => {
  showPreview.value = !showPreview.value;
};

// ファイルが選択されたときのハンドラー（FileExplorerから）
const handleFileSelect = async (filePath: string): Promise<void> => {
  await openFileInTab(filePath);
};

// ファイル保存処理
const handleSaveFile = async (): Promise<void> => {
  const active = activeFile.value;
  if (!active) return;

  try {
    await saveFile(active.path, active.content);
    markFileAsSaved(active.path);
    console.log('ファイルが保存されました');
  } catch (err) {
    console.error('ファイル保存エラー:', err);
  }
};

onMounted(async () => {
  await loadLastDirectory();
});
</script>

<template>
  <div class="app-container">
    <!-- ヘッダーツールバー -->
    <HeaderToolbar
      :has-active-file="!!selectedFilePath"
      :show-preview="showPreview"
      @open-folder="openFolder"
      @save-file="handleSaveFile"
      @toggle-preview="togglePreview"
    />

    <!-- メインレイアウト -->
    <MainLayout
      :root-path="rootPath"
      :selected-file-path="selectedFilePath"
      :open-files="openFiles"
      :active-tab-index="activeTabIndex"
      :active-file="activeFile"
      :is-loading="isLoading"
      :show-preview="showPreview"
      @select-file="handleFileSelect"
      @switch-tab="switchToTab"
      @close-tab="closeTab"
      @update-content="handleContentUpdate"
      @save-file="handleSaveFile"
    />
  </div>
</template>

<style>
/* リセットとベース */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  /* ライトモードのカラーテーマ */
  --bg-color: #ffffff;
  --sidebar-bg: #f5f5f5;
  --sidebar-header-bg: #e8e8e8;
  --text-color: #333333;
  --border-color: #dddddd;
  --accent-color: #0078d7;
  --hover-bg: #eaeaea;
  --header-bg: #f0f0f0;
  --header-border: #d1d1d1;
  --tab-bg: #f8f8f8;
  --tab-active-bg: #ffffff;
  --tab-hover-bg: #e8e8e8;
  --tab-border: #dddddd;
}

html,
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  height: 100%;
  color: var(--text-color);
  background-color: var(--bg-color);
}

#app {
  height: 100vh;
  width: 100vw;
}

/* アプリ全体のレイアウト */
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}
</style>
