import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import Versions from '../../../src/renderer/src/components/Versions.vue';

// Electronのモック
const mockVersions = {
  electron: '25.0.0',
  chrome: '114.0.0.0',
  node: '18.15.0'
};

vi.stubGlobal('window', {
  electron: {
    process: {
      versions: mockVersions
    }
  }
});

describe('Versions.vue', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = mount(Versions);
  });

  it('should render component correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('should display electron version', () => {
    const electronVersion = wrapper.find('.electron-version');
    expect(electronVersion.exists()).toBe(true);
    expect(electronVersion.text()).toBe(`Electron v${mockVersions.electron}`);
  });

  it('should display chrome version', () => {
    const chromeVersion = wrapper.find('.chrome-version');
    expect(chromeVersion.exists()).toBe(true);
    expect(chromeVersion.text()).toBe(`Chromium v${mockVersions.chrome}`);
  });

  it('should display node version', () => {
    const nodeVersion = wrapper.find('.node-version');
    expect(nodeVersion.exists()).toBe(true);
    expect(nodeVersion.text()).toBe(`Node v${mockVersions.node}`);
  });

  it('should render all versions in a list', () => {
    const versionsList = wrapper.find('.versions');
    expect(versionsList.exists()).toBe(true);

    const listItems = wrapper.findAll('li');
    expect(listItems).toHaveLength(3);
  });
});
