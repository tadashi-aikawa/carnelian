import { type EventRef, Plugin } from "obsidian";
import { createCommands } from "./commands";
import { LINT_VIEW_TYPE, LintView } from "./commands/open-lint-view";
import type { UApp } from "./lib/types";
import { createServices, type Service } from "./services";
import { DEFAULT_SETTINGS, type PluginSettings, SettingTab } from "./settings";

import "dayjs/locale/ja";
import dayjs from "dayjs";

dayjs.locale("ja");

export default class CarnelianPlugin extends Plugin {
  declare settings: PluginSettings;
  services: Service[] = [];
  declare app: UApp;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new SettingTab(this.app, this));
    this.registerView(
      LINT_VIEW_TYPE,
      (leaf) => new LintView(leaf, this.settings.linter),
    );
    for (const cmd of createCommands(this.settings)) {
      this.addCommand(cmd);
    }

    const init = (cacheResolvedRef?: EventRef) => {
      this.services = createServices(this.settings, this);
      for (const sv of this.services) {
        sv.onload?.();
      }
      if (cacheResolvedRef) {
        this.app.metadataCache.offref(cacheResolvedRef);
      }

      this.app.workspace.onLayoutReady(() => {
        for (const sv of this.services) {
          sv.onLayoutReady?.();
        }
      });
    };

    if (this.app.metadataCache.initialized) {
      init();
    } else {
      // メタデータが不完全な状態での処理を防ぐため
      const cacheResolvedRef = this.app.metadataCache.on("resolved", () => {
        init(cacheResolvedRef);
      });
    }
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
