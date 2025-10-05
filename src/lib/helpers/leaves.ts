import type { UApp, UWorkspaceLeaf, UWorkspaceMarkdownLeaf } from "../types";

declare let app: UApp;

/**
 * アクティブなMarkdownリーフを返却します
 */
export function getActiveLeaf(): UWorkspaceLeaf | null {
  return app.workspace.getLeaf();
}

/**
 * すべてのMarkdownリーフを返却します
 */
export function getAllMarkdownLeaves(): UWorkspaceMarkdownLeaf[] {
  return app.workspace.getLeavesOfType("markdown") as UWorkspaceMarkdownLeaf[];
}
