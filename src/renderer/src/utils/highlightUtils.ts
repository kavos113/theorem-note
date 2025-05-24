import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/github-dark.css';

// 必要な言語をインポート
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import css from 'highlight.js/lib/languages/css';
import html from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import bash from 'highlight.js/lib/languages/bash';

// 言語登録の初期化フラグ
let isInitialized = false;

/**
 * highlight.jsの言語を登録する
 */
export function initializeHighlightJS(): void {
  if (isInitialized) return;

  // 言語を登録
  hljs.registerLanguage('javascript', javascript);
  hljs.registerLanguage('typescript', typescript);
  hljs.registerLanguage('python', python);
  hljs.registerLanguage('java', java);
  hljs.registerLanguage('cpp', cpp);
  hljs.registerLanguage('css', css);
  hljs.registerLanguage('html', html);
  hljs.registerLanguage('xml', html);
  hljs.registerLanguage('json', json);
  hljs.registerLanguage('markdown', markdown);
  hljs.registerLanguage('bash', bash);
  hljs.registerLanguage('sh', bash);

  isInitialized = true;
}

/**
 * コードをハイライト表示する
 * @param text - ハイライトするコード
 * @param lang - 言語名（オプション）
 * @returns ハイライト済みのHTMLコード
 */
export function highlightCode(text: string, lang?: string): string {
  // 初期化されていない場合は初期化
  if (!isInitialized) {
    initializeHighlightJS();
  }

  if (lang && hljs.getLanguage(lang)) {
    try {
      const highlighted = hljs.highlight(text, { language: lang }).value;
      return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
    } catch (err) {
      console.error('Highlight error:', err);
    }
  }

  // 言語が指定されていないか、サポートされていない場合は自動検出
  const highlighted = hljs.highlightAuto(text).value;
  return `<pre><code class="hljs">${highlighted}</code></pre>`;
}

/**
 * markedレンダラー用のコードハイライト関数
 * @param text - ハイライトするコード
 * @param lang - 言語名（オプション）
 * @returns ハイライト済みのHTMLコード
 */
export function createCodeRenderer() {
  return function ({ text, lang }: { text: string; lang?: string }): string {
    return highlightCode(text, lang);
  };
}
