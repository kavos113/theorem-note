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

describe('markdownToHtml obsidian image links', () => {
  it('should convert obsidian image link', async () => {
    const input = '![[image.png]]';
    const output = await markdownToHtml(input);
    expect(output).toContain('<img src="image.png" alt="image.png">');
  });

  it('should convert multiple image links', async () => {
    const input = '![[image1.png]] and ![[image2.jpg]]';
    const output = await markdownToHtml(input);
    expect(output).toContain('<img src="image1.png" alt="image1.png">');
    expect(output).toContain('<img src="image2.jpg" alt="image2.jpg">');
  });

  it('should convert link with text', async () => {
    const input = 'これは画像です: ![[photo.png]]';
    const output = await markdownToHtml(input);
    expect(output).toContain('これは画像です: <img src="photo.png" alt="photo.png">');
  });

  it('should convert normal image link', async () => {
    const input = '![alt text](image.png)';
    const output = await markdownToHtml(input);
    expect(output).toContain('<img src="image.png" alt="alt text">');
  });

  it('should process image with spaces in filename', async () => {
    const input = '![[image with spaces.png]]';
    const output = await markdownToHtml(input);
    expect(output).toContain('<img src="image%20with%20spaces.png" alt="image with spaces.png">');
  });
});
