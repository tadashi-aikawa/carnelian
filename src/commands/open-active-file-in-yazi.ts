import { getActiveFile } from "src/lib/helpers/entries";
import { notifyRuntimeError, openYazi } from "src/lib/helpers/ui";
import { getVaultRootPath } from "src/lib/helpers/workspace";
import { toFullPath } from "src/lib/obsutils/mapper";

/**
 * 現在のVaultをターミナルで開きます
 * WARNING: yazi, Ghostty, zshが必要
 */
export async function openActiveFileInYazi() {
  const activeFilePath = getActiveFile()?.path;
  try {
    await openYazi(
      activeFilePath ? toFullPath(activeFilePath) : getVaultRootPath(),
    );
  } catch {
    return notifyRuntimeError(
      "ターミナルを開くことができませんでした。Ghosttyがインストールされているか確認してください。",
    );
  }
}
