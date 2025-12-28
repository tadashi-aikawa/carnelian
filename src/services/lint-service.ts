import type { TFile } from "obsidian";
import { contentLinter } from "src/definitions/linters/ContentLinter";
import { propertyLinter } from "src/definitions/linters/PropertyLinter";
import { getActiveFile } from "src/lib/helpers/entries";
import {
  setOnActiveLeafChangeEvent,
  setOnExWCommandEvent,
} from "src/lib/helpers/events";
import { lint, removeLinterInspectionElements } from "src/lib/obsutils/linter";
import type { Service } from "src/services";
import type { PluginSettings } from "src/settings";

/**
 * ファイルをアクティブにしたときにLint(検査)をするサービスです
 */
export class LintService implements Service {
  name = "Lint";
  unsetActiveLeafChangeHandler!: () => void;
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
    // INFO: setOnFileOpenEvent ではなく setOnActiveLeafChangeEvent を使うのは
    //       同名ファイルを複数開いたときなどに対応するため
    // WARNING: AQSでpreviewをしたあとに現在のタブ以外で開いた場合
    //          プレビュー前に表示されているファイルのLint diagnosticsが正しく表示されない問題がある
    //          (最後にプレビューしたdiagnosticsが表示される)
    this.unsetActiveLeafChangeHandler = setOnActiveLeafChangeEvent(
      async (leaf) => {
        const file = leaf?.view.file;
        if (!file) {
          return;
        }
        await lintFile(file, this.settings, false);
      },
      this.name,
    );

    this.unsetExWCommandHandler = setOnExWCommandEvent(
      (file) => lintFile(file, this.settings, true),
      this.name,
    );
  }

  onunload(): void {
    this.unsetActiveLeafChangeHandler();
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
