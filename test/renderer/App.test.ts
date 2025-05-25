import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import App from '../../src/renderer/src/App.vue';

// ElectronAPIのモック
const mockElectronAPI = {
  selectFolder: vi.fn(),
  getLastOpenedDirectory: vi.fn(),
  getFileTree: vi.fn()
};

vi.stubGlobal('window', {
  electronAPI: mockElectronAPI
});

describe('App.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof App>>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  describe('初期状態', () => {
    it('should render app correctly', () => {
      wrapper = mount(App);

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.app-container').exists()).toBe(true);
    });

    it('should have initial viewMode as split', () => {
      wrapper = mount(App);

      const headerToolbar = wrapper.findComponent({ name: 'HeaderToolbar' });
      expect(headerToolbar.props('viewMode')).toBe('split');
    });

    it('should have initial hasActiveFile as false', () => {
      wrapper = mount(App);

      const headerToolbar = wrapper.findComponent({ name: 'HeaderToolbar' });
      expect(headerToolbar.props('hasActiveFile')).toBe(false);
    });
  });

  describe('表示モード変更', () => {
    it('should change view mode when changeViewMode is called', async () => {
      wrapper = mount(App);

      const headerToolbar = wrapper.findComponent({ name: 'HeaderToolbar' });

      // change-view-modeイベントをエミット
      await headerToolbar.vm.$emit('change-view-mode', 'editor');

      expect(headerToolbar.props('viewMode')).toBe('editor');
    });

    it('should pass viewMode to MainLayout', async () => {
      wrapper = mount(App);

      const headerToolbar = wrapper.findComponent({ name: 'HeaderToolbar' });
      const mainLayout = wrapper.findComponent({ name: 'MainLayout' });

      // change-view-modeイベントをエミット
      await headerToolbar.vm.$emit('change-view-mode', 'preview');

      expect(mainLayout.props('viewMode')).toBe('preview');
    });
  });

  describe('コンポーネント配置', () => {
    it('should render HeaderToolbar component', () => {
      wrapper = mount(App);

      expect(wrapper.findComponent({ name: 'HeaderToolbar' }).exists()).toBe(true);
    });

    it('should render MainLayout component', () => {
      wrapper = mount(App);

      expect(wrapper.findComponent({ name: 'MainLayout' }).exists()).toBe(true);
    });
  });

  describe('イベント処理', () => {
    it('should handle folder-changed event from MainLayout', async () => {
      wrapper = mount(App);

      const mainLayout = wrapper.findComponent({ name: 'MainLayout' });

      await mainLayout.vm.$emit('folder-changed', '/test/path');

      // rootPathが更新されることを確認
      expect(mainLayout.props('rootPath')).toBe('/test/path');
    });

    it('should handle file-active-changed event from MainLayout', async () => {
      wrapper = mount(App);

      const mainLayout = wrapper.findComponent({ name: 'MainLayout' });
      const headerToolbar = wrapper.findComponent({ name: 'HeaderToolbar' });

      await mainLayout.vm.$emit('file-active-changed', true);

      // hasActiveFileが更新されることを確認
      expect(headerToolbar.props('hasActiveFile')).toBe(true);
    });
  });
});
