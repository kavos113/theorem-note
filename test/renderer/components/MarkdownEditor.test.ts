import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import MarkdownEditor from '../../../src/renderer/src/components/MarkdownEditor.vue';

// ElectronAPIのモック
const mockElectronAPI = {
  writeFile: vi.fn()
};

vi.stubGlobal('window', {
  electronAPI: mockElectronAPI
});

// highlight.jsの初期化をモック
vi.mock('../../../src/renderer/src/utils/highlightUtils', () => ({
  initializeHighlightJS: vi.fn(() => Promise.resolve()),
  createCodeRenderer: vi.fn(() => () => '<pre><code>mocked code</code></pre>')
}));

describe('MarkdownEditor.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof MarkdownEditor>>;

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
      wrapper = mount(MarkdownEditor, {
        props: {
          fileContent: '',
          showPreview: true
        }
      });

      expect(wrapper.exists()).toBe(true);
    });

    it('should display editor with initial content', () => {
      const initialContent = '# Hello World';
      wrapper = mount(MarkdownEditor, {
        props: {
          fileContent: initialContent,
          showPreview: true
        }
      });

      const textarea = wrapper.find('textarea');
      expect(textarea.exists()).toBe(true);
      expect(textarea.element.value).toBe(initialContent);
    });

    it('should show preview when showPreview is true', () => {
      wrapper = mount(MarkdownEditor, {
        props: {
          fileContent: '# Test',
          showPreview: true
        }
      });

      const preview = wrapper.find('.preview-pane');
      expect(preview.exists()).toBe(true);
    });
  });

  describe('プロパティ', () => {
    it('should accept fileContent prop', () => {
      const testContent = '## Test Content';
      wrapper = mount(MarkdownEditor, {
        props: {
          fileContent: testContent,
          showPreview: true
        }
      });

      expect(wrapper.props('fileContent')).toBe(testContent);
    });

    it('should accept showPreview prop', () => {
      wrapper = mount(MarkdownEditor, {
        props: {
          fileContent: '',
          showPreview: false
        }
      });

      expect(wrapper.props('showPreview')).toBe(false);
    });

    it('should accept selectedFilePath prop', () => {
      const testPath = '/test/file.md';
      wrapper = mount(MarkdownEditor, {
        props: {
          fileContent: '',
          showPreview: true,
          selectedFilePath: testPath
        }
      });

      expect(wrapper.props('selectedFilePath')).toBe(testPath);
    });
  });

  describe('内容の更新', () => {
    it('should emit update:fileContent when content changes', async () => {
      wrapper = mount(MarkdownEditor, {
        props: {
          fileContent: '',
          showPreview: true
        }
      });

      const textarea = wrapper.find('textarea');
      const newContent = 'New content';

      // 直接値を設定してinputイベントを手動で発火
      textarea.element.value = newContent;
      const inputEvent = new Event('input', { bubbles: true });
      textarea.element.dispatchEvent(inputEvent);

      await wrapper.vm.$nextTick();

      expect(wrapper.emitted('update:fileContent')).toBeTruthy();
      const emittedEvents = wrapper.emitted('update:fileContent');
      expect(emittedEvents![0]).toEqual([newContent]);
    });

    it('should update local content when fileContent prop changes', async () => {
      wrapper = mount(MarkdownEditor, {
        props: {
          fileContent: 'Initial content',
          showPreview: true
        }
      });

      const newContent = 'Updated content';
      await wrapper.setProps({ fileContent: newContent });

      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe(newContent);
    });
  });

  describe('ファイル保存', () => {
    it('should save file when selectedFilePath is provided', async () => {
      const testPath = '/test/file.md';
      const testContent = '# Test Content';
      mockElectronAPI.writeFile.mockResolvedValue(undefined);

      wrapper = mount(MarkdownEditor, {
        props: {
          fileContent: testContent,
          showPreview: true,
          selectedFilePath: testPath
        }
      });

      // ファイル保存メソッドを直接呼び出し
      const componentInstance = wrapper.vm;
      await componentInstance.saveFile();

      expect(mockElectronAPI.writeFile).toHaveBeenCalledWith(testPath, testContent);
      expect(wrapper.emitted('file-saved')).toBeTruthy();
    });

    it('should not save file when selectedFilePath is not provided', async () => {
      wrapper = mount(MarkdownEditor, {
        props: {
          fileContent: 'Test content',
          showPreview: true
        }
      });

      const componentInstance = wrapper.vm;
      await componentInstance.saveFile();

      expect(mockElectronAPI.writeFile).not.toHaveBeenCalled();
      expect(wrapper.emitted('file-saved')).toBeFalsy();
    });

    it('should handle save errors gracefully', async () => {
      const testPath = '/test/file.md';
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockElectronAPI.writeFile.mockRejectedValue(new Error('Save failed'));

      wrapper = mount(MarkdownEditor, {
        props: {
          fileContent: 'Test content',
          showPreview: true,
          selectedFilePath: testPath
        }
      });

      const componentInstance = wrapper.vm;
      await componentInstance.saveFile();

      expect(consoleErrorSpy).toHaveBeenCalledWith('ファイル保存エラー:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe('マークダウンプレビュー', () => {
    it('should render markdown as HTML in preview', async () => {
      const markdownContent = '# Hello\n\nThis is **bold** text.';
      wrapper = mount(MarkdownEditor, {
        props: {
          fileContent: markdownContent,
          showPreview: true
        }
      });

      const preview = wrapper.find('.markdown-preview');
      expect(preview.exists()).toBe(true);

      // マークダウンがHTMLに変換されていることを確認
      const htmlContent = preview.html();
      expect(htmlContent).toContain('<h1>');
      expect(htmlContent).toContain('<strong>');
    });

    it('should update preview when content changes', async () => {
      wrapper = mount(MarkdownEditor, {
        props: {
          fileContent: '# Initial',
          showPreview: true
        }
      });

      await wrapper.setProps({ fileContent: '## Updated' });
      await wrapper.vm.$nextTick();

      const preview = wrapper.find('.markdown-preview');
      expect(preview.exists()).toBe(true);
      const htmlContent = preview.html();
      expect(htmlContent).toContain('<h2>');
      expect(htmlContent).toContain('Updated');
    });
  });

  describe('キーボードショートカット', () => {
    it('should handle Ctrl+S keyboard shortcut', async () => {
      const testPath = '/test/file.md';
      mockElectronAPI.writeFile.mockResolvedValue(undefined);

      wrapper = mount(MarkdownEditor, {
        props: {
          fileContent: 'Test content',
          showPreview: true,
          selectedFilePath: testPath
        }
      });

      // キーボードイベントを直接作成してdispatch
      const keyEvent = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        bubbles: true
      });

      document.dispatchEvent(keyEvent);
      await wrapper.vm.$nextTick();

      expect(mockElectronAPI.writeFile).toHaveBeenCalledWith(testPath, 'Test content');
    });
  });
});
