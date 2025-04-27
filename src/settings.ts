import { type App, PluginSettingTab, Setting } from "obsidian";
import { TextComponentEvent } from "./lib/obsutils/settings";
import type CarnelianPlugin from "./main";

export const DEFAULT_COMMAND_HISTORY_PATH =
  ".obsidian/plugins/carnelian/command-histories.json";

export interface PluginSettings {
  commandHistoryPath: string;
  confluenceDomain: string;
  openAPIKey: string;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  commandHistoryPath: DEFAULT_COMMAND_HISTORY_PATH,
  confluenceDomain: "",
  openAPIKey: "",
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

    new Setting(containerEl)
      .setName("Confluenceのドメイン")
      .setDesc("Copy as Confluenceコマンドで使用するConfluenceのドメイン情報")
      .addText((cb) => {
        TextComponentEvent.onChange(cb, async (value) => {
          this.plugin.settings.confluenceDomain = value;
          await this.plugin.saveSettings();
        }).setValue(this.plugin.settings.confluenceDomain);
      });

    new Setting(containerEl)
      .setName("OpenAPI Key")
      .setDesc("OpenAPI Keyを指定します")
      .addText((cb) => {
        cb.inputEl.setAttribute("type", "password");
        TextComponentEvent.onChange(cb, async (value) => {
          this.plugin.settings.openAPIKey = value;
          await this.plugin.saveSettings();
        }).setValue(this.plugin.settings.openAPIKey);
      });
  }
}
