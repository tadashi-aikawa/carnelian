import { Plugin } from "obsidian";
import { createCommands } from "./commands";
import { Service, createServices } from "./services";
import { DEFAULT_SETTINGS, PluginSettings, SettingTab } from "./settings";

export default class CarnelianPlugin extends Plugin {
  settings!: PluginSettings;
  services: Service[] = [];

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new SettingTab(this.app, this));
    for (const cmd of createCommands(this.settings)) {
      this.addCommand(cmd);
    }

    this.services = createServices(this.settings);
    for (const sv of this.services) {
      sv.onload?.();
    }

    this.app.workspace.onLayoutReady(() => {
      for (const sv of this.services) {
        sv.onload?.();
      }
    });
  }

  onunload() {
    for (const sv of this.services) {
      sv.onunload?.();
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
