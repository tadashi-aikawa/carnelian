import * as Encoding from "encoding-japanese";
import { zipRotate } from "./collections";
import { isPresent } from "./types";

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
  const maxColWidthList = zipRotate(rows).map((colValues) =>
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
