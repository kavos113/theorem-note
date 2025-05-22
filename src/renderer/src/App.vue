<script setup lang="ts">
import { ref, onMounted } from 'vue';
import FileExplorer from './components/FileExplorer.vue';

// 現在選択されているファイルとその内容
const selectedFilePath = ref<string | undefined>(undefined);
const fileContent = ref<string>('');
const rootPath = ref<string>('');
const isLoading = ref(false);

// ファイルが選択されたときのハンドラー
const handleFileSelect = async (filePath: string) => {
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
const openFolder = async () => {
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

onMounted(() => {
  // 初回ロード時の自動ダイアログ表示を停止
  // rootPathが空でもダイアログを自動で開かないようにする
});
</script>

<template>
  <div class="app-container">
    <!-- サイドバー（ファイルエクスプローラー） -->
    <div class="sidebar">
      <div class="sidebar-header">
        <button @click="openFolder" class="folder-button">フォルダを開く</button>
      </div>
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
        <div class="editor-header">
          {{ selectedFilePath }}
        </div>
        <div class="editor-content">
          <textarea v-model="fileContent" class="markdown-editor"></textarea>
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
}

html,
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  height: 100%;
  color: var(--text-color);
  background-color: var(--bg-color);
  overflow: hidden;
}

#app {
  height: 100vh;
  width: 100vw;
}

/* アプリ全体のレイアウト */
.app-container {
  display: flex;
  height: 100vh;
  width: 100%;
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

.sidebar-header {
  padding: 10px;
  background-color: var(--sidebar-header-bg);
}

.folder-button {
  width: 100%;
  padding: 6px 12px;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
}

.folder-button:hover {
  background-color: #0062a3;
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

.editor-header {
  padding: 5px 10px;
  font-size: 12px;
  color: var(--text-color);
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
}

.editor-content {
  flex: 1;
  overflow: auto;
}

.markdown-editor {
  width: 100%;
  height: 100%;
  padding: 10px;
  color: var(--text-color);
  background-color: var(--bg-color);
  border: none;
  outline: none;
  resize: none;
  font-family: 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.5;
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
