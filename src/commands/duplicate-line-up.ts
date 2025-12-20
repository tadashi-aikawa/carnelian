import {
  duplicateActiveLineUp,
  focusEditor,
} from "src/lib/helpers/editors/basic";

/**
 * 現在行を上方向に複製します
 */
export function duplicateLineUp(): void {
  duplicateActiveLineUp();
  // テーブルやコールアウトではフォーカスが外れることがあるため、再度フォーカスを当てる
  focusEditor();
}
