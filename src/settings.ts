// TODO: 必要になったらつくる
import { App, PluginSettingTab } from "obsidian";
import CarnelianPlugin from "./main";

export interface PluginSettings {
  mySetting: string;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  mySetting: "default",
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
    // 今は不要
  }
}
