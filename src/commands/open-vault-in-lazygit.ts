import { notifyRuntimeError, openLazygit } from "src/lib/helpers/ui";
import { getVaultRootPath } from "src/lib/helpers/workspace";

/**
 * 現在のVaultをLazygitで開きます
 * WARNING: 現在はGhostty限定
 */
export async function openVaultInLazygit() {
  try {
    await openLazygit(getVaultRootPath());
  } catch {
    return notifyRuntimeError(
      "ターミナルを開くことができませんでした。Ghosttyがインストールされているか確認してください。",
    );
  }
}
