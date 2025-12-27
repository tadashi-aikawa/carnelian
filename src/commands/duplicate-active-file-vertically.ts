import type { TFile } from "obsidian";
import { now } from "src/lib/helpers/datetimes";
import { focusTitle } from "src/lib/helpers/editors/basic";
import {
  copyFile,
  getActiveFile,
  isMarkdownFile,
  openFile,
} from "src/lib/helpers/entries";
import { exists } from "src/lib/helpers/io";
import { addActiveFileProperties } from "src/lib/helpers/properties";
import { notifyValidationError } from "src/lib/helpers/ui";

/**
 * アクティブファイルを複製して右方向に開きます
 * createdプロパティとupdatedプロパティは現在日付に更新されます
 */
export async function duplicateActiveFileVertically() {
  const activeFile = getActiveFile()!;
  if (!activeFile) {
    return notifyValidationError("アクティブなファイルが見つかりませんでした");
  }

  const dstPath = await getDuplicateFilePath(activeFile);
  const dstFile = await copyFile(activeFile.path, dstPath);
  await openFile(dstFile.path, { splitVertical: true });

  focusTitle();

  if (!isMarkdownFile(activeFile)) {
    return;
  }

  await sleep(0);
  const today = now("YYYY-MM-DD");
  addActiveFileProperties({
    created: today,
    updated: today,
  });
}

async function getDuplicateFilePath(file: TFile): Promise<string> {
  const folderPath = file.parent?.path ?? "";
  const buildPath = (basename: string) =>
    folderPath
      ? `${folderPath}/${basename}.${file.extension}`
      : `${basename}.${file.extension}`;

  const baseName = `${file.basename} (copy)`;
  let candidate = buildPath(baseName);
  if (!(await exists(candidate))) {
    return candidate;
  }

  let suffix = 2;
  while (true) {
    candidate = buildPath(`${file.basename} (copy ${suffix})`);
    if (!(await exists(candidate))) {
      return candidate;
    }
    suffix += 1;
  }
}
