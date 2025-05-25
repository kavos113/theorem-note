import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import FileTreeItem from '../../../src/renderer/src/components/FileTreeItem.vue';

describe('FileTreeItem.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof FileTreeItem>>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  describe('初期状態', () => {
    it('should render file item correctly', () => {
      const fileItem = {
        name: 'test.md',
        path: '/test/test.md',
        isDirectory: false
      };

      wrapper = mount(FileTreeItem, {
        props: {
          item: fileItem
        }
      });

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.name').text()).toBe('test.md');
      expect(wrapper.find('.file-icon').exists()).toBe(true);
      expect(wrapper.find('.folder-arrow').exists()).toBe(false);
    });

    it('should render directory item correctly', () => {
      const directoryItem = {
        name: 'test-folder',
        path: '/test/test-folder',
        isDirectory: true,
        children: []
      };

      wrapper = mount(FileTreeItem, {
        props: {
          item: directoryItem
        }
      });

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.name').text()).toBe('test-folder');
      expect(wrapper.find('.folder-icon').exists()).toBe(true);
      expect(wrapper.find('.folder-arrow').exists()).toBe(true);
      expect(wrapper.find('.children').exists()).toBe(false); // 初期状態では展開されていない
    });
  });

  describe('ファイル選択', () => {
    it('should emit select-file event when file is clicked', async () => {
      const fileItem = {
        name: 'test.md',
        path: '/test/test.md',
        isDirectory: false
      };

      wrapper = mount(FileTreeItem, {
        props: {
          item: fileItem
        }
      });

      await wrapper.vm.handleClick();
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted('select-file')).toBeTruthy();
      expect(wrapper.emitted('select-file')![0]).toEqual(['/test/test.md']);
    });

    it('should not emit select-file event when directory is clicked', async () => {
      const directoryItem = {
        name: 'test-folder',
        path: '/test/test-folder',
        isDirectory: true,
        children: []
      };

      wrapper = mount(FileTreeItem, {
        props: {
          item: directoryItem
        }
      });

      await wrapper.vm.handleClick();
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted('select-file')).toBeFalsy();
    });

    it('should show selected state when selectedFile prop matches', () => {
      const fileItem = {
        name: 'test.md',
        path: '/test/test.md',
        isDirectory: false
      };

      wrapper = mount(FileTreeItem, {
        props: {
          item: fileItem,
          selectedFile: '/test/test.md'
        }
      });

      const itemContent = wrapper.find('.item-content');
      expect(itemContent.classes()).toContain('is-selected');
    });

    it('should not show selected state when selectedFile prop does not match', () => {
      const fileItem = {
        name: 'test.md',
        path: '/test/test.md',
        isDirectory: false
      };

      wrapper = mount(FileTreeItem, {
        props: {
          item: fileItem,
          selectedFile: '/other/file.md'
        }
      });

      const itemContent = wrapper.find('.item-content');
      expect(itemContent.classes()).not.toContain('is-selected');
    });
  });

  describe('ディレクトリ展開', () => {
    it('should toggle directory expansion when clicked', async () => {
      const directoryItem = {
        name: 'test-folder',
        path: '/test/test-folder',
        isDirectory: true,
        children: [
          {
            name: 'child.md',
            path: '/test/test-folder/child.md',
            isDirectory: false
          }
        ]
      };

      wrapper = mount(FileTreeItem, {
        props: {
          item: directoryItem
        }
      });

      // 初期状態では展開されていない
      expect(wrapper.find('.children').exists()).toBe(false);
      expect(wrapper.find('.folder-arrow').classes()).not.toContain('expanded');

      // クリックして展開
      await wrapper.vm.handleClick();
      await wrapper.vm.$nextTick();

      // 展開状態になる
      expect(wrapper.find('.children').exists()).toBe(true);
      expect(wrapper.find('.folder-arrow').classes()).toContain('expanded');
    });

    it('should display correct folder icon based on expansion state', async () => {
      const directoryItem = {
        name: 'test-folder',
        path: '/test/test-folder',
        isDirectory: true,
        children: []
      };

      wrapper = mount(FileTreeItem, {
        props: {
          item: directoryItem
        }
      });

      // 初期状態（閉じている）
      expect(wrapper.find('.folder-icon').text()).toBe('📁');

      // 展開
      await wrapper.vm.handleClick();
      await wrapper.vm.$nextTick();

      // 展開状態
      expect(wrapper.find('.folder-icon').text()).toBe('📂');
    });

    it('should render child items when directory is expanded', async () => {
      const directoryItem = {
        name: 'test-folder',
        path: '/test/test-folder',
        isDirectory: true,
        children: [
          {
            name: 'child1.md',
            path: '/test/test-folder/child1.md',
            isDirectory: false
          },
          {
            name: 'child2.md',
            path: '/test/test-folder/child2.md',
            isDirectory: false
          }
        ]
      };

      wrapper = mount(FileTreeItem, {
        props: {
          item: directoryItem
        },
        global: {
          stubs: {
            'file-tree-item': true
          }
        }
      });

      // 展開
      await wrapper.vm.handleClick();
      await wrapper.vm.$nextTick();

      // 子要素が表示される
      const children = wrapper.find('.children');
      expect(children.exists()).toBe(true);
      const childItems = children.findAll('file-tree-item-stub');
      expect(childItems).toHaveLength(2);
    });
  });

  describe('プロパティ', () => {
    it('should accept item prop', () => {
      const item = {
        name: 'test.md',
        path: '/test/test.md',
        isDirectory: false
      };

      wrapper = mount(FileTreeItem, {
        props: { item }
      });

      expect(wrapper.props('item')).toEqual(item);
    });

    it('should accept optional selectedFile prop', () => {
      const item = {
        name: 'test.md',
        path: '/test/test.md',
        isDirectory: false
      };

      wrapper = mount(FileTreeItem, {
        props: {
          item,
          selectedFile: '/test/test.md'
        }
      });

      expect(wrapper.props('selectedFile')).toBe('/test/test.md');
    });
  });
});
