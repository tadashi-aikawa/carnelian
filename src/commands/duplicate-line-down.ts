import {
  duplicateActiveLineDown,
  focusEditor,
} from "src/lib/helpers/editors/basic";

/**
 * 現在行を下方向に複製します
 */
export function duplicateLineDown(): void {
  duplicateActiveLineDown();
  // テーブルやコールアウトではフォーカスが外れることがあるため、再度フォーカスを当てる
  focusEditor();
}
