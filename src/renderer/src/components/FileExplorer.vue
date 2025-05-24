<template>
  <div class="file-explorer">
    <div class="explorer-header">
      <h3>エクスプローラー</h3>
    </div>
    <div class="file-tree">
      <div v-if="loading" class="loading">読み込み中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else class="tree-container">
        <ul class="tree-root">
          <file-tree-item
            v-for="item in fileTree"
            :key="item.path"
            :item="item"
            :selected-file="selectedFile"
            @select-file="$emit('select-file', $event)"
          />
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import FileTreeItem from './FileTreeItem.vue';

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileItem[];
}

const props = defineProps<{
  rootPath?: string;
  selectedFile?: string;
}>();

const emit = defineEmits<{
  (e: 'select-file', path: string): void;
}>();

const fileTree = ref<FileItem[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(() => {
  if (props.rootPath) {
    loadFileTree();
  } else {
    loading.value = false;
  }
});

// rootPathが変更された時にファイルツリーを更新
watch(
  () => props.rootPath,
  (newRootPath) => {
    if (newRootPath) {
      loadFileTree();
    } else {
      fileTree.value = [];
      loading.value = false;
    }
  }
);

const loadFileTree = async (): Promise<void> => {
  try {
    loading.value = true;
    error.value = null;
    // ファイル一覧をElectronのメインプロセスから取得
    const result = await window.electronAPI.getFileTree(props.rootPath || '');
    fileTree.value = result;
  } catch (err) {
    error.value = err instanceof Error ? err.message : '不明なエラーが発生しました';
    fileTree.value = [];
  } finally {
    loading.value = false;
  }
};
</script>
<style scoped>
.file-explorer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--sidebar-bg, #f5f5f5);
  color: var(--text-color, #333333);
  user-select: none;
  overflow: hidden;
}

.explorer-header {
  padding: 10px;
  font-size: 13px;
  font-weight: 600;
  border-bottom: 1px solid var(--border-color, #dddddd);
}

.explorer-header h3 {
  margin: 0;
  font-size: inherit;
  font-weight: inherit;
}

.file-tree {
  flex: 1;
  overflow: auto;
  padding: 5px 0;
}

.tree-container {
  width: 100%;
}

.tree-root {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.loading,
.error {
  padding: 10px;
  color: var(--text-muted, #666666);
  font-style: italic;
}

.error {
  color: var(--error-text, #d32f2f);
}
</style>
