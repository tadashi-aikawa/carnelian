import { insertToCursor } from "src/lib/helpers/editors/basic";
import { getDailyNotes } from "src/lib/helpers/plugins";
import { getActiveFileDescriptionProperty } from "src/lib/helpers/properties";
import { loadHeadingSectionContentByPath } from "src/lib/helpers/sections";
import {
  notify,
  notifyValidationError,
  notifyWarning,
} from "src/lib/helpers/ui";
import * as strings from "../lib/utils/strings";

type TopLevelListGroup = {
  header: string;
  children: string[];
};

/**
 * 1週間のDaily Noteの「やったこと」をトップレベル項目ごとにマージして差し込みます
 */
export async function insertDoneToWeeklyReport() {
  const description = getActiveFileDescriptionProperty();
  if (!description) {
    return notifyValidationError("プロパティにdescriptionが存在しません");
  }

  const [weekBegin, weekEnd] = strings.doSinglePatternMatching(
    description,
    /\d{4}-\d{2}-\d{2}/g,
  );
  if (!weekBegin) {
    return notifyValidationError("descriptionプロパティに開始日が存在しません");
  }
  if (!weekEnd) {
    return notifyValidationError("descriptionプロパティに終了日が存在しません");
  }

  const notes = getDailyNotes(weekBegin, weekEnd);
  if (notes.length === 0) {
    return notifyWarning("指定期間にデイリーノートが存在しませんでした。");
  }

  const mergedGroups = new Map<string, string[]>();
  let groupCount = 0;

  for (const note of notes) {
    const content = await loadHeadingSectionContentByPath(
      note.path,
      "やったこと",
      2,
    );
    if (!content) {
      continue;
    }

    const groups = parseTopLevelListGroups(strings.trimEmptyLines(content));
    groupCount += groups.length;

    for (const group of groups) {
      const current = mergedGroups.get(group.header) ?? [];
      const childContent = trimBlankLines(group.children.join("\n"));
      if (childContent) {
        current.push(childContent);
      }
      mergedGroups.set(group.header, current);
    }
  }

  if (groupCount === 0 || mergedGroups.size === 0) {
    return notifyWarning(
      "指定期間に対象の『やったこと』が存在しませんでした。",
    );
  }

  const mergedContent = [...mergedGroups.entries()]
    .map(([header, children]) =>
      children.length === 0 ? header : `${header}\n${children.join("\n")}`,
    )
    .join("\n");

  insertToCursor(`\n${mergedContent}`);
  notify(`${weekBegin} ～ ${weekEnd} のやったことを挿入しました`, 5000);
}

function parseTopLevelListGroups(text: string): TopLevelListGroup[] {
  const groups: TopLevelListGroup[] = [];
  let current: TopLevelListGroup | null = null;

  for (const line of text.split("\n")) {
    if (/^[-*+] /.test(line)) {
      current = {
        header: line,
        children: [],
      };
      groups.push(current);
      continue;
    }

    if (!current) {
      continue;
    }

    current.children.push(line);
  }

  return groups;
}

function trimBlankLines(text: string): string {
  return text.replace(/^\n+/, "").replace(/\n+$/, "");
}
