import { getActiveFileFullPath } from "src/lib/helpers/entries";
import { copyToClipboard } from "src/lib/helpers/ui";

/**
 * 現在ファイルのフルパスをクリップボードにコピーします
 */
export async function copyActiveFileFullPath() {
  const path = getActiveFileFullPath()!;
  await copyToClipboard(path);
}
