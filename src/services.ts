import { AddDatePropertiesService } from "./services/add-date-properties-service";
import { AddPropertiesToHeadService } from "./services/add-properties-to-head-service";
import { FixPropertiesService } from "./services/fix-properties-service";
import type { PluginSettings } from "./settings";

export interface Service {
  name: string;
  onload?(): void;
  onLayoutReady?(): void;
  onunload?(): void;
}

// INFO: _settingsは使ってないけど、設定を使いたい場合はここで渡すべし
export function createServices(_settings: PluginSettings): Service[] {
  return [
    new AddPropertiesToHeadService(),
    new AddDatePropertiesService(),
    new FixPropertiesService(),
  ];
}
