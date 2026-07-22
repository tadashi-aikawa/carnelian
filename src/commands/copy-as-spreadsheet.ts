import { getSelectionText } from "src/lib/helpers/editors/basic";
import { getActiveFileContent } from "src/lib/helpers/entries";
import { linkText2Path } from "src/lib/helpers/links";
import { getActiveFileCache } from "src/lib/helpers/metadata";
import { getPropertiesByPath } from "src/lib/helpers/properties";
import { copyRichTextToClipboard, notify } from "src/lib/helpers/ui";
import { sorter } from "src/lib/utils/collections";
import {
  getSinglePatternMatchingLocations,
  getWikiLinks,
  replaceAt,
} from "src/lib/utils/strings";

type Range = { start: number; end: number };

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type LinkReplacement = {
  range: Range;
  html: string;
  plain: string;
};

function wikiLinkReplacements(target: string): LinkReplacement[] {
  return getWikiLinks(target).map((link) => {
    const path = linkText2Path(link.title);
    const url = path ? getPropertiesByPath(path)?.url : undefined;
    const displayText = link.alias ?? link.title;

    return {
      range: link.range,
      html: url
        ? `<a href="${escapeHtml(url)}">${escapeHtml(displayText)}</a>`
        : escapeHtml(displayText),
      plain: displayText,
    };
  });
}

function markdownLinkReplacements(target: string): LinkReplacement[] {
  return getSinglePatternMatchingLocations(
    target,
    /(?<!!)\[([^\]]+)\]\(([^)]+)\)/g,
  ).map((match) => {
    const inner = match.text.match(/\[([^\]]+)\]\(([^)]+)\)/)!;
    const displayText = inner[1];
    const url = inner[2];

    return {
      range: match.range,
      html: `<a href="${escapeHtml(url)}">${escapeHtml(displayText)}</a>`,
      plain: displayText,
    };
  });
}

const INDENT_CHAR = "⠀⠀";

function toIndent(spaces: string): string {
  return INDENT_CHAR.repeat(Math.ceil(spaces.length / 4));
}

function transformLine(line: string): string {
  // 見出し(##~####)
  const headingMatch = line.match(/^#{2,4}\s+(.*)/);
  if (headingMatch) {
    return `【${headingMatch[1]}】`;
  }

  // チェックボックス
  line = line.replace(/^(\s*)- \[x\]\s+/, (_, s) => `${toIndent(s)}✅ `);
  line = line.replace(/^(\s*)- \[ \]\s+/, (_, s) => `${toIndent(s)}▢ `);
  // 箇条書き
  line = line.replace(/^(\s*)- /, (_, s) => `${toIndent(s)}• `);

  return line;
}

/**
 * スプレッドシートに貼り付ける形式でクリップボードにコピーします
 */
export async function copyAsSpreadsheet() {
  let target = getSelectionText();
  if (!target) {
    const startOffset =
      getActiveFileCache()!.frontmatterPosition?.end.offset ?? 0;
    target = getActiveFileContent()!.slice(startOffset);
  }

  const replacements = [
    ...wikiLinkReplacements(target),
    ...markdownLinkReplacements(target),
  ].sort(sorter((x) => x.range.start, "desc"));

  let htmlText = target;
  let plainText = target;
  for (const r of replacements) {
    htmlText = replaceAt(htmlText, r.range, r.html);
    plainText = replaceAt(plainText, r.range, r.plain);
  }

  htmlText = htmlText.split("\n").map(transformLine).join("<br>");
  htmlText = htmlText.replace(/\*\*(.+?)\*\*/g, "$1");
  htmlText = `<table><tr><td>${htmlText}</td></tr></table>`;

  plainText = plainText.split("\n").map(transformLine).join("\n");
  plainText = plainText.replace(/\*\*(.+?)\*\*/g, "$1");

  await copyRichTextToClipboard(htmlText, plainText);

  notify("📋 スプレッドシートに貼り付け可能な形式でコピーしました", 5000);
}
