import { focusTitle } from "src/lib/helpers/editors/basic";
import { openNewMarkdownFile } from "src/lib/helpers/entries";
import { splitTabGroup } from "src/lib/helpers/tabgroups";

/**
 * 水平方向に新しいノートを作成します
 */
export async function createNewNoteHorizontally() {
  await sleep(0);
  splitTabGroup("horizontal");
  await openNewMarkdownFile();
  focusTitle();
}
