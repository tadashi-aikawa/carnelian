import type { TFile } from "obsidian";
import { loadFileContentCache } from "src/lib/helpers/entries";
import { getPropertiesByPath } from "src/lib/helpers/properties";
import {
  insertElementAfterHeader,
  removeElementsFromContainer,
} from "src/lib/helpers/ui";
import {
  type LintInspection,
  type Linter,
  lintAll,
} from "src/lib/utils/linter";
import { groupBy } from "../utils/collections";

/**
 * ファイルにLinterをかけます
 * Lintの結果はヘッダ下部にDOMとして追加されます
 */
export async function lint(file: TFile, linters: Linter[]) {
  const content = await loadFileContentCache(file.path);
  const properties = getPropertiesByPath(file.path) ?? undefined;
  const inspections = lintAll(linters, {
    title: file.basename,
    content: content ?? "",
    path: file.path,
    properties,
  });

  removeLinterInspectionElements();
  if (!properties?.ignoreAutoFix) {
    await fixByInspections(inspections);
  }
  addLinterInspectionElement(inspections);
}

async function fixByInspections(inspections: LintInspection[]) {
  const fixFuncs = inspections.map((x) => x.fix).filter((x) => x != null);
  for (const fix of fixFuncs) {
    await fix();
  }
}

function addLinterInspectionElement(inspections: LintInspection[]) {
  const summaries = Object.entries(groupBy(inspections, (x) => x.code)).map(
    ([code, inspections]) => ({ code, inspections }),
  );

  const nonFixableSummaries = summaries.filter((x) => !x.inspections[0].fix);
  const fixableSummaries = summaries.filter((x) => x.inspections[0].fix);

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
    if (s.inspections.length > 1) {
      text = `${text} x ${s.inspections.length}`;
    }

    fixedContentsEl.appendChild(
      createDiv({
        text,
        cls: [
          "linter-inspection",
          `linter-inspection__${s.inspections[0].level.toLowerCase()}`,
        ],
      }),
    );
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

  insertElementAfterHeader(inspectionsEl);
}

/**
 * ファイルが表示されているViewからプロパティ要素を削除します
 */
export function removeLinterInspectionElements(): void {
  removeElementsFromContainer(".linter-inspections");
}
