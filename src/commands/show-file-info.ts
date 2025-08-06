import { getFileInfo } from "src/lib/helpers/metadata";
import { showInfoDialog } from "src/lib/helpers/ui";

// FIXME: 移動したい
function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes}B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1).replace(/\.0$/, "")}KB`;
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, "")}MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1).replace(/\.0$/, "")}GB`;
}

/**
 * ファイルの情報を表示します
 */
export async function showFileInfo() {
  const { size, image, extension } = (await getFileInfo())!;

  const contents = [
    `size: ${formatFileSize(size)}`,
    `ext: ${extension}`,
    image ? `width: ${image.width}, height: ${image.height}` : undefined,
  ].filter((x) => x);

  showInfoDialog({
    title: "ファイル情報",
    content: contents.join(" ┃ "),
  });
}
