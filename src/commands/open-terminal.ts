import { getActiveFileFolder } from "src/lib/helpers/entries";
import { notifyRuntimeError, openTerminal } from "src/lib/helpers/ui";
import { getVaultRootPath } from "src/lib/helpers/workspace";
import { toFullPath } from "src/lib/obsutils/mapper";

/**
 * 現在のディレクトリをターミナルで開きます
 * WARNING: 現在はGhostty限定
 */
export async function openActiveFolderInTerminal() {
  const activeFilePath = getActiveFileFolder()?.path;
  try {
    await openTerminal(
      activeFilePath ? toFullPath(activeFilePath) : getVaultRootPath(),
    );
  } catch {
    return notifyRuntimeError(
      "ターミナルを開くことができませんでした。Ghosttyがインストールされているか確認してください。",
    );
  }
}
