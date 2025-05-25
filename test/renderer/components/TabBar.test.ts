import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import TabBar from '../../../src/renderer/src/components/TabBar.vue';

// ElectronAPIのモック
const mockElectronAPI = {
  readFile: vi.fn()
};

vi.stubGlobal('window', {
  electronAPI: mockElectronAPI
});

describe('TabBar.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof TabBar>>;

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
      wrapper = mount(TabBar);
      expect(wrapper.exists()).toBe(true);
    });

    it('should not render tab bar when no files are open', () => {
      wrapper = mount(TabBar);
      const tabBar = wrapper.find('.tab-bar');
      expect(tabBar.exists()).toBe(false);
    });
  });

  describe('ファイル管理', () => {
    it('should open a new file', async () => {
      wrapper = mount(TabBar);

      const testFile = {
        path: '/test/file1.md',
        content: '# Test File 1'
      };

      // ElectronAPI.readFileのモック設定
      mockElectronAPI.readFile.mockResolvedValue(testFile.content);

      // ファイルを開く
      const componentInstance = wrapper.vm;
      await componentInstance.openFileInTab(testFile.path);
      await wrapper.vm.$nextTick();

      // タブバーが表示される
      const tabBar = wrapper.find('.tab-bar');
      expect(tabBar.exists()).toBe(true);

      // タブが1つ表示される
      const tabs = wrapper.findAll('.tab');
      expect(tabs).toHaveLength(1);
      expect(tabs[0].text()).toContain('file1.md');

      // file-openedイベントが発火される
      expect(wrapper.emitted('file-opened')).toBeTruthy();
    });

    it('should switch between tabs', async () => {
      wrapper = mount(TabBar);
      const componentInstance = wrapper.vm;

      const file1 = {
        path: '/test/file1.md',
        content: '# File 1'
      };

      const file2 = {
        path: '/test/file2.md',
        content: '# File 2'
      };

      // ElectronAPI.readFileのモック設定
      mockElectronAPI.readFile.mockImplementation((path: string) => {
        if (path === file1.path) return Promise.resolve(file1.content);
        if (path === file2.path) return Promise.resolve(file2.content);
        return Promise.resolve('');
      });

      // 2つのファイルを開く
      await componentInstance.openFileInTab(file1.path);
      await componentInstance.openFileInTab(file2.path);
      await wrapper.vm.$nextTick();

      // 2つのタブが表示される
      const tabs = wrapper.findAll('.tab');
      expect(tabs).toHaveLength(2);

      // 最初のタブをクリック
      componentInstance.switchToTab(0);
      await wrapper.vm.$nextTick();

      // file-switchedイベントが発火される
      expect(wrapper.emitted('file-switched')).toBeTruthy();
    });

    it('should close a tab', async () => {
      wrapper = mount(TabBar);
      const componentInstance = wrapper.vm as any;

      const testFile = {
        path: '/test/file1.md',
        content: '# Test File'
      };

      // ElectronAPI.readFileのモック設定
      mockElectronAPI.readFile.mockResolvedValue(testFile.content);

      // ファイルを開く
      await componentInstance.openFileInTab(testFile.path);
      await wrapper.vm.$nextTick();

      // 閉じるボタンをクリック
      componentInstance.closeTab(0);
      await wrapper.vm.$nextTick();

      // file-closedイベントが発火される
      expect(wrapper.emitted('file-closed')).toBeTruthy();
    });

    it('should show modified indicator when file is modified', async () => {
      wrapper = mount(TabBar);
      const componentInstance = wrapper.vm as any;

      const testFile = {
        path: '/test/modified.md',
        content: '# Modified File'
      };

      // ElectronAPI.readFileのモック設定
      mockElectronAPI.readFile.mockResolvedValue(testFile.content);

      await componentInstance.openFileInTab(testFile.path);
      await wrapper.vm.$nextTick();

      // ファイルの内容を変更して変更フラグを設定
      componentInstance.updateFileContent(testFile.path, '# Modified Content');
      await wrapper.vm.$nextTick();

      // 変更インジケータが表示される
      const modifiedIndicator = wrapper.find('.modified-indicator');
      expect(modifiedIndicator.exists()).toBe(true);
      expect(modifiedIndicator.text()).toBe('●');
    });

    it('should not show modified indicator when file is not modified', async () => {
      wrapper = mount(TabBar);
      const componentInstance = wrapper.vm as any;

      const testFile = {
        path: '/test/unmodified.md',
        content: '# Unmodified File'
      };

      // ElectronAPI.readFileのモック設定
      mockElectronAPI.readFile.mockResolvedValue(testFile.content);

      await componentInstance.openFileInTab(testFile.path);
      await wrapper.vm.$nextTick();

      // 変更インジケータが表示されない
      const modifiedIndicator = wrapper.find('.modified-indicator');
      expect(modifiedIndicator.exists()).toBe(false);
    });
  });

  describe('アクティブタブ', () => {
    it('should mark the active tab with active class', async () => {
      wrapper = mount(TabBar);
      const componentInstance = wrapper.vm as any;

      const file1 = {
        path: '/test/file1.md',
        content: '# File 1'
      };

      const file2 = {
        path: '/test/file2.md',
        content: '# File 2'
      };

      // ElectronAPI.readFileのモック設定
      mockElectronAPI.readFile.mockImplementation((path: string) => {
        if (path === file1.path) return Promise.resolve(file1.content);
        if (path === file2.path) return Promise.resolve(file2.content);
        return Promise.resolve('');
      });

      // 2つのファイルを開く
      await componentInstance.openFileInTab(file1.path);
      await componentInstance.openFileInTab(file2.path);
      await wrapper.vm.$nextTick();

      const tabs = wrapper.findAll('.tab');

      // 2番目のタブがアクティブになっているはず
      expect(tabs[1].classes()).toContain('active');
      expect(tabs[0].classes()).not.toContain('active');
    });

    it('should return current active file', async () => {
      wrapper = mount(TabBar);
      const componentInstance = wrapper.vm as any;

      const testFile = {
        path: '/test/active.md',
        content: '# Active File'
      };

      // ElectronAPI.readFileのモック設定
      mockElectronAPI.readFile.mockResolvedValue(testFile.content);

      await componentInstance.openFileInTab(testFile.path);
      await wrapper.vm.$nextTick();

      // アクティブなファイルを取得
      const activeFile = componentInstance.activeFile;
      expect(activeFile.path).toBe(testFile.path);
      expect(activeFile.content).toBe(testFile.content);
    });
  });

  describe('プロパティ', () => {
    it('should accept isLoading prop', () => {
      wrapper = mount(TabBar, {
        props: {
          isLoading: true
        }
      });

      expect(wrapper.props('isLoading')).toBe(true);
    });
  });
});
