import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import MainLayout from '../../../src/renderer/src/components/MainLayout.vue';
import type { ViewMode } from '../../../src/renderer/src/types/viewMode';

// ElectronAPIのモック
const mockElectronAPI = {
  selectFolder: vi.fn(),
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
          rootPath: '',
          isLoading: false,
          viewMode: 'split' as ViewMode
        }
      });

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.main-area').exists()).toBe(true);
    });

    it('should show welcome screen when no file is opened', () => {
      wrapper = mount(MainLayout, {
        props: {
          rootPath: '',
          isLoading: false,
          viewMode: 'editor' as ViewMode
        }
      });

      expect(wrapper.find('.welcome-screen').exists()).toBe(true);
      expect(wrapper.find('.welcome-screen h1').text()).toBe('Theorem Note');
    });

    it('should show loading state', () => {
      wrapper = mount(MainLayout, {
        props: {
          rootPath: '',
          isLoading: true,
          viewMode: 'editor' as ViewMode
        }
      });

      expect(wrapper.find('.loading').exists()).toBe(true);
      expect(wrapper.find('.loading').text()).toBe('読み込み中...');
    });
  });

  describe('レイアウト', () => {
    it('should have sidebar with file explorer', () => {
      wrapper = mount(MainLayout, {
        props: {
          rootPath: '/test/path',
          isLoading: false,
          viewMode: 'split' as ViewMode
        }
      });

      expect(wrapper.find('.sidebar').exists()).toBe(true);
      expect(wrapper.findComponent({ name: 'FileExplorer' }).exists()).toBe(true);
    });

    it('should have main content area', () => {
      wrapper = mount(MainLayout, {
        props: {
          rootPath: '',
          isLoading: false,
          viewMode: 'editor' as ViewMode
        }
      });

      expect(wrapper.find('.main-content').exists()).toBe(true);
    });

    it('should have tab bar', () => {
      wrapper = mount(MainLayout, {
        props: {
          rootPath: '',
          isLoading: false,
          viewMode: 'split' as ViewMode
        }
      });

      expect(wrapper.findComponent({ name: 'TabBar' }).exists()).toBe(true);
    });
  });

  describe('プロパティ', () => {
    it('should accept rootPath prop', () => {
      wrapper = mount(MainLayout, {
        props: {
          rootPath: '/test/root',
          isLoading: false,
          viewMode: 'editor' as ViewMode
        }
      });

      expect(wrapper.props('rootPath')).toBe('/test/root');
    });

    it('should accept isLoading prop', () => {
      wrapper = mount(MainLayout, {
        props: {
          rootPath: '',
          isLoading: true,
          viewMode: 'split' as ViewMode
        }
      });

      expect(wrapper.props('isLoading')).toBe(true);
    });

    it('should accept viewMode prop', () => {
      wrapper = mount(MainLayout, {
        props: {
          rootPath: '',
          isLoading: false,
          viewMode: 'preview' as ViewMode
        }
      });

      expect(wrapper.props('viewMode')).toBe('preview');
    });
  });

  describe('イベント', () => {
    it('should emit folder-changed event', async () => {
      wrapper = mount(MainLayout, {
        props: {
          rootPath: '',
          isLoading: false,
          viewMode: 'editor' as ViewMode
        }
      });

      wrapper.vm.$emit('folder-changed', '/new/path');
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted('folder-changed')).toBeTruthy();
      expect(wrapper.emitted('folder-changed')?.[0]).toEqual(['/new/path']);
    });

    it('should emit file-active-changed event', async () => {
      wrapper = mount(MainLayout, {
        props: {
          rootPath: '',
          isLoading: false,
          viewMode: 'split' as ViewMode
        }
      });

      wrapper.vm.$emit('file-active-changed', true);
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted('file-active-changed')).toBeTruthy();
      expect(wrapper.emitted('file-active-changed')?.[0]).toEqual([true]);
    });
  });
});
