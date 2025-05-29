import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeHighlight from 'rehype-highlight';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

export const markdownToHtml = async (markdown: string): Promise<string> => {
  const parsed = await unified()
    .use(remarkParse)
    .use(remarkBreaks)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(convertObsidianLinks(markdown));

  return parsed.toString();
};

function convertObsidianLinks(markdown: string): string {
  const regex = /!\[\[(.*?)]]/g;
  return markdown.replace(regex, (_, filename) => {
    return `![${filename}](${filename})`;
  });
}
