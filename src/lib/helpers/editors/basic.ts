import { WorkspaceLeaf } from "obsidian";
import { parseTags } from "src/lib/obsutils/parser";
import { UApp, UEditor } from "src/lib/types";
import { errorMessage } from "src/lib/utils/errors";
import { map, orThrow } from "src/lib/utils/types";

declare let app: UApp;

/**
 * エディタを取得します
 */
export function getActiveEditor(): UEditor | null {
  return app.workspace.activeEditor?.editor ?? null;
}

/**
 * カーソルを最終行に移動します
 */
export function moveToLastLine(): void {
  orThrow(getActiveEditor(), (e) => {
    e.setCursor(e.lastLine());
  });
}

/**
 * 現在行のテキストを取得します
 */
export function getActiveLine(): string | null {
  return map(getActiveEditor(), (editor) =>
    editor.getLine(editor.getCursor().line),
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
        },
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
 * getActiveLineTags() // タグが現在行にないとき
 * // []
 * getActiveLineTags() // エディタがアクティブでないとき
 * // null
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
  option?: { cursor?: "last" },
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
 * WARN: 選択範囲がないときは空文字を返します
 *
 * ```ts
 * getSelection()
 * // hogehoge
 * getSelection() // 選択していないとき
 * //
 * ```
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
 * エディタの指定行範囲にテキストを設定します
 * @param start - 開始行番号(0から)
 * @param end - 終了行番号(0から)
 *
 * ```ts
 * setLinesInRange(2, 8, "hogehogehoge")
 * ```
 */
export function setLinesInRange(
  start: number,
  end: number,
  text: string,
): void {
  orThrow(getActiveEditor(), (e) => {
    const cur = e.getCursor();
    e.replaceRange(
      text,
      { line: start, ch: 0 },
      { line: end, ch: e.getLine(end).length },
    );
    e.setCursor(cur);
  });
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
    e.replaceRange(`\n${str}`, { line: e.lastLine() + 1, ch: 0 }),
  );
}

/**
 * エディタのLive previewモードを切り替えます
 */
export function setLivePreview(leaf: WorkspaceLeaf, enabled: boolean) {
  const vs = leaf.getViewState();
  vs.state.source = enabled;
  leaf.setViewState(vs);
}
