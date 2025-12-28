import { duplicateActiveFileBase } from "src/commands/duplicate-active-file";
import { openFile } from "src/lib/helpers/entries";
import { splitTabGroup } from "src/lib/helpers/tabgroups";

/**
 * アクティブファイルを複製して下方向に開きます
 * createdプロパティとupdatedプロパティは現在日付に更新されます
 */
export async function duplicateActiveFileHorizontally() {
  return duplicateActiveFileBase(async (path) => {
    await sleep(0);
    splitTabGroup("horizontal");
    await openFile(path);
  });
}
