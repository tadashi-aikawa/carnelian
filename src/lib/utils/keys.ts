import { Platform } from "obsidian";

export function isMod(event: MouseEvent | KeyboardEvent): boolean {
  return Platform.isMacOS ? event.metaKey : event.ctrlKey;
}
