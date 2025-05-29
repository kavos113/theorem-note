import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeHighlight from 'rehype-highlight';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

let projectRoot = '';

const IMAGE_PREFIX = '/_images/';

export const setProjectRoot = (root: string): void => {
  if (root) {
    projectRoot = root.replace(/\\/g, '/');
  } else {
    console.warn('Project root is not set. Using default empty string.');
  }
};

export const markdownToHtml = async (markdown: string): Promise<string> => {
  const parsed = await unified()
    .use(remarkParse)
    .use(() => {
      return (tree: any) => {
        // Convert Obsidian-style image links to standard Markdown image syntax
        console.dir(tree, { depth: null });
      };
    })
    .use(remarkBreaks)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(convertObsidianLinks(markdown));

  return parsed.toString();
};

function convertObsidianLinks(markdown: string): string {
  console.log(projectRoot);
  const regex = /!\[\[(.*?)]]/g;
  return markdown.replace(regex, (_, filename) => {
    const encoded = encodeURIComponent(filename);
    return `![${filename}](${projectRoot}${IMAGE_PREFIX}${encoded})`;
  });
}
