import { focusTitle } from "src/lib/helpers/editors/basic";
import { openNewMarkdownFile } from "src/lib/helpers/entries";
import { splitTabGroup } from "src/lib/helpers/tabgroups";

/**
 * 垂直方向に新しいノートを作成します
 */
export async function createNewNoteVertically() {
  await sleep(0);
  splitTabGroup("vertical");
  await openNewMarkdownFile();
  focusTitle();
}
