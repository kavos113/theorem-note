import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import MarkdownEditor from '../../../src/renderer/src/components/MarkdownEditor.vue';
import type { ViewMode } from '../../../src/renderer/src/types/viewMode';

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

// CodeMirrorのモック
const mockCodeMirrorInstance = {
  view: {},
  updateContent: vi.fn(),
  getContent: vi.fn(() => ''),
  destroy: vi.fn()
};

vi.mock('../../../src/renderer/src/utils/codeMirrorUtils', () => ({
  createCodeMirrorEditor: vi.fn(() => mockCodeMirrorInstance)
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
          viewMode: 'split' as ViewMode
        }
      });

      expect(wrapper.exists()).toBe(true);
    });

    it('should display editor with initial content', () => {
      const initialContent = '# Hello World';
      wrapper = mount(MarkdownEditor, {
        props: {
          fileContent: initialContent,
          viewMode: 'split' as ViewMode
        }
      });

      const textarea = wrapper.find('textarea');
      expect(textarea.exists()).toBe(true);
      expect(textarea.element.value).toBe(initialContent);
    });
  });

  describe('表示モード', () => {
    it('should show both editor and preview in split mode', () => {
      wrapper = mount(MarkdownEditor, {
        props: {
          fileContent: '# Test',
          viewMode: 'split' as ViewMode
        }
      });

      expect(wrapper.find('.editor-pane').exists()).toBe(true);
      expect(wrapper.find('.preview-pane').exists()).toBe(true);
      expect(wrapper.find('.resizer').exists()).toBe(true);
    });

    it('should show only editor in editor mode', () => {
      wrapper = mount(MarkdownEditor, {
        props: {
          fileContent: '# Test',
          viewMode: 'editor' as ViewMode
        }
      });

      expect(wrapper.find('.editor-pane').exists()).toBe(true);
      expect(wrapper.find('.preview-pane').exists()).toBe(false);
      expect(wrapper.find('.resizer').exists()).toBe(false);
    });

    it('should show only preview in preview mode', () => {
      wrapper = mount(MarkdownEditor, {
        props: {
          fileContent: '# Test',
          viewMode: 'preview' as ViewMode
        }
      });

      expect(wrapper.find('.editor-pane').exists()).toBe(false);
      expect(wrapper.find('.preview-pane').exists()).toBe(true);
      expect(wrapper.find('.resizer').exists()).toBe(false);
    });
  });

  describe('コンテンツ更新', () => {
    it('should emit update:fileContent when content changes', async () => {
      wrapper = mount(MarkdownEditor, {
        props: {
          fileContent: '',
          viewMode: 'editor' as ViewMode
        }
      });

      // handleContentChangeメソッドを直接呼び出す
      const mockEvent = {
        target: { value: 'New content' }
      } as unknown as Event;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (wrapper.vm as any).handleContentChange(mockEvent);

      expect(wrapper.emitted('update:fileContent')).toBeTruthy();
      expect(wrapper.emitted('update:fileContent')![0]).toEqual(['New content']);
    });

    it('should update local content when prop changes', async () => {
      wrapper = mount(MarkdownEditor, {
        props: {
          fileContent: 'Initial',
          viewMode: 'editor' as ViewMode
        }
      });

      await wrapper.setProps({ fileContent: 'Updated' });
      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe('Updated');
    });
  });

  describe('ファイル保存', () => {
    it('should save file when valid path is provided', async () => {
      mockElectronAPI.writeFile.mockResolvedValue(undefined);

      wrapper = mount(MarkdownEditor, {
        props: {
          selectedFilePath: '/test/path.md',
          fileContent: 'Test content',
          viewMode: 'editor' as ViewMode
        }
      });

      // Ctrl+Sのキーボードショートカットをシミュレート
      const keyEvent = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        bubbles: true
      });

      document.dispatchEvent(keyEvent);
      await wrapper.vm.$nextTick();

      expect(mockElectronAPI.writeFile).toHaveBeenCalledWith('/test/path.md', 'Test content');
      expect(wrapper.emitted('file-saved')).toBeTruthy();
    });

    it('should not save file when selectedFilePath is not provided', async () => {
      wrapper = mount(MarkdownEditor, {
        props: {
          fileContent: 'Test content',
          viewMode: 'editor' as ViewMode
        }
      });

      // Ctrl+Sのキーボードショートカットをシミュレート
      const keyEvent = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        bubbles: true
      });

      document.dispatchEvent(keyEvent);
      await wrapper.vm.$nextTick();

      expect(mockElectronAPI.writeFile).not.toHaveBeenCalled();
    });
  });

  describe('マークダウンプレビュー', () => {
    it('should render markdown content as HTML', () => {
      wrapper = mount(MarkdownEditor, {
        props: {
          fileContent: '# Test Header\n\nSome content',
          viewMode: 'preview' as ViewMode
        }
      });

      const preview = wrapper.find('.markdown-preview');
      expect(preview.exists()).toBe(true);

      const htmlContent = preview.html();
      expect(htmlContent).toContain('<h1');
      expect(htmlContent).toContain('Test Header');
    });

    it('should update preview when content changes', async () => {
      wrapper = mount(MarkdownEditor, {
        props: {
          fileContent: '# Original',
          viewMode: 'split' as ViewMode
        }
      });

      await wrapper.setProps({ fileContent: '# Updated' });

      const preview = wrapper.find('.markdown-preview');
      const htmlContent = preview.html();
      expect(htmlContent).toContain('Updated');
    });
  });

  describe('プロパティ', () => {
    it('should accept selectedFilePath prop', () => {
      wrapper = mount(MarkdownEditor, {
        props: {
          selectedFilePath: '/test/file.md',
          fileContent: '',
          viewMode: 'editor' as ViewMode
        }
      });

      expect(wrapper.props('selectedFilePath')).toBe('/test/file.md');
    });

    it('should accept fileContent prop', () => {
      wrapper = mount(MarkdownEditor, {
        props: {
          fileContent: 'Test content',
          viewMode: 'editor' as ViewMode
        }
      });

      expect(wrapper.props('fileContent')).toBe('Test content');
    });

    it('should accept viewMode prop', () => {
      wrapper = mount(MarkdownEditor, {
        props: {
          fileContent: '',
          viewMode: 'preview' as ViewMode
        }
      });

      expect(wrapper.props('viewMode')).toBe('preview');
    });
  });

  describe('シンタックスハイライト', () => {
    it('should have syntax highlighting enabled in editor', async () => {
      wrapper = mount(MarkdownEditor, {
        props: {
          fileContent: '# Test Header\n\n```javascript\nconst x = 1;\n```',
          viewMode: 'editor' as ViewMode
        }
      });

      // CodeMirrorコンテナが存在することを確認
      const editorContainer = wrapper.find('.codemirror-container');
      expect(editorContainer.exists()).toBe(true);
    });

    it('should apply markdown syntax highlighting', async () => {
      wrapper = mount(MarkdownEditor, {
        props: {
          fileContent: '# Heading\n\n**Bold text**\n\n- List item',
          viewMode: 'editor' as ViewMode
        }
      });

      // CodeMirrorコンテナが存在することを確認
      const editorContainer = wrapper.find('.codemirror-container');
      expect(editorContainer.exists()).toBe(true);

      // コンポーネントがマウントされた後のNextTickを待つ
      await wrapper.vm.$nextTick();

      // CodeMirrorが正しく初期化されたことを確認
      expect(wrapper.vm.codeMirrorInstance).toBeDefined();
    });

    it('should maintain content synchronization with CodeMirror', async () => {
      wrapper = mount(MarkdownEditor, {
        props: {
          fileContent: 'Initial content',
          viewMode: 'editor' as ViewMode
        }
      });

      // プロパティ変更時にCodeMirrorの内容も更新されることを確認
      await wrapper.setProps({ fileContent: 'Updated content' });

      // CodeMirrorエディタのコンテンツが更新されていることを確認
      expect(wrapper.vm.localContent).toBe('Updated content');
    });

    it('should emit content changes from CodeMirror', async () => {
      wrapper = mount(MarkdownEditor, {
        props: {
          fileContent: '',
          viewMode: 'editor' as ViewMode
        }
      });

      // CodeMirrorからの変更イベントをシミュレート
      const newContent = 'New content from CodeMirror';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (wrapper.vm as any).handleCodeMirrorChange(newContent);

      expect(wrapper.emitted('update:fileContent')).toBeTruthy();
      expect(wrapper.emitted('update:fileContent')![0]).toEqual([newContent]);
    });
  });
});
