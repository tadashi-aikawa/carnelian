import { readFileSync } from "fs";
import {
  getActiveFile,
  type ImageExtension,
  imageExtensions,
  imageMimeTypesByExtension,
} from "src/lib/helpers/entries";
import {
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

  const isImageFile = imageExtensions.some((ext) =>
    activeFile.name.toLowerCase().endsWith(`.${ext}`),
  );

  if (!isImageFile) {
    return notifyValidationError("現在のファイルは画像ファイルではありません");
  }

  try {
    const imageBuffer = readFileSync(toFullPath(activeFile.path));
    const extension = activeFile.extension.toLowerCase();
    const mimeType =
      imageMimeTypesByExtension[extension as ImageExtension] || "image/png";

    await copyImageToClipboard(imageBuffer, mimeType);
    notify(
      `👍 画像ファイル「${activeFile.name}」をクリップボードにコピーしました`,
      3000,
    );
  } catch (error: any) {
    notifyRuntimeError(`画像ファイルのコピーに失敗しました: ${error.message}`);
  }
}
