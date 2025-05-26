import { describe, it, expect } from 'vitest';
import { markdownToHtml } from '../../../src/renderer/src/utils/markdownUtils';

describe('markdownToHtml', () => {
  it('should convert basic markdown to HTML', async () => {
    const markdown = '# Hello\n\nThis is a paragraph.';
    const expectedHtml = '<h1>Hello</h1>\n<p>This is a paragraph.</p>';
    const html = await markdownToHtml(markdown);
    expect(html).toBe(expectedHtml);
  });

  it('should highlight code blocks', async () => {
    const markdown = '```javascript\nconsole.log("Hello, world!");\n```';
    // Note: The exact HTML output for highlighted code can be complex and depend on the highlighter theme.
    // This test checks for the presence of common highlight.js classes.
    const html = await markdownToHtml(markdown);
    expect(html).toContain('<pre><code class="hljs language-javascript">');
    expect(html).toContain('Hello, world!');
    expect(html).toContain('</code></pre>');
  });
});
