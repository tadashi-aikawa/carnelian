import type { UApp, UWorkspace } from "../types";

declare let app: UApp;

/**
 * 現在のワークスペースを取得します
 */
export function getWorkspace(): UWorkspace {
  return app.workspace;
}

/**
 * Vaultルートのフルパスを取得します
 */
export function getVaultRootPath(): string {
  return app.vault.adapter.basePath;
}
