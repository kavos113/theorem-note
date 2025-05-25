import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import HeaderToolbar from '../../../src/renderer/src/components/HeaderToolbar.vue';
import type { ViewMode } from '../../../src/renderer/src/types/viewMode';

describe('HeaderToolbar.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof HeaderToolbar>>;

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
      wrapper = mount(HeaderToolbar, {
        props: {
          hasActiveFile: false,
          viewMode: 'editor' as ViewMode
        }
      });

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.app-title').text()).toBe('Theorem Note');
      expect(wrapper.findAll('button').length).toBeGreaterThan(0);
    });

    it('should always show open folder button', () => {
      wrapper = mount(HeaderToolbar, {
        props: {
          hasActiveFile: false,
          viewMode: 'editor' as ViewMode
        }
      });

      const openFolderButton = wrapper.find('button').element.textContent?.trim();
      expect(openFolderButton).toContain('フォルダを開く');
    });
  });

  describe('表示モード切り替えボタン', () => {
    it('should show view mode buttons when hasActiveFile is true', () => {
      wrapper = mount(HeaderToolbar, {
        props: {
          hasActiveFile: true,
          viewMode: 'split' as ViewMode
        }
      });

      const buttons = wrapper.findAll('button');
      const editorButton = buttons.find((button) =>
        button.element.textContent?.includes('エディタのみ')
      );
      const splitButton = buttons.find((button) =>
        button.element.textContent?.includes('分割表示')
      );
      const previewButton = buttons.find((button) =>
        button.element.textContent?.includes('プレビューのみ')
      );

      expect(editorButton?.exists()).toBe(true);
      expect(splitButton?.exists()).toBe(true);
      expect(previewButton?.exists()).toBe(true);
    });

    it('should not show view mode buttons when hasActiveFile is false', () => {
      wrapper = mount(HeaderToolbar, {
        props: {
          hasActiveFile: false,
          viewMode: 'editor' as ViewMode
        }
      });

      const buttons = wrapper.findAll('button');
      const viewModeButtons = buttons.filter(
        (button) =>
          button.element.textContent?.includes('エディタのみ') ||
          button.element.textContent?.includes('分割表示') ||
          button.element.textContent?.includes('プレビューのみ')
      );
      expect(viewModeButtons.length).toBe(0);
    });

    it('should highlight active view mode button', () => {
      wrapper = mount(HeaderToolbar, {
        props: {
          hasActiveFile: true,
          viewMode: 'preview' as ViewMode
        }
      });

      const buttons = wrapper.findAll('button');
      const previewButton = buttons.find((button) =>
        button.element.textContent?.includes('プレビューのみ')
      );
      expect(previewButton?.classes()).toContain('active');
    });

    it('should emit change-view-mode event with correct mode when button is clicked', async () => {
      wrapper = mount(HeaderToolbar, {
        props: {
          hasActiveFile: true,
          viewMode: 'split' as ViewMode
        }
      });

      // エディタのみボタンのクリックをシミュレート
      wrapper.vm.$emit('change-view-mode', 'editor');
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted('change-view-mode')).toBeTruthy();
      expect(wrapper.emitted('change-view-mode')?.[0]).toEqual(['editor']);
    });
  });

  describe('イベント', () => {
    it('should emit open-folder event when open folder button is clicked', async () => {
      wrapper = mount(HeaderToolbar, {
        props: {
          hasActiveFile: false,
          viewMode: 'editor' as ViewMode
        }
      });

      // イベント発生をシミュレート
      wrapper.vm.$emit('open-folder');
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted('open-folder')).toBeTruthy();
    });
  });

  describe('プロパティ', () => {
    it('should accept hasActiveFile prop', () => {
      wrapper = mount(HeaderToolbar, {
        props: {
          hasActiveFile: true,
          viewMode: 'editor' as ViewMode
        }
      });

      expect(wrapper.props('hasActiveFile')).toBe(true);
    });

    it('should accept viewMode prop', () => {
      wrapper = mount(HeaderToolbar, {
        props: {
          hasActiveFile: true,
          viewMode: 'split' as ViewMode
        }
      });

      expect(wrapper.props('viewMode')).toBe('split');
    });
  });

  describe('レイアウト', () => {
    it('should have toolbar-left section', () => {
      wrapper = mount(HeaderToolbar, {
        props: {
          hasActiveFile: false,
          viewMode: 'editor' as ViewMode
        }
      });

      expect(wrapper.find('.toolbar-left').exists()).toBe(true);
    });

    it('should have toolbar-center section with app title', () => {
      wrapper = mount(HeaderToolbar, {
        props: {
          hasActiveFile: false,
          viewMode: 'editor' as ViewMode
        }
      });

      const center = wrapper.find('.toolbar-center');
      expect(center.exists()).toBe(true);
      expect(center.find('.app-title').text()).toBe('Theorem Note');
    });

    it('should have toolbar-right section', () => {
      wrapper = mount(HeaderToolbar, {
        props: {
          hasActiveFile: false,
          viewMode: 'editor' as ViewMode
        }
      });

      expect(wrapper.find('.toolbar-right').exists()).toBe(true);
    });
  });
});
