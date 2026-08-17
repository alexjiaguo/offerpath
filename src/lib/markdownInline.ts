/** Convert leftover markdown emphasis and links into HTML tags. */
export function markdownInlineToHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>");
}

/** Strip markdown bold markers and link wrappers so `**Name**` displays as `Name` and `[Name](url)` displays as `Name`. */
export function unwrapMarkdownBold(text: string): string {
  if (!text) return "";
  return text
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, "$1")
    .replace(/\*\*([^*]*)\*\*/g, "$1")
    .replace(/__([^_]*)__/g, "$1");
}
