import type { TFile } from "obsidian";
import type { UApp, UWorkspaceLeaf, UWorkspaceMarkdownLeaf } from "../types";

declare let app: UApp;

/**
 * アクティブなリーフを返却します
 */
export function getActiveLeaf(): UWorkspaceLeaf | null {
  return app.workspace.getLeaf() as UWorkspaceLeaf | null;
}

/**
 * リーフをアクティブに設定します
 */
export function setActiveLeaf(leaf: UWorkspaceLeaf): void {
  app.workspace.setActiveLeaf(leaf, { focus: true });
}

/**
 * すべてのリーフを返却します
 */
export function getAllLeaves(): UWorkspaceLeaf[] {
  const existing: UWorkspaceLeaf[] = [];
  app.workspace.iterateAllLeaves((leaf) =>
    existing.push(leaf as UWorkspaceLeaf),
  );
  return existing;
}

/**
 * すべてのMarkdownリーフを返却します
 */
export function getAllMarkdownLeaves(): UWorkspaceMarkdownLeaf[] {
  return app.workspace.getLeavesOfType("markdown") as UWorkspaceMarkdownLeaf[];
}

/**
 * 開いているMarkdownファイルを重複除外して返却します
 */
export function getOpenMarkdownFiles(): TFile[] {
  const seen = new Set<string>();
  return getAllMarkdownLeaves()
    .flatMap((leaf) => (leaf.view.file ? [leaf.view.file] : []))
    .filter((file) => {
      if (seen.has(file.path)) return false;
      seen.add(file.path);
      return true;
    });
}
