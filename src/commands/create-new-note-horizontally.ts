import { focusTitle } from "src/lib/helpers/editors/basic";
import { createNewFile } from "src/lib/helpers/entries";
import { setActiveLeaf } from "src/lib/helpers/leaves";
import { splitTabGroup } from "src/lib/helpers/tabgroups";

/**
 * 水平方向に新しいノートを作成します
 */
export async function createNewNoteHorizontally() {
  const leaf = splitTabGroup("horizontal");
  const file = await createNewFile();
  await leaf.openFile(file);
  setActiveLeaf(leaf);
  focusTitle();
}
