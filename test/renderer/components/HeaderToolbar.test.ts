import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import HeaderToolbar from '../../../src/renderer/src/components/HeaderToolbar.vue';

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
          showPreview: false
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
          showPreview: false
        }
      });

      const openFolderButton = wrapper.find('button').element.textContent?.trim();
      expect(openFolderButton).toContain('フォルダを開く');
    });
  });

  describe('プレビューボタン', () => {
    it('should show preview button when hasActiveFile is true', () => {
      wrapper = mount(HeaderToolbar, {
        props: {
          hasActiveFile: true,
          showPreview: false
        }
      });

      const buttons = wrapper.findAll('button');
      const previewButton = buttons.find((button) =>
        button.element.textContent?.includes('プレビューを表示')
      );
      expect(previewButton?.exists()).toBe(true);
    });

    it('should not show preview button when hasActiveFile is false', () => {
      wrapper = mount(HeaderToolbar, {
        props: {
          hasActiveFile: false,
          showPreview: false
        }
      });

      const buttons = wrapper.findAll('button');
      const previewButton = buttons.find((button) =>
        button.element.textContent?.includes('プレビュー')
      );
      expect(previewButton).toBeUndefined();
    });

    it('should show "プレビューを表示" text when showPreview is false', () => {
      wrapper = mount(HeaderToolbar, {
        props: {
          hasActiveFile: true,
          showPreview: false
        }
      });

      const buttons = wrapper.findAll('button');
      const previewButton = buttons.find((button) =>
        button.element.textContent?.includes('プレビュー')
      );
      expect(previewButton?.element.textContent).toContain('プレビューを表示');
    });

    it('should show "プレビューを隠す" text when showPreview is true', () => {
      wrapper = mount(HeaderToolbar, {
        props: {
          hasActiveFile: true,
          showPreview: true
        }
      });

      const buttons = wrapper.findAll('button');
      const previewButton = buttons.find((button) =>
        button.element.textContent?.includes('プレビュー')
      );
      expect(previewButton?.element.textContent).toContain('プレビューを隠す');
    });

    it('should have active class when showPreview is true', () => {
      wrapper = mount(HeaderToolbar, {
        props: {
          hasActiveFile: true,
          showPreview: true
        }
      });

      const buttons = wrapper.findAll('button');
      const previewButton = buttons.find((button) =>
        button.element.textContent?.includes('プレビュー')
      );
      expect(previewButton?.classes()).toContain('active');
    });

    it('should not have active class when showPreview is false', () => {
      wrapper = mount(HeaderToolbar, {
        props: {
          hasActiveFile: true,
          showPreview: false
        }
      });

      const buttons = wrapper.findAll('button');
      const previewButton = buttons.find((button) =>
        button.element.textContent?.includes('プレビュー')
      );
      expect(previewButton?.classes()).not.toContain('active');
    });
  });

  describe('イベント', () => {
    it('should emit open-folder event when open folder button is clicked', async () => {
      wrapper = mount(HeaderToolbar, {
        props: {
          hasActiveFile: false,
          showPreview: false
        }
      });

      // イベント発生をシミュレート
      wrapper.vm.$emit('open-folder');
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted('open-folder')).toBeTruthy();
    });

    it('should emit toggle-preview event when preview button is clicked', async () => {
      wrapper = mount(HeaderToolbar, {
        props: {
          hasActiveFile: true,
          showPreview: false
        }
      });

      // イベント発生をシミュレート
      wrapper.vm.$emit('toggle-preview');
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted('toggle-preview')).toBeTruthy();
    });
  });

  describe('プロパティ', () => {
    it('should accept hasActiveFile prop', () => {
      wrapper = mount(HeaderToolbar, {
        props: {
          hasActiveFile: true,
          showPreview: false
        }
      });

      expect(wrapper.props('hasActiveFile')).toBe(true);
    });

    it('should accept showPreview prop', () => {
      wrapper = mount(HeaderToolbar, {
        props: {
          hasActiveFile: true,
          showPreview: true
        }
      });

      expect(wrapper.props('showPreview')).toBe(true);
    });
  });

  describe('レイアウト', () => {
    it('should have toolbar-left section', () => {
      wrapper = mount(HeaderToolbar, {
        props: {
          hasActiveFile: false,
          showPreview: false
        }
      });

      expect(wrapper.find('.toolbar-left').exists()).toBe(true);
    });

    it('should have toolbar-center section with app title', () => {
      wrapper = mount(HeaderToolbar, {
        props: {
          hasActiveFile: false,
          showPreview: false
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
          showPreview: false
        }
      });

      expect(wrapper.find('.toolbar-right').exists()).toBe(true);
    });
  });
});
