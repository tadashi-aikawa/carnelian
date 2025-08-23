import { type App, PluginSettingTab } from "obsidian";
import type { Config } from "./definitions/config";
import { getVaultRootPath } from "./lib/helpers/workspace";
import type CarnelianPlugin from "./main";

export const DEFAULT_COMMAND_HISTORY_PATH =
  ".obsidian/plugins/carnelian/command-histories.json";

export type PluginSettings = Config;

export const DEFAULT_SETTINGS: PluginSettings = {
  commandHistoryPath: DEFAULT_COMMAND_HISTORY_PATH,
};

export class SettingTab extends PluginSettingTab {
  plugin: CarnelianPlugin;

  constructor(app: App, plugin: CarnelianPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();
    const root = containerEl.createDiv({
      attr: {
        style:
          "display: flex; flex-direction: column; align-items: center; gap: 2em; padding: 1em",
      },
    });
    root.createEl("img", {
      attr: {
        src: "https://github.com/tadashi-aikawa/carnelian/raw/master/carnelian_logo.svg",
      },
    });
    root.createEl("img", {
      attr: {
        src: "https://github.com/tadashi-aikawa/carnelian/raw/master/carnelian.webp",
        width: "256",
      },
    });

    const button = root.createEl("button", {
      text: "Edit config with VSCode",
      attr: {
        style:
          "padding: 0.5em 1em; font-size: 1em; cursor: pointer; border-radius: 4px; background-color: #F14011; color: white; border: none;",
      },
    });
    button.addEventListener("click", () => {
      const configPath = `${getVaultRootPath()}/.obsidian/plugins/${this.plugin.manifest.id}/data.json`;
      window.open(`vscode://file${configPath}`);
    });
  }
}
