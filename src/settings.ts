// TODO: 必要になったらつくる
import { App, PluginSettingTab } from "obsidian";
import Plugin from "./main";

export interface PluginSettings {
  mySetting: string;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  mySetting: "default",
};

export class SettingTab extends PluginSettingTab {
  plugin: Plugin;

  constructor(app: App, plugin: Plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();
    // 今は不要
  }
}
