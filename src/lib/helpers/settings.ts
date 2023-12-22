import { UApp } from "../types";

declare let app: UApp;

/**
 * Readable line lengthの設定値を切り替えます
 */
export function toggleEditorLength() {
  const current = app.vault.getConfig("readableLineLength") ?? false;
  const next = !current;
  app.vault.setConfig("readableLineLength", next);
  return next;
}
