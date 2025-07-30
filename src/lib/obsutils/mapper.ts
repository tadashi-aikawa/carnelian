import { type EditorPosition, type Loc, normalizePath } from "obsidian";
import { getVaultRootPath } from "../helpers/workspace";

export function toEditorPosition(loc: Omit<Loc, "offset">): EditorPosition {
  return { ch: loc.col, line: loc.line };
}

export function toFullPath(path: string): string {
  const vaultRootPath = normalizePath(getVaultRootPath());
  return `/${vaultRootPath}/${path}`;
}
