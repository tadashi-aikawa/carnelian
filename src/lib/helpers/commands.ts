import type { Command } from "obsidian";
import type { UApp } from "../types";

declare let app: UApp;

/**
 * 有効なコマンド一覧を取得します
 */
export function getAvailableCommands(): Command[] {
  return Object.values(app.commands.commands).filter(
    (x) => !x.checkCallback || x.checkCallback(true),
  );
}
