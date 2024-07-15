import type { Command } from "obsidian";
import { getActiveEditor } from "../helpers/editors/basic";
import { getActiveFile } from "../helpers/entries";

export type CarnelianCommand = {
  name: string;
  kind: "file" | "editor" | "all";
  executor: () => Awaited<any> | Promise<any>;
};

export function createCommand(command: CarnelianCommand): Command {
  return {
    id: `carnelian_${command.name.toLowerCase().split(" ").join("-")}`,
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
