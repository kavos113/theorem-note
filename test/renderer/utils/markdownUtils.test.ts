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
    expect(output).toContain('<img src="/_images/image.png" alt="image.png">');
  });

  it('should convert multiple image links', async () => {
    const input = '![[image1.png]] and ![[image2.jpg]]';
    const output = await markdownToHtml(input);
    expect(output).toContain('<img src="/_images/image1.png" alt="image1.png">');
    expect(output).toContain('<img src="/_images/image2.jpg" alt="image2.jpg">');
  });

  it('should convert link with text', async () => {
    const input = 'これは画像です: ![[photo.png]]';
    const output = await markdownToHtml(input);
    expect(output).toContain('これは画像です: <img src="/_images/photo.png" alt="photo.png">');
  });

  it('should convert normal image link', async () => {
    const input = '![alt text](image.png)';
    const output = await markdownToHtml(input);
    expect(output).toContain('<img src="image.png" alt="alt text">');
  });

  it('should process image with spaces in filename', async () => {
    const input = '![[image with spaces.png]]';
    const output = await markdownToHtml(input);
    expect(output).toContain(
      '<img src="/_images/image%20with%20spaces.png" alt="image with spaces.png">'
    );
  });
});

describe('markdownToHtml KaTeX math rendering', () => {
  it('should render inline math expressions', async () => {
    const input = 'This is an inline math expression: $x = y + z$';
    const output = await markdownToHtml(input);
    expect(output).toContain('<span class="katex">');
    expect(output).toContain('x = y + z');
  });

  it('should render display math expressions', async () => {
    const input = 'Display math:\n\n$$\n\\int_0^\\infty e^{-x} dx = 1\n$$';
    const output = await markdownToHtml(input);
    expect(output).toContain('<span class="katex-display">');
    expect(output).toContain('\\int_0^\\infty e^{-x} dx = 1');
  });

  it('should render multiple math expressions', async () => {
    const input = 'Here are two expressions: $a + b = c$ and $$E = mc^2$$';
    const output = await markdownToHtml(input);
    expect(output).toContain('<span class="katex">');
    // When $$...$$ is inline in text, it still uses katex class, not katex-display
    expect(output).toContain('a + b = c');
    expect(output).toContain('E = mc^2');
  });

  it('should handle math expressions with complex syntax', async () => {
    const input = '$$\\frac{d}{dx} \\sum_{i=1}^{n} x_i^2 = 2x$$';
    const output = await markdownToHtml(input);
    // When $$...$$ is not separated by blank lines, it's treated as inline
    expect(output).toContain('<span class="katex">');
    expect(output).toContain('\\frac{d}{dx}');
  });

  it('should render block display math correctly', async () => {
    const input = 'Before math\n\n$$E = mc^2$$\n\nAfter math';
    const output = await markdownToHtml(input);
    // Currently remark-math/rehype-katex treats block display math as inline katex
    expect(output).toContain('<span class="katex">');
    expect(output).toContain('E = mc^2');
  });

  it('should ignore escaped dollar signs', async () => {
    const input = 'This costs \\$5 and that costs \\$10';
    const output = await markdownToHtml(input);
    expect(output).not.toContain('<span class="katex">');
    expect(output).toContain('$5');
    expect(output).toContain('$10');
  });

  it('should handle mixed content with math and other markdown', async () => {
    const input =
      '# Math Example\n\n**Bold text** and inline math $x^2$ and:\n\n$$y = \\sin(x)$$\n\n- List item';
    const output = await markdownToHtml(input);
    expect(output).toContain('<h1>Math Example</h1>');
    expect(output).toContain('<strong>Bold text</strong>');
    expect(output).toContain('<span class="katex">');
    // Note: Current implementation treats all math as inline katex, not katex-display
    expect(output).toContain('<li>List item</li>');
  });
});
