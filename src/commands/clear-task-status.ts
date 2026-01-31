import {
  focusEditor,
  getActiveLine,
  replaceStringInActiveLine,
} from "src/lib/helpers/editors/basic";

/**
 * アクティブ行のタスク状況をクリアします
 * - チェックボックスの状態（任意の1文字）を空にリセット
 * - 末尾のタイマー表記（`⏲️xx:xx:xx`）を削除
 */
export function clearTaskStatus(): void {
  const line = getActiveLine();
  if (!line) return;

  const cleared = line
    // チェックボックス状態をクリア: [x], [-], [~] など → [ ]
    .replace(/^(\s*-\s*)\[[^ ]\]/, "$1[ ]")
    // 末尾のタイマー表記を削除: ` `⏲️xx:xx:xx``
    .replace(/\s*`⏲️\d{2}:\d{2}:\d{2}`$/, "");

  replaceStringInActiveLine(cleared);
  focusEditor();
}
