import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import MainLayout from '../../../src/renderer/src/components/MainLayout.vue';

// ElectronAPIのモック
const mockElectronAPI = {
  readFile: vi.fn(),
  writeFile: vi.fn(),
  getNewDirectoryFileTree: vi.fn(),
  getLastOpenedDirectory: vi.fn(),
  getFileTree: vi.fn()
};

vi.stubGlobal('window', {
  electronAPI: mockElectronAPI
});

describe('MainLayout.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof MainLayout>>;

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
      wrapper = mount(MainLayout, {
        props: {
          rootPath: '/test',
          isLoading: false,
          showPreview: false
        },
        global: {
          stubs: {
            FileExplorer: true,
            MarkdownEditor: true,
            TabBar: true
          }
        }
      });

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.main-area').exists()).toBe(true);
      expect(wrapper.find('.sidebar').exists()).toBe(true);
      expect(wrapper.find('.main-content').exists()).toBe(true);
    });

    it('should show welcome screen when no file is selected', () => {
      wrapper = mount(MainLayout, {
        props: {
          rootPath: '/test',
          isLoading: false,
          showPreview: false
        },
        global: {
          stubs: {
            FileExplorer: true,
            MarkdownEditor: true,
            TabBar: true
          }
        }
      });

      expect(wrapper.find('.welcome-screen').exists()).toBe(true);
      expect(wrapper.find('.welcome-screen h1').text()).toBe('Theorem Note');
    });

    it('should show loading state when isLoading is true', () => {
      wrapper = mount(MainLayout, {
        props: {
          rootPath: '/test',
          isLoading: true,
          showPreview: false
        },
        global: {
          stubs: {
            FileExplorer: true,
            MarkdownEditor: true,
            TabBar: true
          }
        }
      });

      expect(wrapper.find('.loading').exists()).toBe(true);
      expect(wrapper.find('.loading').text()).toBe('読み込み中...');
      expect(wrapper.find('.welcome-screen').exists()).toBe(false);
    });
  });

  describe('コンポーネント構造', () => {
    it('should render FileExplorer component in sidebar', () => {
      wrapper = mount(MainLayout, {
        props: {
          rootPath: '/test',
          isLoading: false,
          showPreview: false
        },
        global: {
          stubs: {
            FileExplorer: true,
            MarkdownEditor: true,
            TabBar: true
          }
        }
      });

      const sidebar = wrapper.find('.sidebar');
      expect(sidebar.exists()).toBe(true);
      expect(sidebar.find('file-explorer-stub').exists()).toBe(true);
    });

    it('should render TabBar component in main content', () => {
      wrapper = mount(MainLayout, {
        props: {
          rootPath: '/test',
          isLoading: false,
          showPreview: false
        },
        global: {
          stubs: {
            FileExplorer: true,
            MarkdownEditor: true,
            TabBar: true
          }
        }
      });

      const mainContent = wrapper.find('.main-content');
      expect(mainContent.exists()).toBe(true);
      expect(mainContent.find('tab-bar-stub').exists()).toBe(true);
    });
  });

  describe('プロパティ', () => {
    it('should accept rootPath prop', () => {
      wrapper = mount(MainLayout, {
        props: {
          rootPath: '/test/path',
          isLoading: false,
          showPreview: false
        },
        global: {
          stubs: {
            FileExplorer: true,
            MarkdownEditor: true,
            TabBar: true
          }
        }
      });

      expect(wrapper.props('rootPath')).toBe('/test/path');
    });

    it('should accept isLoading prop', () => {
      wrapper = mount(MainLayout, {
        props: {
          rootPath: '/test',
          isLoading: true,
          showPreview: false
        },
        global: {
          stubs: {
            FileExplorer: true,
            MarkdownEditor: true,
            TabBar: true
          }
        }
      });

      expect(wrapper.props('isLoading')).toBe(true);
    });

    it('should accept showPreview prop', () => {
      wrapper = mount(MainLayout, {
        props: {
          rootPath: '/test',
          isLoading: false,
          showPreview: true
        },
        global: {
          stubs: {
            FileExplorer: true,
            MarkdownEditor: true,
            TabBar: true
          }
        }
      });

      expect(wrapper.props('showPreview')).toBe(true);
    });
  });

  describe('ファイル処理', () => {
    it('should handle file selection from FileExplorer', async () => {
      wrapper = mount(MainLayout, {
        props: {
          rootPath: '/test',
          isLoading: false,
          showPreview: false
        },
        global: {
          stubs: {
            FileExplorer: {
              template:
                "<div @click=\"$emit('select-file', '/test/file.md')\">Mock FileExplorer</div>"
            },
            MarkdownEditor: true,
            TabBar: {
              template: '<div>Mock TabBar</div>',
              methods: {
                openFileInTab: vi.fn()
              }
            }
          }
        }
      });

      await wrapper.vm.handleFileSelect('/test/file.md');

      // TabBarのopenFileInTabが呼ばれることを期待
      // (実際の実装ではtabBarRef.value.openFileInTabが呼ばれる)
    });

    it('should emit file-active-changed when currentFile changes', async () => {
      wrapper = mount(MainLayout, {
        props: {
          rootPath: '/test',
          isLoading: false,
          showPreview: false
        },
        global: {
          stubs: {
            FileExplorer: true,
            MarkdownEditor: true,
            TabBar: true
          }
        }
      });

      // currentFileを変更
      const testFile = {
        path: '/test/file.md',
        content: '# Test',
        isModified: false,
        displayName: 'file.md'
      };

      wrapper.vm.currentFile = testFile;
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted('file-active-changed')).toBeTruthy();
      expect(wrapper.emitted('file-active-changed')![0]).toEqual([true]);
    });

    it('should handle file opened event from TabBar', async () => {
      wrapper = mount(MainLayout, {
        props: {
          rootPath: '/test',
          isLoading: false,
          showPreview: false
        },
        global: {
          stubs: {
            FileExplorer: true,
            MarkdownEditor: true,
            TabBar: true
          }
        }
      });

      const testFile = {
        path: '/test/file.md',
        content: '# Test File',
        isModified: false,
        displayName: 'file.md'
      };

      wrapper.vm.handleFileOpened(testFile);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.currentFile).toEqual(testFile);
      expect(wrapper.vm.selectedFilePath).toBe('/test/file.md');
    });

    it('should handle file switched event from TabBar', async () => {
      wrapper = mount(MainLayout, {
        props: {
          rootPath: '/test',
          isLoading: false,
          showPreview: false
        },
        global: {
          stubs: {
            FileExplorer: true,
            MarkdownEditor: true,
            TabBar: true
          }
        }
      });

      const testFile = {
        path: '/test/other.md',
        content: '# Other File',
        isModified: false,
        displayName: 'other.md'
      };

      wrapper.vm.handleFileSwitched(testFile);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.currentFile).toEqual(testFile);
      expect(wrapper.vm.selectedFilePath).toBe('/test/other.md');
    });
  });

  describe('エディター状態', () => {
    it('should show editor container when currentFile exists', async () => {
      wrapper = mount(MainLayout, {
        props: {
          rootPath: '/test',
          isLoading: false,
          showPreview: false
        },
        global: {
          stubs: {
            FileExplorer: true,
            MarkdownEditor: true,
            TabBar: true
          }
        }
      });

      wrapper.vm.currentFile = {
        path: '/test/file.md',
        content: '# Test',
        isModified: false,
        displayName: 'file.md'
      };
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.editor-container').exists()).toBe(true);
      expect(wrapper.find('.welcome-screen').exists()).toBe(false);
    });

    it('should handle content update from MarkdownEditor', async () => {
      wrapper = mount(MainLayout, {
        props: {
          rootPath: '/test',
          isLoading: false,
          showPreview: false
        },
        global: {
          stubs: {
            FileExplorer: true,
            MarkdownEditor: true,
            TabBar: {
              template: '<div>Mock TabBar</div>',
              methods: {
                updateFileContent: vi.fn()
              }
            }
          }
        }
      });

      wrapper.vm.currentFile = {
        path: '/test/file.md',
        content: '# Test',
        isModified: false,
        displayName: 'file.md'
      };

      // updateFileContentのモック関数を作成
      const mockUpdateFileContent = vi.fn();
      wrapper.vm.tabBarRef = {
        updateFileContent: mockUpdateFileContent
      };

      wrapper.vm.handleContentUpdate('# Updated Content');

      expect(mockUpdateFileContent).toHaveBeenCalledWith('/test/file.md', '# Updated Content');
    });

    it('should handle file saved event from MarkdownEditor', async () => {
      wrapper = mount(MainLayout, {
        props: {
          rootPath: '/test',
          isLoading: false,
          showPreview: false
        },
        global: {
          stubs: {
            FileExplorer: true,
            MarkdownEditor: true,
            TabBar: {
              template: '<div>Mock TabBar</div>',
              methods: {
                markFileAsSaved: vi.fn()
              }
            }
          }
        }
      });

      wrapper.vm.currentFile = {
        path: '/test/file.md',
        content: '# Test',
        isModified: true,
        displayName: 'file.md'
      };

      // markFileAsSavedのモック関数を作成
      const mockMarkFileAsSaved = vi.fn();
      wrapper.vm.tabBarRef = {
        markFileAsSaved: mockMarkFileAsSaved
      };

      wrapper.vm.handleFileSaved();

      expect(mockMarkFileAsSaved).toHaveBeenCalledWith('/test/file.md');
    });
  });
});
