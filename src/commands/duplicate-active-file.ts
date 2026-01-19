import { now } from "src/lib/helpers/datetimes";
import { focusTitle } from "src/lib/helpers/editors/basic";
import {
  duplicateFile,
  getActiveFile,
  isMarkdownFile,
  openFile,
} from "src/lib/helpers/entries";
import { addActiveFileProperties } from "src/lib/helpers/properties";
import { notifyValidationError } from "src/lib/helpers/ui";
import { dateTimePropertyFormat } from "src/lib/utils/dates";

/**
 * アクティブファイルを複製して新しいタブで開きます
 * createdプロパティとupdatedプロパティは現在日付に更新されます
 */
export async function duplicateActiveFile() {
  return duplicateActiveFileBase((path) => openFile(path, { newLeaf: true }));
}

export async function duplicateActiveFileBase(
  open: (path: string) => Promise<void>,
): Promise<void> {
  const activeFile = getActiveFile();
  if (!activeFile) {
    notifyValidationError("アクティブなファイルが見つかりませんでした");
    return;
  }

  const dstFile = await duplicateFile(activeFile);
  await open(dstFile.path);

  focusTitle();

  if (!isMarkdownFile(activeFile)) {
    return;
  }

  await sleep(0);
  const today = now(dateTimePropertyFormat);
  addActiveFileProperties({
    created: today,
    updated: today,
  });
}
