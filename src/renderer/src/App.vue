<script setup lang="ts">
import { ref, onMounted } from 'vue';
import FileExplorer from './components/FileExplorer.vue';
import MarkdownEditor from './components/MarkdownEditor.vue';

// 現在選択されているファイルとその内容
const selectedFilePath = ref<string | undefined>(undefined);
const fileContent = ref<string>('');
const rootPath = ref<string>('');
const isLoading = ref(false);
const showPreview = ref<boolean>(true);

// プレビューの表示/非表示を切り替える
const togglePreview = (): void => {
  showPreview.value = !showPreview.value;
};

// ファイルを保存する
const saveFile = async (): Promise<void> => {
  if (!selectedFilePath.value) return;

  try {
    await window.electronAPI.writeFile(selectedFilePath.value, fileContent.value);
    console.log('ファイルが保存されました');
  } catch (err) {
    console.error('ファイル保存エラー:', err);
  }
};

// MarkdownEditorからのコンテンツ更新を処理
const handleContentUpdate = (newContent: string): void => {
  fileContent.value = newContent;
};

// ファイルが選択されたときのハンドラー
const handleFileSelect = async (filePath: string): Promise<void> => {
  try {
    isLoading.value = true;
    selectedFilePath.value = filePath;

    // ファイルの内容を読み込む
    const content = await window.electronAPI.readFile(filePath);
    fileContent.value = content;
  } catch (err) {
    console.error('ファイル読み込みエラー:', err);
    fileContent.value = '# エラー\nファイルを読み込めませんでした';
  } finally {
    isLoading.value = false;
  }
};

// フォルダ選択ダイアログを開く
const openFolder = async (): Promise<void> => {
  try {
    // getFileTreeに空文字列を渡すとダイアログが開く
    const fileTree = await window.electronAPI.getFileTree('');
    if (fileTree && fileTree.length > 0) {
      rootPath.value = fileTree[0].path.split('\\').slice(0, -1).join('\\');
    }
  } catch (err) {
    console.error('フォルダ選択エラー:', err);
  }
};

onMounted(async () => {
  // アプリケーション開始時に前回開いたディレクトリを自動的に読み込む
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
});
</script>

<template>
  <div class="app-container">
    <!-- ヘッダーツールバー -->
    <div class="header-toolbar">
      <div class="toolbar-left">
        <button class="toolbar-button" @click="openFolder">
          <span class="icon">📁</span>
          フォルダを開く
        </button>
      </div>
      <div class="toolbar-center">
        <h1 class="app-title">Theorem Note</h1>
      </div>
      <div class="toolbar-right">
        <button v-if="selectedFilePath" class="toolbar-button" @click="saveFile">
          <span class="icon">💾</span>
          保存
        </button>
        <button
          v-if="selectedFilePath"
          class="toolbar-button"
          :class="{ active: showPreview }"
          @click="togglePreview"
        >
          <span class="icon">👁️</span>
          {{ showPreview ? 'プレビューを隠す' : 'プレビューを表示' }}
        </button>
      </div>
    </div>

    <!-- メインエリア -->
    <div class="main-area">
      <!-- サイドバー（ファイルエクスプローラー） -->
      <div class="sidebar">
        <FileExplorer
          :root-path="rootPath"
          :selected-file="selectedFilePath"
          @select-file="handleFileSelect"
        />
      </div>

      <!-- メインコンテンツ領域 -->
      <div class="main-content">
        <div v-if="isLoading" class="loading">読み込み中...</div>
        <div v-else-if="!selectedFilePath" class="welcome-screen">
          <h1>Theorem Note</h1>
          <p>リンク機能を重視したマークダウンエディターへようこそ</p>
          <p>
            左側のエクスプローラーからファイルを選択するか、「フォルダを開く」ボタンを押してプロジェクトフォルダを選択してください。
          </p>
        </div>
        <div v-else class="editor-container">
          <MarkdownEditor
            :selected-file-path="selectedFilePath"
            :file-content="fileContent"
            :show-preview="showPreview"
            @update:file-content="handleContentUpdate"
            @save="saveFile"
          />
        </div>
      </div>
    </div>
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

/* ヘッダーツールバー */
.header-toolbar {
  display: flex;
  align-items: center;
  height: 40px;
  background-color: var(--header-bg);
  border-bottom: 1px solid var(--header-border);
  padding: 0 10px;
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.toolbar-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.toolbar-button:hover {
  background-color: #0062a3;
}

.toolbar-button .icon {
  font-size: 14px;
}

.toolbar-button.active {
  background-color: #005a9e;
}

.toolbar-button.active:hover {
  background-color: #004578;
}

/* メインエリア */
.main-area {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* サイドバー */
.sidebar {
  width: 250px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  overflow: hidden;
}

/* メインコンテンツ */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.welcome-screen {
  padding: 40px;
  text-align: center;
  color: var(--text-color);
}

.welcome-screen h1 {
  font-size: 2rem;
  margin-bottom: 20px;
}

.welcome-screen p {
  margin: 10px 0;
}

.editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-style: italic;
  color: var(--text-color);
}
</style>
