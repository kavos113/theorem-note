<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { marked } from 'marked';
import { initializeHighlightJS, createCodeRenderer } from '../utils/highlightUtils';
import '../assets/highlight.css';

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
  (e: 'file-saved'): void;
}

const emit = defineEmits<Emits>();

// ローカルコンテンツの管理
const localContent = ref(props.fileContent);
const isSaving = ref(false);
const editorWidth = ref(50); // エディタの幅（パーセンテージ）
const isResizing = ref(false);

// markedのレンダラーを設定
const renderer = new marked.Renderer();
renderer.code = createCodeRenderer();

marked.use({ renderer });

// ファイルを保存する
const saveFile = async (): Promise<void> => {
  if (!props.selectedFilePath || isSaving.value) return;

  try {
    isSaving.value = true;
    await window.electronAPI.writeFile(props.selectedFilePath, localContent.value);
    emit('file-saved');
    console.log('ファイルが保存されました');
  } catch (err) {
    console.error('ファイル保存エラー:', err);
  } finally {
    isSaving.value = false;
  }
};

// プロパティの変更を監視
watch(
  () => props.fileContent,
  (newContent) => {
    localContent.value = newContent;
  },
  { immediate: true }
);

// コンテンツ変更時のハンドラー
const handleContentChange = (event: Event): void => {
  const target = event.target as HTMLTextAreaElement;
  localContent.value = target.value;
  emit('update:fileContent', target.value);
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
    saveFile();
  }
};

// リサイズ機能
const startResize = (event: MouseEvent): void => {
  event.preventDefault();
  isResizing.value = true;

  const target = event.currentTarget as HTMLElement;
  const container = target.parentElement as HTMLElement;
  const containerRect = container.getBoundingClientRect();

  const handleMouseMove = (e: MouseEvent): void => {
    if (!isResizing.value) return;

    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    editorWidth.value = Math.min(Math.max(newWidth, 20), 80); // 20%-80%の範囲で制限
  };

  const handleMouseUp = (): void => {
    isResizing.value = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};

// コンポーネントのマウント時とアンマウント時の処理
onMounted(() => {
  // highlight.jsを初期化
  initializeHighlightJS();
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div class="markdown-editor-container">
    <div class="editor-header">
      {{ selectedFilePath }}
    </div>
    <div class="editor-content-split" :class="{ 'preview-hidden': !showPreview }">
      <div class="editor-pane" :style="{ width: showPreview ? `${editorWidth}%` : '100%' }">
        <div class="pane-header">エディタ</div>
        <textarea
          v-model="localContent"
          class="markdown-editor"
          @input="handleContentChange"
        ></textarea>
      </div>
      <div v-if="showPreview" class="resizer" @mousedown="startResize"></div>
      <div v-if="showPreview" class="preview-pane" :style="{ width: `${100 - editorWidth}%` }">
        <div class="pane-header">プレビュー</div>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="markdown-preview" v-html="htmlPreview"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.markdown-editor-container {
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
  display: flex;
  flex-direction: column;
  min-width: 200px;
}

.resizer {
  width: 4px;
  background-color: var(--border-color);
  cursor: col-resize;
  flex-shrink: 0;
  transition: background-color 0.2s ease;
}

.resizer:hover {
  background-color: var(--accent-color);
}

.preview-pane {
  display: flex;
  flex-direction: column;
  min-width: 200px;
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
  flex: 1;
  padding: 12px;
  border: none;
  outline: none;
  background-color: var(--bg-color);
  color: var(--text-color);
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  white-space: pre-wrap;
  word-wrap: break-word;
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
  font-weight: bold;
  margin: 0.67em 0;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.3em;
}

.markdown-preview :deep(h2) {
  font-size: 1.5em;
  font-weight: bold;
  margin: 0.83em 0;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.3em;
}

.markdown-preview :deep(h3) {
  font-size: 1.17em;
  font-weight: bold;
  margin: 1em 0;
}

.markdown-preview :deep(h4) {
  font-size: 1em;
  font-weight: bold;
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
  list-style: disc;
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

.markdown-preview :deep(pre code) {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
}

.editor-content-split.preview-hidden .editor-pane {
  width: 100% !important;
}
</style>
