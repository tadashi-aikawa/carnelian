import { readFileSync } from "fs";
import { getActiveFile } from "src/lib/helpers/entries";
import {
  type ClipboardImageExtension,
  clipboardImageExtensions,
  clipboardMimeTypesByExtension,
  copyImageToClipboard,
  notify,
  notifyRuntimeError,
  notifyValidationError,
} from "src/lib/helpers/ui";
import { toFullPath } from "src/lib/obsutils/mapper";

/**
 * 現在のアクティブファイルが画像ファイルの場合、その画像をクリップボードにコピーします
 */
export async function copyActiveImageFileToClipboard() {
  const activeFile = getActiveFile();
  if (!activeFile) {
    return notifyValidationError("アクティブなファイルがありません");
  }

  const isImageFile = clipboardImageExtensions.some((ext) =>
    activeFile.name.toLowerCase().endsWith(`.${ext}`),
  );

  if (!isImageFile) {
    return notifyValidationError("現在のファイルは画像ファイルではありません");
  }

  try {
    const imageBuffer = readFileSync(toFullPath(activeFile.path));
    const extension = activeFile.extension.toLowerCase();
    const mimeType =
      clipboardMimeTypesByExtension[extension as ClipboardImageExtension] ||
      "image/png";

    await copyImageToClipboard(imageBuffer, mimeType);
    notify(
      `👍 画像ファイル「${activeFile.name}」をクリップボードにコピーしました`,
      3000,
    );
  } catch (error: any) {
    notifyRuntimeError(`画像ファイルのコピーに失敗しました: ${error.message}`);
  }
}
