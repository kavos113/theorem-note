import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import FileExplorer from '../../../src/renderer/src/components/FileExplorer.vue';

// FileTreeItemのモック
const FileTreeItemMock = {
  name: 'FileTreeItem',
  template: '<div class="mock-file-tree-item">{{ item.name }}</div>',
  props: ['item', 'selectedFile'],
  emits: ['select-file']
};

// ElectronAPIのモック
const mockElectronAPI = {
  getNewDirectoryFileTree: vi.fn(),
  getLastOpenedDirectory: vi.fn(),
  getFileTree: vi.fn()
};

vi.stubGlobal('window', {
  electronAPI: mockElectronAPI
});

describe('FileExplorer.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof FileExplorer>>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  describe('初期状態', () => {
    it('should render component correctly', () => {
      wrapper = mount(FileExplorer, {
        global: {
          components: {
            FileTreeItem: FileTreeItemMock
          }
        }
      });

      expect(wrapper.exists()).toBe(true);
    });

    it('should display explorer header', () => {
      wrapper = mount(FileExplorer, {
        global: {
          components: {
            FileTreeItem: FileTreeItemMock
          }
        }
      });

      const header = wrapper.find('.explorer-header');
      expect(header.exists()).toBe(true);
      expect(header.find('h3').text()).toBe('エクスプローラー');
    });

    it('should display folder button', () => {
      wrapper = mount(FileExplorer, {
        global: {
          components: {
            FileTreeItem: FileTreeItemMock
          }
        }
      });

      const folderButton = wrapper.find('.folder-button');
      expect(folderButton.exists()).toBe(true);
      expect(folderButton.attributes('title')).toBe('フォルダを開く');
    });

    it('should show no folder message when no rootPath is provided', () => {
      wrapper = mount(FileExplorer, {
        global: {
          components: {
            FileTreeItem: FileTreeItemMock
          }
        }
      });

      const noFolder = wrapper.find('.no-folder');
      expect(noFolder.exists()).toBe(true);
      expect(noFolder.find('p').text()).toBe('フォルダが選択されていません');
    });
  });

  describe('プロパティ', () => {
    it('should accept rootPath prop', () => {
      const testPath = 'C:\\test\\path';
      mockElectronAPI.getFileTree.mockResolvedValue([]);

      wrapper = mount(FileExplorer, {
        props: {
          rootPath: testPath
        },
        global: {
          components: {
            FileTreeItem: FileTreeItemMock
          }
        }
      });

      expect(wrapper.props('rootPath')).toBe(testPath);
    });

    it('should accept selectedFile prop', () => {
      const testFile = 'test.md';

      wrapper = mount(FileExplorer, {
        props: {
          selectedFile: testFile
        },
        global: {
          components: {
            FileTreeItem: FileTreeItemMock
          }
        }
      });

      expect(wrapper.props('selectedFile')).toBe(testFile);
    });
  });

  describe('フォルダ選択', () => {
    it('should call getNewDirectoryFileTree when openFolder is called', async () => {
      mockElectronAPI.getNewDirectoryFileTree.mockResolvedValue([
        { name: 'test.md', path: 'C:\\test\\test.md', isDirectory: false }
      ]);

      wrapper = mount(FileExplorer, {
        global: {
          components: {
            FileTreeItem: FileTreeItemMock
          }
        }
      });

      // スパイを使用してクリックイベントをシミュレート
      const folderButton = wrapper.find('.folder-button');
      expect(folderButton.exists()).toBe(true);

      // コンポーネント内部の関数を直接テスト
      await wrapper.vm.openFolder();

      expect(mockElectronAPI.getNewDirectoryFileTree).toHaveBeenCalled();
    });

    it('should emit folder-changed event when folder is opened', async () => {
      mockElectronAPI.getNewDirectoryFileTree.mockResolvedValue([
        { name: 'test.md', path: 'C:\\test\\test.md', isDirectory: false }
      ]);

      wrapper = mount(FileExplorer, {
        global: {
          components: {
            FileTreeItem: FileTreeItemMock
          }
        }
      });

      await wrapper.vm.openFolder();
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted('folder-changed')).toBeTruthy();
    });
  });

  describe('ローディング状態', () => {
    it('should show loading message when loading', async () => {
      // ローディング状態をシミュレート
      mockElectronAPI.getFileTree.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
      );

      wrapper = mount(FileExplorer, {
        props: {
          rootPath: 'C:\\test'
        },
        global: {
          components: {
            FileTreeItem: FileTreeItemMock
          }
        }
      });

      // 初期状態でローディングが表示されるかチェック
      await wrapper.vm.$nextTick();
      const loading = wrapper.find('.loading');
      expect(loading.exists()).toBe(true);
      expect(loading.text()).toBe('読み込み中...');
    });
  });

  describe('エラー処理', () => {
    it('should display error message when file tree loading fails', async () => {
      const errorMessage = 'ファイル読み込みエラー';
      mockElectronAPI.getFileTree.mockRejectedValue(new Error(errorMessage));

      wrapper = mount(FileExplorer, {
        props: {
          rootPath: 'C:\\test'
        },
        global: {
          components: {
            FileTreeItem: FileTreeItemMock
          }
        }
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 10)); // エラーハンドリングの時間を待つ
      await wrapper.vm.$nextTick();

      const error = wrapper.find('.error');
      expect(error.exists()).toBe(true);
      expect(error.text()).toBe(errorMessage);
    });
  });
});
