import type { TFile } from "obsidian";
import { contentLinter } from "src/definitions/linters/ContentLinter";
import { propertyLinter } from "src/definitions/linters/PropertyLinter";
import { getActiveFile } from "src/lib/helpers/entries";
import {
  setOnExWCommandEvent,
  setOnFileOpenEvent,
} from "src/lib/helpers/events";
import { lint, removeLinterInspectionElements } from "src/lib/obsutils/linter";
import type { Service } from "src/services";
import type { PluginSettings } from "src/settings";

/**
 * ファイルをアクティブにしたときにLint(検査)をするサービスです
 */
export class LintService implements Service {
  name = "Lint";
  unsetFileOpenHandler!: () => void;
  unsetExWCommandHandler!: () => void;

  constructor(public settings: PluginSettings["linter"]) {}

  onLayoutReady(): void {
    // 起動直後、既にファイルが開かれている場合はファイルの中身を保存する (setOnCreateFileEvent では取得できないため)
    const activeFile = getActiveFile();
    if (activeFile) {
      lintFile(activeFile, this.settings, false);
    }
  }

  onload(): void {
    this.unsetFileOpenHandler = setOnFileOpenEvent(async (file) => {
      if (!file) {
        return;
      }
      await lintFile(file, this.settings, false);
    });
    this.unsetExWCommandHandler = setOnExWCommandEvent(
      (file) => lintFile(file, this.settings, true),
      this.name,
    );
  }

  onunload(): void {
    this.unsetFileOpenHandler();
    this.unsetExWCommandHandler();
    removeLinterInspectionElements();
  }
}

export async function lintFile(
  file: TFile,
  settings: PluginSettings["linter"],
  autofix: boolean,
) {
  await lint(file, [contentLinter, propertyLinter], settings, autofix);
}
