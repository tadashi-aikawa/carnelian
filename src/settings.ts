import { App, PluginSettingTab, Setting } from "obsidian";
import CarnelianPlugin from "./main";
import { TextComponentEvent } from "./lib/obsutils/settings";

export const DEFAULT_COMMAND_HISTORY_PATH =
  ".obsidian/plugins/carnelian/command-histories.json";

export interface PluginSettings {
  commandHistoryPath: string;
}

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

    new Setting(containerEl)
      .setName("コマンド履歴ファイルのパス")
      .setDesc(`Default: ${DEFAULT_COMMAND_HISTORY_PATH}`)
      .addText((cb) => {
        TextComponentEvent.onChange(cb, async (value) => {
          this.plugin.settings.commandHistoryPath = value;
          await this.plugin.saveSettings();
        }).setValue(this.plugin.settings.commandHistoryPath);
      });
  }
}
