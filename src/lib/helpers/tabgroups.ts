import type { UApp, UWorkspaceLeaf } from "../types";

declare let app: UApp;

/**
 * タブグループを分割する
 *
 * ```ts
 * // 水平方向(下方向)
 * splitTabGroup("horizontal")
 * // 垂直方向(右方向)
 * splitTabGroup("vertical")
 * ```
 */
export function splitTabGroup(
  direction: "horizontal" | "vertical",
): UWorkspaceLeaf {
  return app.workspace.getLeaf("split", direction) as UWorkspaceLeaf;
}
