import { Plugin } from "obsidian";
import { createCommands } from "./commands";
import { type Service, createServices } from "./services";
import { DEFAULT_SETTINGS, type PluginSettings, SettingTab } from "./settings";

export default class CarnelianPlugin extends Plugin {
  settings!: PluginSettings;
  services: Service[] = [];

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new SettingTab(this.app, this));
    for (const cmd of createCommands(this.settings)) {
      this.addCommand(cmd);
    }

    // メタデータが不完全な状態での処理を防ぐため
    const cacheResolvedRef = this.app.metadataCache.on("resolved", async () => {
      this.services = createServices(this.settings);
      for (const sv of this.services) {
        sv.onload?.();
      }
      this.app.metadataCache.offref(cacheResolvedRef);

      this.app.workspace.onLayoutReady(() => {
        for (const sv of this.services) {
          sv.onLayoutReady?.();
        }
      });
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
