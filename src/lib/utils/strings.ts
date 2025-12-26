import * as Encoding from "encoding-japanese";
import { minimatch } from "minimatch";
import { zipRotate } from "./collections";
import { isPresent } from "./guard";

type Range = { start: number; end: number };

const regEmoji = new RegExp(
  // biome-ignore lint/suspicious/noMisleadingCharacterClass: <explanation>
  /[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]|[\uFE0E-\uFE0F]/,
  "g",
);

/**
 * 半角スペースを除外します
 */
export function excludeSpace(text: string): string {
  return text.replace(/ /g, "");
}

/**
 * 絵文字を除外します
 */
export function excludeEmoji(text: string): string {
  return text.replace(regEmoji, "");
}

/**
 * テキストが正規表現パターンにマッチしているかどうかを返却します
 */
export function match(text: string, pattern: RegExp): boolean {
  return Boolean(text.match(pattern));
}

/**
 * 1種類のパターンでパターンマッチした結果を文字列のリストで取得します
 */
export function doSinglePatternMatching(
  text: string,
  pattern: RegExp,
): string[] {
  return Array.from(text.matchAll(pattern)).map((x) => x[0]);
}

/**
 * 1種類のパターンでパターンマッチした結果のキャプチャを文字列のリストで取得します
 */
export function doSinglePatternCaptureMatching(
  text: string,
  pattern: RegExp,
): string[] {
  return Array.from(text.matchAll(pattern)).map((x) => x[1]);
}

/**
 * 1種類のパターンでパターンマッチした結果を文字列と位置のリストで取得します
 */
export function getSinglePatternMatchingLocations(
  text: string,
  pattern: RegExp,
): {
  text: string;
  range: Range;
}[] {
  return Array.from(text.matchAll(pattern)).map((x) => ({
    text: x[0],
    range: {
      start: x.index!,
      end: x.index! + x[0].length - 1,
    },
  }));
}

/**
 * 1種類のパターンでパターンマッチした結果のキャプチャを文字列と位置のリストで取得します
 */
export function getSinglePatternCaptureMatchingLocations(
  text: string,
  pattern: RegExp,
): {
  text: string;
  captured?: string;
  /**
   * textの位置 (WARN: capturedではない)
   */
  range: Range;
}[] {
  return Array.from(text.matchAll(pattern)).map((x) => ({
    text: x[0],
    captured: x[1],
    range: {
      start: x.index!,
      end: x.index! + x[0].length - 1,
    },
  }));
}

/**
 * mappingに従って複数の正規表現置換パターンで文字列を置換します
 */
export function replaceWithRegExpMapping(
  text: string,
  mapping: { [beforeRegExp: string]: string },
): string {
  return Object.entries(mapping).reduce(
    (acc, [before, after]) => acc.replaceAll(new RegExp(before, "g"), after),
    text,
  );
}

/**
 * mappingに従って複数の置換パターンで文字列を置換します
 */
export function replaceWithStringMapping(
  text: string,
  mapping: { [beforeString: string]: string },
) {
  return Object.entries(mapping).reduce(
    (acc, [before, after]) => acc.replaceAll(before, after),
    text,
  );
}

/**
 * baseのテキストからrangeの範囲をtextの文字列で置き換えます
 */
export function replaceAt(base: string, range: Range, text: string): string {
  return base.substring(0, range.start) + text + base.substring(range.end + 1);
}

/**
 * SJISのbufferをstringに変換します
 */
export function sjis2String(sjisBuffer: ArrayBuffer): string {
  const unicodeArray = Encoding.convert(new Uint8Array(sjisBuffer), {
    from: "SJIS",
    to: "UNICODE",
  });
  return Encoding.codeToString(unicodeArray);
}

/**
 * EUC-JPのbufferをstringに変換します
 */
export function eucJp2String(eucJpBuffer: ArrayBuffer): string {
  const unicodeArray = Encoding.convert(new Uint8Array(eucJpBuffer), {
    from: "EUCJP",
    to: "UNICODE",
  });
  return Encoding.codeToString(unicodeArray);
}

/**
 * 文字幅をカウントします
 * アルファベットや記号は1、それ以外のマルチバイト文字は2の単純計算
 */
export function countCharsWidth(chars: string): number {
  return chars
    .split("")
    .reduce((acc, _, i) => acc + (chars.charCodeAt(i) > 0x7f ? 2 : 1), 0);
}

/**
 * 文字列の前後を指定文字で埋めて任意の長さにします
 */
export function pad(text: string, length: number, char = " "): string {
  if (text.length >= length) {
    return text;
  }

  const padding = length - text.length;
  const paddingStart = Math.floor(padding / 2);

  return text.padStart(paddingStart + text.length, char).padEnd(length, char);
}

/**
 * 指定行における段落の情報とテキストを取得します
 * 指定行が空行の場合はnullを返します
 *
 * @param text - 全体テキスト
 * @param line - 現在行番号(0はじまり)
 *
 * @returns {
 *   startLine: 段落の開始行番号(0はじまり)
 *   endLine: 段落の終了行番号(0はじまり)
 *   text: 段落のテキスト全体
 * }
 *
 */
export function getParagraphAtLine(
  text: string,
  line: number,
): {
  startLine: number;
  endLine: number;
  text: string;
} | null {
  const lineContents = text.split("\n");
  if (lineContents[line] === "") {
    return null;
  }

  const previousEmptyLineIndex = lineContents
    .slice(0, line)
    .findLastIndex((x) => x === "");
  const startLine =
    previousEmptyLineIndex === -1 ? 0 : previousEmptyLineIndex + 1;

  const nextEmptyLineIndex = lineContents.findIndex(
    (x, i) => i > line && x === "",
  );
  const endLine =
    nextEmptyLineIndex === -1
      ? lineContents.length - 1
      : nextEmptyLineIndex - 1;

  return {
    startLine,
    endLine,
    text: lineContents.slice(startLine, endLine + 1).join("\n"),
  };
}

/**
 * Markdownテーブル形式の行テキストを値の配列に変換します
 * WARN: このメソッドはObsidian MobileのiPhone/iPadでは動作しない可能性があります
 */
function splitAsTableRow(rowText: string): string[] {
  let text = rowText.trim();
  if (text.at(0) === "|") {
    text = text.slice(1);
  }
  if (text.at(-1) === "|") {
    text = text.slice(0, -1);
  }
  return text.split(/(?<!\\)\|/).map((x) => x.trim());
}

function padEndAsWidth(text: string, length: number, char = " "): string {
  return text.padEnd(length - (countCharsWidth(text) - text.length), char);
}

/**
 * Markdownテーブル形式のテキストをフォーマットします
 * WARN: このメソッドはObsidian MobileのiPhone/iPadでは動作しない可能性があります
 * WARN: alignには現在対応していません. もっとも シンプルなケースのみ
 */
export function formatTable(tableText: string): string | null {
  const rows = tableText.split("\n").map(splitAsTableRow);
  if (rows.length < 2) {
    return null;
  }

  const maxColNum = Math.max(...rows.map((x) => x.length));
  const maxColWidthList = zipRotate(rows.toSpliced(1, 1)).map((colValues) =>
    Math.max(...colValues.filter(isPresent).map(countCharsWidth)),
  );

  const [header, divider, ...records] = rows.map((row) =>
    row.concat(Array(maxColNum - row.length).fill("")),
  );
  const headerText = `| ${header
    .map((c, i) => padEndAsWidth(c, maxColWidthList[i]))
    .join(" | ")} |`;
  const dividerText = `| ${divider
    .map((_, i) => padEndAsWidth("", maxColWidthList[i], "-"))
    .join(" | ")} |`;
  const recordTextList = records.map(
    (record) =>
      `| ${record
        .map((c, i) => padEndAsWidth(c, maxColWidthList[i]))
        .join(" | ")} |`,
  );

  return `
${headerText}
${dividerText}
${recordTextList.join("\n")}
`.trim();
}

/**
 * テキストからwikiリンクのテキストと範囲を抽出します
 */
export function getWikiLinks(text: string): {
  title: string;
  alias?: string;
  range: Range;
}[] {
  return getSinglePatternMatchingLocations(text, /\[\[.+?\]\]/g).map((x) => {
    const [title, alias] = x.text
      .replaceAll("[[", "")
      .replaceAll("]]", "")
      .split("|");

    return {
      title,
      range: x.range,
      ...(alias ? { alias } : {}),
    };
  });
}

/**
 * textがURLかどうかを判定します
 */
export function isUrl(text: string): boolean {
  return text.startsWith("http://") || text.startsWith("https://");
}

/**
 * ファイルパスが入力されることを想定してURLをエンコードします
 *
 */
export function encodeToUrl(filePath: string): string {
  return encodeURI(filePath).replaceAll(/\+/g, "%2B");
}

export type FuzzyResult =
  | { type: "starts-with"; score: number }
  | { type: "includes"; score: number }
  | { type: "fuzzy"; score: number }
  | { type: "none"; score: number };

/**
 * 最小限のファジーマッチを行います
 */
export function microFuzzy(value: string, query: string): FuzzyResult {
  if (value.startsWith(query)) {
    return { type: "starts-with", score: 2 ** query.length / value.length };
  }
  const emojiLessValue = excludeEmoji(value);
  if (emojiLessValue.startsWith(query)) {
    return { type: "starts-with", score: 2 ** query.length / value.length };
  }

  if (value.includes(query)) {
    return { type: "includes", score: 2 ** query.length / value.length };
  }

  let i = 0;
  let scoreSeed = 0;
  let combo = 0;
  for (let j = 0; j < emojiLessValue.length; j++) {
    if (emojiLessValue[j] === query[i]) {
      combo++;
      i++;
    } else {
      if (combo > 0) {
        scoreSeed += 2 ** combo;
        combo = 0;
      }
    }
    if (i === query.length) {
      if (combo > 0) {
        scoreSeed += 2 ** combo;
      }
      return { type: "fuzzy", score: scoreSeed / value.length };
    }
  }

  return { type: "none", score: 0 };
}

/**
 * pathがpatternsのいずれかのglobパターンにマッチするかどうかを返却します
 */
export function isMatchedGlobPatterns(
  path: string,
  patterns: string[],
): boolean {
  if (patterns.length === 0) {
    return false;
  }

  try {
    return patterns.some((p) => minimatch(path, p));
  } catch (error) {
    console.warn(`Invalid glob pattern detected: ${error}`);
    return false;
  }
}

/**
 * 行が見出しかどうかを返却します
 */
export function isHeading(line: string): boolean {
  return (
    line.startsWith("# ") ||
    line.startsWith("## ") ||
    line.startsWith("### ") ||
    line.startsWith("#### ") ||
    line.startsWith("##### ") ||
    line.startsWith("###### ")
  );
}

/**
 * 行がコードブロックの開始または終了かどうかを返却します
 */
export function isCodeBlockStartOrEnd(line: string): boolean {
  const trimmed = line.replace(/^[ >]+\s*/, "");
  return trimmed.startsWith("```") || trimmed.startsWith("~~~");
}

/**
 * 行が引用かどうかを返却します
 */
export function isBlockquote(line: string): boolean {
  return line.trim().startsWith(">");
}

/**
 * 行が画像埋め込みリンクのみかどうかを返却します
 */
export function isOnlyImageEmbedLink(line: string): boolean {
  const trimmed = line.trim();
  return (
    /^!\[\[[^\]]+\]\]$/.test(trimmed) || /^!\[[^\]]*\]\([^)]+\)$/.test(trimmed)
  );
}

/**
 * 行がHTMLタグかどうかを返却します
 */
export function isHtmlTag(line: string): boolean {
  const trimmed = line.trim();
  return (
    /^<([a-zA-Z][\w-]*)(\s+[^<>]*)?>/.test(trimmed) ||
    /^<\/([a-zA-Z][\w-]*)>/.test(trimmed) ||
    /^<([a-zA-Z][\w-]*)(\s+[^<>]*)?\/>/.test(trimmed)
  );
}
