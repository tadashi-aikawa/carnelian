import { Command, Notice } from "obsidian";
import { PluginSettings } from "./settings";

export function createCommands(settings: PluginSettings): Command[] {
  return [
    {
      id: "test-command",
      name: "てすとこまんど！",
      checkCallback: (checking: boolean) => {
        if (!checking) {
          new Notice("ももたけ2！");
        }
        return true;
      },
    },
  ];
}
