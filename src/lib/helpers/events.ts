import { CachedMetadata, EventRef, TAbstractFile, TFile } from "obsidian";
import { UApp } from "../types";
import { isFile, isFolder } from "./entries";

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

/**
 * ファイルが作成されたときに実行する処理を設定します
 * WARN:
 * このイベントはVaultロード時(workspace読み込み時)にも発生します
 * それが意図通りでない場合は onload ではなく onLayoutReady で呼び出してください
 */
export function setOnCreateFileEvent(
  handler: (file: TFile) => any,
  ctx?: any
): EventRef {
  return app.vault.on(
    "create",
    (entry: TAbstractFile) => {
      if (!isFile(entry)) {
        return;
      }

      handler(entry);
    },
    ctx
  );
}

/**
 * ファイルが作成されたときに実行する処理を解除します
 */
export function unsetOnCreateFileEvent(ref: EventRef): void {
  app.vault.offref(ref);
}
