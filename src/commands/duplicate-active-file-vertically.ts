import { duplicateActiveFileBase } from "src/commands/duplicate-active-file";
import { openFile } from "src/lib/helpers/entries";

/**
 * アクティブファイルを複製して右方向に開きます
 * createdプロパティとupdatedプロパティは現在日付に更新されます
 */
export async function duplicateActiveFileVertically() {
  return duplicateActiveFileBase((path) =>
    openFile(path, { splitVertical: true }),
  );
}
