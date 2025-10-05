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

/**
 * 現在のワークスペース名を取得します
 */
export function getActiveWorkspaceName(): string {
  const ws = app.internalPlugins.plugins.workspaces;
  if (!ws.enabled) {
    throw Error("Workspacesプラグインが有効化されていません");
  }

  return ws.instance.activeWorkspace;
}

/**
 * 次のワークスペースに移動します(循環)
 * @param opts
 * - saveActiveWorkspace: 現在のワークスペースを保存するかどうか(デフォルト: false)
 *
 */
export async function moveNextWorkspace(opts?: {
  saveActiveWorkspace?: boolean;
}): Promise<void> {
  const ws = app.internalPlugins.plugins.workspaces;
  if (!ws.enabled) {
    throw Error("Workspacesプラグインが有効化されていません");
  }

  const wss = ws.instance;
  const { saveActiveWorkspace = false } = opts ?? {};

  const wsEntries = Object.entries(wss.workspaces);

  const activeWsKey = wss.activeWorkspace;
  const activeIndex = wsEntries.findIndex(([k]) => k === activeWsKey);

  const nextIndex = (activeIndex + 1) % wsEntries.length;
  const nextWsKey = wsEntries[nextIndex][0];

  if (saveActiveWorkspace) {
    await wss.saveWorkspace(activeWsKey);
  }

  await wss.loadWorkspace(nextWsKey);
}
