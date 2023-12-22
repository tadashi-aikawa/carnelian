import { Command } from "obsidian";
import { getActiveEditor } from "../helpers/editors";
import { getActiveFile } from "../helpers/entries";

type Args = {
  name: string;
  kind: "file" | "editor";
  executor: () => void | Promise<void>;
};
export function createCommand(args: Args): Command {
  return {
    id: "carnelian_" + args.name.toLowerCase().split(" ").join("-"),
    name: args.name,
    checkCallback: (checking: boolean) => {
      if (args.kind === "file" && !getActiveFile()) {
        return false;
      }
      if (args.kind === "editor" && !getActiveEditor()) {
        return false;
      }

      if (!checking) {
        args.executor();
      }
      return true;
    },
  };
}
