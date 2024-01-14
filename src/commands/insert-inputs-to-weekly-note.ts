import dayjs from "dayjs";
import { TFile } from "obsidian";
import { insertToCursor } from "src/lib/helpers/editors/basic";
import { getMarkdownFilesInRange } from "src/lib/helpers/entries";
import { getActiveFileDescriptionProperty } from "src/lib/helpers/properties";
import { notify } from "src/lib/helpers/ui";
import * as strings from "../lib/utils/strings";

/**
 * 1週間で作成したノートの一覧をWeekly Reportに差し込みます
 */
export async function insertInputsToWeeklyNote() {
  const description = getActiveFileDescriptionProperty();
  if (!description) {
    return notify("プロパティにdescriptionが存在しません");
  }

  const [weekBegin, weekEnd] = strings.doSinglePatternMatching(
    description,
    /\d{4}-\d{2}-\d{2}/g,
  );
  if (!weekBegin) {
    return notify("descriptionプロパティに開始日が存在しません");
  }
  if (!weekEnd) {
    return notify("descriptionプロパティに終了日が存在しません");
  }

  const isPublicNote = (file: TFile) =>
    !file.path.startsWith("_") && file.extension === "md";

  const noteLists = getMarkdownFilesInRange(
    dayjs(weekBegin),
    dayjs(weekEnd).add(1, "days"),
  )
    .filter(isPublicNote)
    .map((x) => `- [[${x.basename}]]`)
    .sort()
    .join("\n");

  insertToCursor(noteLists);

  notify(`${weekBegin} ～ ${weekEnd} に作成されたノートを挿入しました`, 5000);
}
