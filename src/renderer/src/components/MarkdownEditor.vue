<template>
  <div class="editor-container">
    <div class="editor-header">
      {{ selectedFilePath }}
    </div>
    <div class="editor-content-split" :class="{ 'preview-hidden': !showPreview }">
      <div class="editor-pane">
        <div class="pane-header">エディタ</div>
        <textarea
          v-model="localContent"
          class="markdown-editor"
          @input="handleContentChange"
        ></textarea>
      </div>
      <div v-if="showPreview" class="preview-pane">
        <div class="pane-header">プレビュー</div>
        <div class="markdown-preview" v-html="htmlPreview"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { marked } from 'marked';

// Props
interface Props {
  selectedFilePath?: string;
  fileContent: string;
  showPreview: boolean;
}

const props = defineProps<Props>();

// Emits
interface Emits {
  (e: 'update:fileContent', value: string): void;
  (e: 'save'): void;
}

const emit = defineEmits<Emits>();

// ローカルコンテンツの管理
const localContent = ref(props.fileContent);

// プロパティの変更を監視
watch(
  () => props.fileContent,
  (newContent) => {
    localContent.value = newContent;
  },
  { immediate: true }
);

// コンテンツ変更時のハンドラー
const handleContentChange = (): void => {
  emit('update:fileContent', localContent.value);
};

// マークダウンプレビューの計算プロパティ
const htmlPreview = computed(() => {
  if (!localContent.value) return '';
  try {
    return marked(localContent.value);
  } catch (err) {
    console.error('マークダウン変換エラー:', err);
    return '<p>プレビューの生成中にエラーが発生しました</p>';
  }
});

// キーボードショートカットの処理
const handleKeyDown = (event: KeyboardEvent): void => {
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault();
    emit('save');
  }
};

// コンポーネントのマウント時とアンマウント時の処理
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
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

.editor-content-split {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-color);
}

.preview-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.pane-header {
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-color);
  background-color: var(--sidebar-header-bg);
  border-bottom: 1px solid var(--border-color);
}

.markdown-editor {
  width: 100%;
  height: 100%;
  padding: 12px;
  color: var(--text-color);
  background-color: var(--bg-color);
  border: none;
  outline: none;
  resize: none;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
}

.markdown-preview {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  background-color: var(--bg-color);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-color);
}

/* マークダウンプレビューのスタイリング */
.markdown-preview :deep(h1) {
  font-size: 2em;
  margin: 0.67em 0;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.3em;
}

.markdown-preview :deep(h2) {
  font-size: 1.5em;
  margin: 0.83em 0;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.3em;
}

.markdown-preview :deep(h3) {
  font-size: 1.17em;
  margin: 1em 0;
}

.markdown-preview :deep(h4) {
  font-size: 1em;
  margin: 1.33em 0;
}

.markdown-preview :deep(h5) {
  font-size: 0.83em;
  margin: 1.67em 0;
}

.markdown-preview :deep(h6) {
  font-size: 0.67em;
  margin: 2.33em 0;
}

.markdown-preview :deep(p) {
  margin: 1em 0;
}

.markdown-preview :deep(blockquote) {
  margin: 1em 0;
  padding-left: 1em;
  border-left: 4px solid var(--accent-color);
  background-color: var(--sidebar-bg);
  color: #666;
}

.markdown-preview :deep(ul),
.markdown-preview :deep(ol) {
  margin: 1em 0;
  padding-left: 2em;
}

.markdown-preview :deep(code) {
  background-color: var(--sidebar-bg);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
}

.markdown-preview :deep(pre) {
  background-color: var(--sidebar-bg);
  padding: 1em;
  border-radius: 5px;
  overflow-x: auto;
  margin: 1em 0;
}

.editor-content-split.preview-hidden .editor-pane {
  border-right: none;
}
</style>
