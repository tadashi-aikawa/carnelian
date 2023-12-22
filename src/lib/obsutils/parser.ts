/**
 * Markdownリストのテキストをリストで取得します
 */
export function parseMarkdownList(text: string): {
  prefix: string;
  content: string;
} {
  const result = Array.from(
    text.matchAll(/^(?<prefix>[ \t\s]*([-*] (\[.] |)|))(?<content>.*)$/g)
  ).at(0);

  return {
    prefix: result?.groups?.prefix ?? "",
    content: result?.groups?.content ?? "",
  };
}

/**
 * テキストに含まれるタグから、タグの名称リストを取得します
 */
export function parseTags(text: string): string[] {
  return text
    .split(" ")
    .filter((x) => x.startsWith("#"))
    .map((x) => x.slice(1));
}

/**
 * テキストの装飾を除外します
 */
export function stripDecoration(text: string): string {
  return text
    .replaceAll(/\*\*([^*]*?)\*\*/g, "$1")
    .replaceAll(/__([^*]*?)__/g, "$1")
    .replaceAll(/\*([^*]*?)\*/g, "$1")
    .replaceAll(/_([^*]*?)_/g, "$1")
    .replaceAll(/~~([^~]*?)~~/g, "$1")
    .replaceAll(/==([^~]*?)==/g, "$1");
}

/**
 * テキストのリンクを除外します
 */
export function stripLinks(text: string): string {
  return text
    .replaceAll(/\[\[[^\|\]]*?\|([^\]]*?)\]\]/g, "$1")
    .replaceAll(/\[\[([^\]]*?)\]\]/g, "$1")
    .replaceAll(/\[([^\]]*?)\]\(.*?\)/g, "$1")
    .replaceAll(/\[([^\]]*?)\]/g, "$1");
}
