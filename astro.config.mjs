import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

// When a loose markdown list results in a trailing <p> being parsed as the last
// block child of the last <li>, move that <p> out to after the </ul>/<ol>.
function rehypeUnwrapListTrailingParagraph() {
  return function transformer(tree) {
    processNode(tree);
  };
}

function processNode(node) {
  if (!node.children) return;

  // Bottom-up: process descendants first so nested lists are handled before parents.
  node.children.forEach(processNode);

  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (child.type !== 'element') continue;
    if (child.tagName !== 'ul' && child.tagName !== 'ol') continue;

    const lastLi = [...child.children]
      .reverse()
      .find(c => c.type === 'element' && c.tagName === 'li');
    if (!lastLi) continue;

    const blockChildren = lastLi.children.filter(c => c.type === 'element');
    if (blockChildren.length < 2) continue;

    const lastBlock = blockChildren[blockChildren.length - 1];
    if (lastBlock.tagName !== 'p') continue;

    // Detach the trailing paragraph from the last list item and place it after the list.
    lastLi.children = lastLi.children.filter(c => c !== lastBlock);
    node.children.splice(i + 1, 0, lastBlock);
  }
}

export default defineConfig({
  output: 'hybrid',
  adapter: vercel(),
  site: process.env.SITE_URL,
  markdown: {
    rehypePlugins: [rehypeUnwrapListTrailingParagraph],
  },
});
