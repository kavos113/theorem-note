<script setup lang="ts">
import { ref, computed } from 'vue';

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileItem[];
}

const props = defineProps<{
  item: FileItem;
  selectedFile?: string;
}>();

const emit = defineEmits<{
  (e: 'select-file', path: string): void;
}>();

const isExpanded = ref(false);

const isSelected = computed(() => {
  return props.selectedFile === props.item.path;
});

const handleClick = (): void => {
  if (props.item.isDirectory) {
    isExpanded.value = !isExpanded.value;
  } else {
    emit('select-file', props.item.path);
  }
};
</script>

<template>
  <li class="file-tree-item">
    <div
      class="item-content"
      :class="{ 'is-directory': item.isDirectory, 'is-selected': isSelected }"
      @click="handleClick"
    >
      <span v-if="item.isDirectory" class="folder-arrow" :class="{ expanded: isExpanded }">
        &gt;
      </span>
      <span class="icon">
        <span v-if="item.isDirectory" class="folder-icon">
          {{ isExpanded ? '📂' : '📁' }}
        </span>
        <span v-else class="file-icon">📄</span>
      </span>
      <span class="name">{{ item.name }}</span>
    </div>
    <ul v-if="item.isDirectory && isExpanded && item.children" class="children">
      <file-tree-item
        v-for="child in item.children"
        :key="child.path"
        :item="child"
        :selected-file="selectedFile"
        @select-file="$emit('select-file', $event)"
      />
    </ul>
  </li>
</template>

<style scoped>
.file-tree-item {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.item-content {
  display: flex;
  align-items: center;
  padding: 3px 8px;
  cursor: pointer;
  border-radius: 3px;
}

.item-content:hover {
  background-color: var(--hover-bg, #eaeaea);
}

.is-selected {
  background-color: var(--accent-color, #0078d7);
  color: white;
}

.is-selected:hover {
  background-color: var(--accent-color, #0078d7);
}

.folder-arrow {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 4px;
  font-size: 10px;
  transition: transform 0.2s;
  transform: rotate(0deg);
}

.folder-arrow.expanded {
  transform: rotate(90deg);
}

.icon {
  margin-right: 6px;
  font-size: 14px;
  width: 16px;
  text-align: center;
}

.name {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.children {
  list-style-type: none;
  margin: 0;
  padding: 0 0 0 16px;
}
</style>
