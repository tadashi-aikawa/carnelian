import { AddDatePropertiesService } from "./services/add-date-properties-service";
import { AddDatePropertiesToHeadService } from "./services/add-date-properties-to-head-service";
import { PluginSettings } from "./settings";

export interface Service {
  name: string;
  onload?(): void;
  onLayoutReady?(): void;
  onunload?(): void;
}

// INFO: _settingsは使ってないけど、設定を使いたい場合はここで渡すべし
export function createServices(_settings: PluginSettings): Service[] {
  return [new AddDatePropertiesToHeadService(), new AddDatePropertiesService()];
}
