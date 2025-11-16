import type { Config, UApp } from "../types";

declare let app: UApp;

/**
 * Readable line lengthの設定値を切り替えます
 */
export function toggleEditorLength(): boolean {
  const current = app.vault.getConfig("readableLineLength") ?? false;
  const next = !current;
  app.vault.setConfig("readableLineLength", next);
  return next;
}

/**
 * Default editing modeの設定値を切り替えます
 * 現在のエディタの状態は切り替えません
 *
 * @returns 変更後の値
 */
export function toggleDefaultEditingMode(): "source" | "livePreview" {
  const current = app.vault.getConfig("livePreview") ?? false;
  const next = !current;
  app.vault.setConfig("livePreview", next);
  return next ? "source" : "livePreview";
}

/**
 * Vim key bindings (Vim mode) の設定値を切り替えます
 *
 * @returns 変更後の値
 */
export function toggleVimKeyBindings(): boolean {
  const current = app.vault.getConfig("vimMode") ?? false;
  const next = !current;
  app.vault.setConfig("vimMode", next);
  return next;
}

/**
 * 新しいノートが作成されるフォルダのパスを取得します
 */
export function getNewFileFolderPath(): string {
  return app.vault.getConfig("newFileFolderPath") ?? "";
}

/**
 * ファイル削除時の挙動を取得します
 */
export function getFileDeleteMode(): NonNullable<Config["trashOption"]> {
  return app.vault.getConfig("trashOption") ?? "system";
}
