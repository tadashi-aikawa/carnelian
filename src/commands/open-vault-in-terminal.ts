import { notifyRuntimeError, openTerminal } from "src/lib/helpers/ui";
import { getVaultRootPath } from "src/lib/helpers/workspace";

/**
 * 現在のVaultをターミナルで開きます
 * WARNING: 現在はGhostty限定
 */
export async function openVaultInTerminal() {
  try {
    await openTerminal(getVaultRootPath());
  } catch {
    return notifyRuntimeError(
      "ターミナルを開くことができませんでした。Ghosttyがインストールされているか確認してください。",
    );
  }
}
