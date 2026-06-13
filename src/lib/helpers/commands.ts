import type { Command } from "obsidian";
import type { CommandId, UApp } from "../types";

declare let app: UApp;

/**
 * 有効なコマンド一覧を取得します
 */
export function getAvailableCommands(): Command[] {
  return Object.values(app.commands.commands).filter(
    (x) => !x.checkCallback || x.checkCallback(true),
  );
}

/**
 * コマンドIDからコマンドを取得します
 */
export function findCommandById(commandId: CommandId): Command | null {
  return app.commands.commands[commandId] ?? null;
}

/**
 * コマンドIDからコマンドを実行します
 */
export function runCommandById(commandId: CommandId): boolean {
  return app.commands.executeCommandById(commandId);
}
