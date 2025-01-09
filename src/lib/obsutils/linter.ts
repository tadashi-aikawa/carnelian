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
  addLinterInspectionElement(inspections);
}

function addLinterInspectionElement(inspections: LintInspection[]) {
  const summaries = Object.entries(groupBy(inspections, (x) => x.code)).map(
    ([code, inspections]) => ({ code, inspections }),
  );

  const el = createDiv({ cls: "linter-inspections" });
  for (const s of summaries) {
    let text = s.code;
    if (s.inspections.length > 1) {
      text = `${text} x ${s.inspections.length}`;
    }
    el.appendChild(
      createDiv({
        text,
        cls: [
          "linter-inspection",
          `linter-inspection__${s.inspections[0].level.toLowerCase()}`,
        ],
        attr: {
          style: "display: flex; align-items: center",
        },
      }),
    );
  }
  insertElementAfterHeader(el);
}

/**
 * ファイルが表示されているViewからプロパティ要素を削除します
 */
export function removeLinterInspectionElements(): void {
  removeElementsFromContainer(".linter-inspections");
}
