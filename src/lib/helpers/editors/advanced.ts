import {
  parseMarkdownList,
  stripDecoration,
  stripLinks,
} from "src/lib/obsutils/parser";
import { orderBy } from "src/lib/utils/collections";
import { ExhaustiveError } from "src/lib/utils/errors";
import { getParagraphAtLine } from "src/lib/utils/strings";
import { map, orThrow } from "src/lib/utils/types";
import {
  deleteLines,
  findLineIndex,
  getActiveEditor,
  getActiveLine,
  getSelection,
  getSelectionLines,
  replaceStringInActiveLine,
  setSelection,
} from "./basic";

/**
 * 現在行のリスト要素に対して、先頭や末尾にテキストを追記します
 *
 * @param option.attached
 *   - prefix: 先頭に追記 (default)
 *   - suffix: 末尾に追記
 * @param option.cursor
 *   - last: 追記後、現在行の末尾にカーソルを移動する
 *
 * ```ts
 * await attachTextToListItem("👺")
 * await attachTextToListItem("🐈", { attached: "suffix", cursor: "last" })
 * ```
 */
export function attachTextToListItem(
  text: string,
  option?: { attached?: "prefix" | "suffix"; cursor?: "last" },
): void {
  const activeLine = getActiveLine()!;
  const { prefix, content } = parseMarkdownList(activeLine);

  const attached = option?.attached ?? "prefix";
  let after: string;
  switch (attached) {
    case "prefix":
      after = `${prefix}${text}${content}`;
      break;
    case "suffix":
      after = `${prefix}${content}${text}`;
      break;
    default:
      throw new ExhaustiveError(attached);
  }

  replaceStringInActiveLine(after, { cursor: option?.cursor });
}

/**
 * 選択中のテキスト複数行をソートします
 *
 * @param option.order
 *   - asc:  昇順 (default)
 *   - desc: 降順
 * @param option.predicate: ソートの指標決めロジック
 *
 * ```ts
 * sortSelectionLines()
 * // 文字列の長さで降順ソート
 * sortSelectionLines({ order: "desc", predicate: (x) => x.length })
 * ```
 */
export function sortSelectionLines(option?: {
  order?: "asc" | "desc";
  predicate?: (x: any) => string | number;
}): void {
  const order = option?.order ?? "asc";
  const predicate = option?.predicate ?? ((x) => x);

  const lines = getSelectionLines();
  if (!lines) {
    return;
  }

  const sortedLines = orderBy(lines, predicate, order);

  setSelection(sortedLines.join("\n"));
}

/**
 * 選択範囲のテキストから装飾を除外します
 *
 * ◆実行後のbefore/after例
 * ```diff
 * - **hoge** _hoga_ ==hogu==
 * + hoge hoga hogu
 * ```
 */
export function stripDecorationFromSelection(): void {
  orThrow(getSelection(), (sl) => {
    setSelection(stripDecoration(sl));
  });
}

/**
 * 選択範囲のテキストからリンクを除外します
 * WARN: 1文字のリンクには対応していません
 * WARN: このメソッドはObsidian MobileのiPhone/iPadでは動作しない可能性があります
 *
 * ◆実行後のbefore/after例
 * ```diff
 * - [hoge] [huga](xxx) [[fuga]]
 * + hoge huga fuga
 * ```
 */
export function stripLinksFromSelection(): void {
  orThrow(getSelection(), (sl) => {
    setSelection(stripLinks(sl));
  });
}

/**
 * 選択範囲のテキストからリンクと装飾を除去します
 * WARN: 1文字のリンクには対応していません
 * WARN: このメソッドはObsidian MobileのiPhone/iPadでは動作しない可能性があります
 *
 * ◆実行後のbefore/after例
 * ```diff
 * - [hoge] [huga](xxx) **[[fuga]]**
 * + hoge huga fuga
 * ```
 */
export function stripLinksAndDecorationsFromSelection(): void {
  orThrow(getSelection(), (sl) => {
    setSelection(stripLinks(stripDecoration(sl)));
  });
}

/**
 * 現在段落の情報とテキストを取得します
 * 現在行が空白の場合はnullを返します
 *
 * @returns {
 *   startLine: 段落の開始行番号(0はじまり)
 *   endLine: 段落の終了行番号(0はじまり)
 *   text: 段落のテキスト全体
 * }
 */
export function getActiveParagraph(): {
  startLine: number;
  endLine: number;
  text: string;
} | null {
  return map(getActiveEditor(), (editor) =>
    getParagraphAtLine(editor.getValue(), editor.getCursor().line),
  );
}

/**
 * 正規表現パターンに一致する行を起点にファイルの最後まで削除します
 */
export function deleteLinesFrom(pattern: RegExp): void {
  const lineIndex = findLineIndex(pattern);
  if (lineIndex === -1) {
    return;
  }

  deleteLines(lineIndex);
}
