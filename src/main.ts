import { Plugin } from "obsidian";
import { createCommands } from "./commands";
import { DEFAULT_SETTINGS, PluginSettings, SettingTab } from "./settings";
import { createServices, Service } from "./services";

export default class CarnelianPlugin extends Plugin {
  settings!: PluginSettings;
  services: Service[] = [];

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new SettingTab(this.app, this));
    createCommands(this.settings).forEach((cmd) => this.addCommand(cmd));

    this.services = createServices(this.settings);
    this.services.forEach((sv) => sv.onload());
  }

  onunload() {
    this.services.forEach((sv) => sv.onunload());
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
