import { AddDatePropertiesService } from "./services/add-date-properties-service";
import { AddPropertiesToHeadService } from "./services/add-properties-to-head-service";
import { FormatService } from "./services/format-service";
import { LintService } from "./services/lint-service";
import type { PluginSettings } from "./settings";

export interface Service {
  name: string;
  onload?(): void;
  onLayoutReady?(): void;
  onunload?(): void;
}

// INFO: _settingsは使ってないけど、設定を使いたい場合はここで渡すべし
export function createServices(settings: PluginSettings): Service[] {
  return [
    new AddDatePropertiesService(),
    settings.linter ? new LintService() : [],
    new FormatService(),
    new AddPropertiesToHeadService(),
  ].flat();
}
