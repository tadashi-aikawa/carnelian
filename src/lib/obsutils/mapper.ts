import { EditorPosition, Loc } from "obsidian";

export function toEditorPosition(loc: Omit<Loc, "offset">): EditorPosition {
  return { ch: loc.col, line: loc.line };
}
