<template>
  <div class="main-area">
    <!-- サイドバー（ファイルエクスプローラー） -->
    <div class="sidebar">
      <FileExplorer
        :root-path="rootPath"
        :selected-file="selectedFilePath"
        @select-file="$emit('select-file', $event)"
      />
    </div>

    <!-- メインコンテンツ領域 -->
    <div class="main-content">
      <!-- タブバー -->
      <TabBar
        :open-files="openFiles"
        :active-tab-index="activeTabIndex"
        @switch-tab="$emit('switch-tab', $event)"
        @close-tab="$emit('close-tab', $event)"
      />

      <div v-if="isLoading" class="loading">読み込み中...</div>
      <div v-else-if="openFiles.length === 0" class="welcome-screen">
        <h1>Theorem Note</h1>
        <p>
          左側のエクスプローラーからファイルを選択するか、「フォルダを開く」ボタンを押してプロジェクトフォルダを選択してください。
        </p>
      </div>
      <div v-else-if="activeFile" class="editor-container">
        <MarkdownEditor
          :selected-file-path="activeFile.path"
          :file-content="activeFile.content"
          :show-preview="showPreview"
          @update:file-content="$emit('update-content', $event)"
          @save="$emit('save-file')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FileExplorer from './FileExplorer.vue';
import MarkdownEditor from './MarkdownEditor.vue';
import TabBar from './TabBar.vue';
import type { OpenFile } from '../composables/useTabManagement';

interface Props {
  rootPath: string;
  selectedFilePath: string | undefined;
  openFiles: OpenFile[];
  activeTabIndex: number;
  activeFile: OpenFile | undefined;
  isLoading: boolean;
  showPreview: boolean;
}

defineProps<Props>();

defineEmits<{
  'select-file': [filePath: string];
  'switch-tab': [index: number];
  'close-tab': [index: number];
  'update-content': [content: string];
  'save-file': [];
}>();
</script>

<style scoped>
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
