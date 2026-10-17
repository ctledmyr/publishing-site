// Plain-text excerpt from a markdown body, cut at a whole word.
export function excerpt(markdown: string, maxLength = 160): string {
  const text = markdown
    .replace(/<[^>]+>/g, ' ')                    // HTML tags
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')       // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')     // links -> link text
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, '') // headings, quotes, list markers
    .replace(/^\s*([-*_]\s*){3,}$/gm, ' ')       // horizontal rules
    .replace(/[*_~`]+/g, '')                     // emphasis, code
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= maxLength) return text;

  const cut = text.slice(0, maxLength + 1);
  const lastSpace = cut.lastIndexOf(' ');
  const trimmed = (lastSpace > 0 ? cut.slice(0, lastSpace) : text.slice(0, maxLength))
    .replace(/[\s,;:.–—-]+$/, '');
  return `${trimmed}…`;
}
