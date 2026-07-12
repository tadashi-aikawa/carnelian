import type { TFile } from "obsidian";
import {
  loadFileBodyCache,
  loadFileContentCache,
} from "src/lib/helpers/entries";
import { getPropertiesByPath } from "src/lib/helpers/properties";
import {
  insertElementAfterHeader,
  notifyValidationError,
  removeElementsFromContainer,
} from "src/lib/helpers/ui";
import {
  type Linter,
  type LintInspection,
  lintAll,
} from "src/lib/utils/linter";
import type { PluginSettings } from "src/settings";
import { getActiveOffset, moveToOffset } from "../helpers/editors/basic";
import { getAllMarkdownLeaves } from "../helpers/leaves";
import type { UApp, UFileView } from "../types";
import { groupBy, orderBy } from "../utils/collections";
import type { PartialRequired } from "../utils/types";

declare let app: UApp;

type LintInspectionWithOffset = PartialRequired<LintInspection, "offset">;
let inspectionsOrderByOffset: LintInspectionWithOffset[] = [];

// Lintの非同期処理中に同じViewへ新しいLintが開始された場合、古い結果を反映しないための世代管理
const lintGenerationByView = new WeakMap<UFileView, number>();

/**
 * ファイルにLinterをかけます
 * Lintの結果はviewsで指定した各Viewのヘッダ下部にDOMとして追加されます
 * (views未指定の場合はアクティブなViewのみ)
 */
export async function lint(
  file: TFile,
  linters: Linter[],
  settings: PluginSettings["linter"],
  autofix: boolean,
  views: UFileView[] = [app.workspace.getActiveFileView()],
) {
  const generations = views.map((view) => {
    const generation = (lintGenerationByView.get(view) ?? 0) + 1;
    lintGenerationByView.set(view, generation);
    return { view, generation };
  });

  const content = await loadFileContentCache(file.path);
  const body = await loadFileBodyCache(file.path);
  const properties = getPropertiesByPath(file.path) ?? undefined;
  const inspections = lintAll(linters, {
    title: file.basename,
    content: content ?? "",
    body: body ?? "",
    path: file.path,
    properties,
    settings,
  });

  // fix関数は実行時点のアクティブファイルを書き換えるため、
  // 非同期処理中にアクティブファイルが切り替わっていた場合はautofixしない
  const canAutoFix =
    autofix &&
    !properties?.ignoreAutoFix &&
    app.workspace.getActiveFileView()?.file?.path === file.path;
  if (canAutoFix) {
    await fixByInspections(inspections);
  }

  const activeView = app.workspace.getActiveFileView();
  for (const { view, generation } of generations) {
    // 非同期処理中に新しいLintが開始された、またはViewの表示ファイルが切り替わった場合は反映しない
    if (lintGenerationByView.get(view) !== generation) {
      continue;
    }
    if (view.file?.path !== file.path) {
      continue;
    }

    removeLinterInspectionElements(view);
    addLinterInspectionElement(inspections, canAutoFix, view);

    // 検査位置ジャンプ(move-to-next/previous-inspection)はアクティブエディタ専用のため
    if (view === activeView) {
      inspectionsOrderByOffset = orderBy(
        inspections.filter((x) => x.offset != null),
        (x) => x.offset!,
      ) as LintInspectionWithOffset[];
    }
  }
}

export function moveToNextInspection(): void {
  const offset = getActiveOffset();
  if (!offset) {
    return;
  }

  const nextInspection = inspectionsOrderByOffset.find(
    (ins) => ins.offset > offset,
  );
  if (!nextInspection) {
    return;
  }

  moveToOffset(nextInspection.offset, { scrollToCenter: true });
  // TODO: 右下で出したい
  notifyValidationError(nextInspection.code);
}

export function moveToPreviousInspection(): void {
  const offset = getActiveOffset();
  if (!offset) {
    return;
  }

  const previousInspection = inspectionsOrderByOffset.findLast(
    (ins) => ins.offset < offset,
  );
  if (!previousInspection) {
    return;
  }

  moveToOffset(previousInspection.offset, { scrollToCenter: true });
  // TODO: 右下で出したい
  notifyValidationError(previousInspection.code);
}

async function fixByInspections(inspections: LintInspection[]) {
  const fixFuncs = inspections.map((x) => x.fix).filter((x) => x != null);
  for (const fix of fixFuncs) {
    await fix();
  }
}

function addLinterInspectionElement(
  inspections: LintInspection[],
  canAutoFix: boolean,
  view: UFileView,
) {
  const summaries = Object.entries(groupBy(inspections, (x) => x.code)).map(
    ([code, inspections]) => ({ code, inspections }),
  );

  const nonFixableSummaries = summaries.filter(
    (x) => !canAutoFix || !x.inspections[0].fix,
  );
  const fixableSummaries = summaries.filter(
    (x) => canAutoFix && x.inspections[0].fix,
  );

  const inspectionsEl = createDiv({ cls: "linter-inspections" });

  // fix不可能
  for (const s of nonFixableSummaries) {
    let text = s.code;
    if (s.inspections.length > 1) {
      text = `${text} x ${s.inspections.length}`;
    }

    inspectionsEl.appendChild(
      createDiv({
        text,
        cls: [
          "linter-inspection",
          `linter-inspection__${s.inspections[0].level.toLowerCase()}`,
        ],
        title: `${s.inspections.map((x) => x.message).join("\n")}`,
      }),
    );
  }

  // fix可能
  const fixedContentsEl = createDiv({
    cls: "linter-inspections-container-contents__fixed",
  });

  for (const s of fixableSummaries) {
    let text = s.code;
    // INFO: fixableなinspectionは2つ以上のは無い気がする...
    if (s.inspections.length > 1) {
      text = `${text} x ${s.inspections.length}`;
    }

    const recordDiv = createDiv({
      cls: "linter-inspections-container-contents__fixed__record",
    });
    recordDiv.appendChild(
      createDiv({
        text,
        cls: [
          "linter-inspection",
          `linter-inspection__${s.inspections[0].level.toLowerCase()}`,
        ],
      }),
    );
    recordDiv.appendChild(
      createDiv({
        text: `${s.inspections[0].fixedMessage ?? s.inspections[0].message}`,
        cls: ["linter-inspections-container-contents__fixed__text"],
      }),
    );
    fixedContentsEl.appendChild(recordDiv);
  }

  if (fixedContentsEl.hasChildNodes()) {
    const fixedInspectionsEl = createDiv({
      cls: ["linter-inspections-container__fixed"],
    });

    fixedInspectionsEl.createDiv({
      text: "Fixed automatically",
      cls: "linter-inspections-container-title__fixed",
    });
    fixedInspectionsEl.appendChild(fixedContentsEl);
    inspectionsEl.appendChild(fixedInspectionsEl);
  }

  insertElementAfterHeader(inspectionsEl, view);
}

/**
 * ViewからLint結果の要素を削除します
 * view未指定の場合は開いているすべてのMarkdown Viewから削除します
 */
export function removeLinterInspectionElements(view?: UFileView): void {
  if (view) {
    removeElementsFromContainer(".linter-inspections", view);
    return;
  }

  for (const leaf of getAllMarkdownLeaves()) {
    removeElementsFromContainer(".linter-inspections", leaf.view);
  }
}
