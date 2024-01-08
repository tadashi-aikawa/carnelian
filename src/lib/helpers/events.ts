import { CachedMetadata, EventRef, TFile } from "obsidian";
import { UApp } from "../types";

declare let app: UApp;

/**
 * ファイルを開いたときに実行する処理を設定します
 */
export function setOnFileOpenEvent(
  handler: (file: TFile | null) => any,
  ctx?: any
): EventRef {
  return app.workspace.on("file-open", handler, ctx);
}

/**
 * ファイルを開いたときに実行する処理を解除します
 */
export function unsetOnFileOpenEvent(ref: EventRef): void {
  app.workspace.offref(ref);
}

/**
 * プロパティが変更されたときに実行する処理を設定します
 */
export function setOnPropertiesChangedEvent(
  handler: (file: TFile, data: string, cache: CachedMetadata) => any,
  ctx?: any
): EventRef {
  return app.metadataCache.on("changed", handler, ctx);
}

/**
 * プロパティが変更されたときに実行する処理を解除します
 */
export function unsetOnPropertiesChangedEvent(ref: EventRef): void {
  app.metadataCache.offref(ref);
}
