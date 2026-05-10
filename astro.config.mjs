import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

// Moves a trailing <p> that is the last block child of the last <li> out of the
// list, so a paragraph after a bullet list is never visually nested as a list item.
function rehypeUnwrapListTrailingParagraph() {
  function walk(node) {
    if (!node.children) return;
    node.children.forEach(walk);

    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      if (child.type !== 'element') continue;
      if (child.tagName !== 'ul' && child.tagName !== 'ol') continue;

      const lis = child.children.filter(c => c.type === 'element' && c.tagName === 'li');
      if (!lis.length) continue;
      const lastLi = lis[lis.length - 1];

      const blocks = lastLi.children.filter(c => c.type === 'element');
      if (blocks.length < 2 || blocks[blocks.length - 1].tagName !== 'p') continue;

      const trailingP = blocks[blocks.length - 1];
      lastLi.children = lastLi.children.filter(c => c !== trailingP);
      node.children.splice(i + 1, 0, trailingP);
    }
  }
  return walk;
}

export default defineConfig({
  output: 'hybrid',
  adapter: vercel(),
  site: process.env.SITE_URL,
  markdown: {
    rehypePlugins: [rehypeUnwrapListTrailingParagraph],
  },
});
