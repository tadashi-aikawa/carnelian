import type { TFile } from "obsidian";
import { contentLinter } from "src/definitions/linters/ContentLinter";
import { propertyLinter } from "src/definitions/linters/PropertyLinter";
import {
  getActiveFile,
  loadFileBodyCache,
  loadFileContentCache,
} from "src/lib/helpers/entries";
import {
  setOnActiveLeafChangeEvent,
  setOnExWCommandEvent,
} from "src/lib/helpers/events";
import { getVisibleMarkdownLeaves } from "src/lib/helpers/leaves";
import { getPropertiesByPath } from "src/lib/helpers/properties";
import { lint, removeLinterInspectionElements } from "src/lib/obsutils/linter";
import type { UApp, UFileView } from "src/lib/types";
import { type LintInspection, lintAll } from "src/lib/utils/linter";
import type { Service } from "src/services";
import type { PluginSettings } from "src/settings";

declare let app: UApp;

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
    // reload時は初回はイベントが発生しないので
    // WARN: 冪等性担保の実装が必要
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

// 古いlintFile()由来の背景Lintが、後から開始されたlintFile()の結果を上書きしないための世代管理
let latestLintFileSession = 0;

export async function lintFile(
  file: TFile,
  settings: PluginSettings["linter"],
  autofix: boolean,
) {
  const session = ++latestLintFileSession;
  const activeView = app.workspace.getActiveFileView();
  // 同一ファイルを表示中の非アクティブペインにも同じ検査結果を描画する
  // (autofix後に再検査すると修正前の内容が対象になり表示が矛盾するため)
  // 背面タブは前面に出るときに必ずactive-leaf-changeでLintされるため対象外
  const sameFileViews = getVisibleMarkdownLeaves()
    .map((leaf) => leaf.view)
    .filter((view) => view !== activeView && view.file?.path === file.path);
  await lint(file, [contentLinter, propertyLinter], settings, autofix, [
    activeView,
    ...sameFileViews,
  ]);
  app.workspace.trigger("carnelian:lint-complete" as any, file, autofix);

  // アクティブファイル以外のペインに表示中のファイルもLint結果を更新する
  // (autofixが必要なのはアクティブエディタだけなので検査のみ)
  await lintOpenFilesExcept(file, settings, session);
}

async function lintOpenFilesExcept(
  excludedFile: TFile,
  settings: PluginSettings["linter"],
  session: number,
) {
  const viewsByPath = new Map<string, { file: TFile; views: UFileView[] }>();
  for (const leaf of getVisibleMarkdownLeaves()) {
    const file = leaf.view.file;
    if (!file || file.path === excludedFile.path) {
      continue;
    }
    const entry = viewsByPath.get(file.path) ?? { file, views: [] };
    entry.views.push(leaf.view);
    viewsByPath.set(file.path, entry);
  }

  for (const { file, views } of viewsByPath.values()) {
    // 新しいlintFile()が開始されたら、この背景更新は古いため中止する
    if (session !== latestLintFileSession) {
      return;
    }
    await lint(file, [contentLinter, propertyLinter], settings, false, views);
  }
}

export async function inspectFile(
  file: TFile,
  settings: PluginSettings["linter"],
): Promise<LintInspection[]> {
  const content = await loadFileContentCache(file.path);
  const body = await loadFileBodyCache(file.path);
  const properties = getPropertiesByPath(file.path) ?? undefined;
  return lintAll([contentLinter, propertyLinter], {
    title: file.basename,
    content: content ?? "",
    body: body ?? "",
    path: file.path,
    properties,
    settings,
  });
}
