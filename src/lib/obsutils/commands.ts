import { Command, FuzzySuggestModal } from "obsidian";
import { getActiveEditor } from "../helpers/editors/basic";
import { getActiveFile } from "../helpers/entries";
import { UApp } from "../types";

declare let app: UApp;

export type CarnelianCommand = {
  name: string;
  kind: "file" | "editor" | "all";
  executor: () => Awaited<any> | Promise<any>;
  // Show Carnelian commandsで隠すかどうか (通常のクイックスウィッチャーには表示される)
  hideOnCommandList?: boolean;
};

export function createCommand(command: CarnelianCommand): Command {
  return {
    id: "carnelian_" + command.name.toLowerCase().split(" ").join("-"),
    name: command.name,
    checkCallback: (checking: boolean) => {
      if (command.kind === "file" && !getActiveFile()) {
        return false;
      }
      if (command.kind === "editor" && !getActiveEditor()) {
        return false;
      }

      if (!checking) {
        command.executor();
      }
      return true;
    },
  };
}

/**
 * Carnelianコマンドを実行するクイックスウィッチャーを表示します
 */
export function showCarnelianCommands(commands: CarnelianCommand[]) {
  const cl = class extends FuzzySuggestModal<CarnelianCommand> {
    getItems(): CarnelianCommand[] {
      return commands.filter((x) => !x.hideOnCommandList);
    }
    getItemText(item: CarnelianCommand): string {
      return item.name;
    }
    onChooseItem(item: CarnelianCommand): void {
      item.executor();
    }
  };
  new cl(app).open();
}
