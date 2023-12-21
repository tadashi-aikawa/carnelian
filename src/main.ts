import { Plugin as ObsidianPlugin } from "obsidian";
import { createCommands } from "./commands";
import { DEFAULT_SETTINGS, PluginSettings, SettingTab } from "./settings";

export default class Plugin extends ObsidianPlugin {
  settings!: PluginSettings;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new SettingTab(this.app, this));
    createCommands(this.settings).forEach((cmd) => this.addCommand(cmd));
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
