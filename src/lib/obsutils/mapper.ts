import { type EditorPosition, type Loc, normalizePath } from "obsidian";
import type { UApp } from "../types";

declare let app: UApp;

export function toEditorPosition(loc: Omit<Loc, "offset">): EditorPosition {
  return { ch: loc.col, line: loc.line };
}

export function toFullPath(path: string): string {
  const vaultRootPath = normalizePath(app.vault.adapter.basePath);
  return `${vaultRootPath}/${path}`;
}
