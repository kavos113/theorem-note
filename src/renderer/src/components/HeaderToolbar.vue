<template>
  <div class="header-toolbar">
    <div class="toolbar-left">
      <button class="toolbar-button" @click="$emit('open-folder')">
        <span class="icon">📁</span>
        フォルダを開く
      </button>
    </div>
    <div class="toolbar-center">
      <h1 class="app-title">Theorem Note</h1>
    </div>
    <div class="toolbar-right">
      <button v-if="hasActiveFile" class="toolbar-button" @click="$emit('save-file')">
        <span class="icon">💾</span>
        保存
      </button>
      <button
        v-if="hasActiveFile"
        class="toolbar-button"
        :class="{ active: showPreview }"
        @click="$emit('toggle-preview')"
      >
        <span class="icon">👁️</span>
        {{ showPreview ? 'プレビューを隠す' : 'プレビューを表示' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  hasActiveFile: boolean;
  showPreview: boolean;
}

defineProps<Props>();

defineEmits<{
  'open-folder': [];
  'save-file': [];
  'toggle-preview': [];
}>();
</script>

<style scoped>
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
</style>
