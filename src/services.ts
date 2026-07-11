import type { Plugin } from "obsidian";
import { AddPropertiesToHeadService } from "./services/add-properties-to-head-service";
import { AutoDatePropertiesService } from "./services/auto-date-properties-service";
import { FormatService } from "./services/format-service";
import { LinkClickService } from "./services/link-click-service";
import { LinkDecorationService } from "./services/link-decoration-service";
import { LintService } from "./services/lint-service";
import type { PluginSettings } from "./settings";

export interface Service {
  name: string;
  onload?(): void;
  onLayoutReady?(): void;
  onunload?(): void;
}

export function createServices(
  settings: PluginSettings,
  plugin: Plugin,
): Service[] {
  return [
    new AutoDatePropertiesService(),
    settings.linter ? new LintService(settings.linter) : [],
    new FormatService(settings.formatter),
    new AddPropertiesToHeadService(),
    settings.click?.["Open link vertically"] ? new LinkClickService() : [],
    settings.appearance?.["Show link status chip"] ||
    settings.appearance?.["Highlight fixme links"]
      ? new LinkDecorationService(plugin, {
          showStatusChip: settings.appearance["Show link status chip"] ?? false,
          highlightFixmeLinks:
            settings.appearance["Highlight fixme links"] ?? false,
        })
      : [],
  ].flat();
}
