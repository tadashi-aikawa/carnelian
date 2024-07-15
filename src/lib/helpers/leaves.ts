import type { WorkspaceLeaf } from "obsidian";
import type { UApp } from "../types";

declare let app: UApp;

/**
 * アクティブなMarkdownリーフを返却します
 */
export function getActiveLeaf(): WorkspaceLeaf | null {
  return app.workspace.getLeaf();
}

/**
 * すべてのMarkdownリーフを返却します
 */
export function getAllMarkdownLeaves(): WorkspaceLeaf[] {
  return app.workspace.getLeavesOfType("markdown");
}
