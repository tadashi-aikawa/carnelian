import { UApp, UEditor, UMetadataEditor } from "../types";
import { map, orThrow } from "../utils/types";
import { errorMessage, ExhaustiveError } from "../utils/errors";
import {
  parseMarkdownList,
  parseTags,
  stripDecoration,
  stripLinks,
} from "../obsutils/parser";
import { orderBy } from "../utils/collections";

declare let app: UApp;

/**
 * エディタを取得します
 */
export function getActiveEditor(): UEditor | null {
  return app.workspace.activeEditor?.editor ?? null;
}

/**
 * 現在行のテキストを取得します
 */
export function getActiveLine(): string | null {
  return map(getActiveEditor(), (editor) =>
    editor.getLine(editor.getCursor().line)
  );
}

/**
 * 現在行を削除します
 * 実行に失敗した場合は例外を送出します
 */
export function deleteActiveLine(): void {
  orThrow(getActiveEditor(), (e) => {
    const cur = e.getCursor();
    if (cur.line === e.lastLine()) {
      e.setLine(cur.line, "");
    } else {
      e.replaceRange(
        "",
        { line: cur.line, ch: 0 },
        {
          line: cur.line + 1,
          ch: 0,
        }
      );
    }
  });
}

/**
 * 現在行に含まれるタグの一覧を取得します
 *
 * ```ts
 * getActiveLineTags()
 * // ["todo", "done"]
 * ```
 */
export function getActiveLineTags(): string[] | null {
  return map(getActiveLine(), (al) => parseTags(al));
}

/**
 * カーソル位置にテキストを挿入します
 *
 * ```ts
 * insertToCursor("hogehoge")
 * ```
 */
export function insertToCursor(text: string): void {
  orThrow(getActiveEditor(), (ae) => ae.replaceRange(text, ae.getCursor()), {
    message: errorMessage["ActiveEditor is null"],
  });
}

/**
 * 現在行を置換します
 * 実行に失敗した場合は例外を送出します
 */
export function replaceStringInActiveLine(
  str: string,
  option?: { cursor?: "last" }
): void {
  orThrow(getActiveEditor(), (e) => {
    const { line, ch } = e.getCursor();
    e.setLine(line, str);

    // XXX: lastのときは最後の空白手前で止まってしまうので-1を消す
    const afterCh =
      option?.cursor === "last" ? str.length : Math.min(ch, str.length - 1);

    e.setCursor({ line, ch: afterCh });
  });
}

/**
 * エディタの選択範囲を取得します
 */
export function getSelection(): string | null {
  return getActiveEditor()?.getSelection() ?? null;
}

/**
 * エディタの選択範囲にテキストを設定します
 *
 * ```ts
 * setSelection("after text")
 * ```
 */
export function setSelection(text: string): void {
  orThrow(getActiveEditor(), (e) => e.replaceSelection(text));
}

/**
 * 選択しているテキストを1行ずつ取得します
 *
 * ```ts
 * getSelectionLines()
 * // ["- one", "- two", "- three"]
 * getSelectionLines() // 未選択のとき
 * // null
 * ```
 */
export function getSelectionLines(): string[] | null {
  return getSelection()?.split("\n") ?? null;
}

/**
 * エディタの最後に新しい行とテキストを追加します
 *
 * ```ts
 * appendLine("hogehoge")
 * ```
 */
export function appendLine(str: string): void {
  orThrow(getActiveEditor(), (e) =>
    e.replaceRange(`\n${str}`, { line: e.lastLine() + 1, ch: 0 })
  );
}

//************ 高度な操作 ******************

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
  option?: { attached?: "prefix" | "suffix"; cursor?: "last" }
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
