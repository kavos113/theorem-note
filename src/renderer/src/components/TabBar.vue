<template>
  <div v-if="openFiles.length > 0" class="tab-bar">
    <div
      v-for="(file, index) in openFiles"
      :key="file.path"
      class="tab"
      :class="{ active: index === activeTabIndex }"
      @click="$emit('switch-tab', index)"
    >
      <span class="tab-name">{{ file.displayName }}</span>
      <span v-if="file.isModified" class="modified-indicator">●</span>
      <button class="tab-close" @click.stop="$emit('close-tab', index)">×</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OpenFile } from '../composables/useTabManagement';

interface Props {
  openFiles: OpenFile[];
  activeTabIndex: number;
}

defineProps<Props>();

defineEmits<{
  'switch-tab': [index: number];
  'close-tab': [index: number];
}>();
</script>

<style scoped>
/* タブバー */
.tab-bar {
  display: flex;
  background-color: var(--tab-bg);
  border-bottom: 1px solid var(--tab-border);
  overflow-x: auto;
  overflow-y: hidden;
  flex-shrink: 0;
  min-height: 35px;
  white-space: nowrap;
}

.tab-bar::-webkit-scrollbar {
  height: 3px;
}

.tab-bar::-webkit-scrollbar-track {
  background: var(--tab-bg);
}

.tab-bar::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.tab-bar::-webkit-scrollbar-thumb:hover {
  background: var(--text-color);
}

.tab {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: var(--tab-bg);
  border-right: 1px solid var(--tab-border);
  cursor: pointer;
  user-select: none;
  min-width: 120px;
  max-width: 200px;
  transition: background-color 0.2s;
  position: relative;
  flex-shrink: 0;
}

.tab:hover {
  background-color: var(--tab-hover-bg);
}

.tab.active {
  background-color: var(--tab-active-bg);
  border-bottom: 2px solid var(--accent-color);
  margin-bottom: -1px;
}

.tab-name {
  flex: 1;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 8px;
  color: var(--text-color);
}

.tab.active .tab-name {
  font-weight: 500;
}

.modified-indicator {
  color: var(--accent-color);
  font-size: 12px;
  margin-right: 4px;
  font-weight: bold;
}

.tab-close {
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  font-size: 16px;
  padding: 2px 4px;
  border-radius: 3px;
  opacity: 0.6;
  transition:
    opacity 0.2s,
    background-color 0.2s;
  margin-left: 4px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-close:hover {
  opacity: 1;
  background-color: var(--hover-bg);
}

.tab.active .tab-close {
  opacity: 0.8;
}
</style>
