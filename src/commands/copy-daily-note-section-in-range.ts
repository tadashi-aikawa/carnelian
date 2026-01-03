import dayjs from "dayjs";
import type { AllConfig } from "src/definitions/config";
import { now } from "src/lib/helpers/datetimes";
import { getDailyNotes } from "src/lib/helpers/plugins";
import { loadHeadingSectionContentByPath } from "src/lib/helpers/sections";
import {
  copyToClipboard,
  notify,
  notifyValidationError,
  notifyWarning,
  showInputDialog,
} from "src/lib/helpers/ui";
import { trimEmptyLines } from "src/lib/utils/strings";

/**
 * 指定期間のDaily Noteから指定セクションを抽出してクリップボードにコピーします
 */
export async function copyDailyNoteSectionInRange(
  options?: AllConfig["Copy daily note section in range"],
) {
  const sectionName = options?.sectionName?.trim();
  if (!sectionName) {
    return notifyValidationError(
      "'all.Copy daily note section in range.sectionName' が設定されていません。",
    );
  }

  const beginInput = await showInputDialog({
    message: "開始日を入力してください",
    placeholder: "YYYY-MM-DD",
    defaultValue: now("YYYY-MM-DD"),
    inputType: "date",
  });
  if (beginInput === null) {
    return;
  }
  if (!beginInput) {
    return notifyValidationError("開始日が入力されていません。");
  }

  const endInput = await showInputDialog({
    message: "終了日を入力してください",
    placeholder: "YYYY-MM-DD",
    defaultValue: beginInput,
    inputType: "date",
  });
  if (endInput === null) {
    return;
  }
  if (!endInput) {
    return notifyValidationError("終了日が入力されていません。");
  }

  const begin = dayjs(beginInput);
  const end = dayjs(endInput);
  if (!begin.isValid() || !end.isValid()) {
    return notifyValidationError("日付の形式が正しくありません。");
  }

  const notes = getDailyNotes(
    begin.format("YYYY-MM-DD"),
    end.format("YYYY-MM-DD"),
  );
  if (notes.length === 0) {
    return notifyWarning("指定期間にデイリーノートが存在しませんでした。");
  }

  const sections: string[] = [];
  for (const note of notes) {
    const content = await loadHeadingSectionContentByPath(
      note.path,
      sectionName,
      2,
    );
    if (!content) {
      continue;
    }

    const trimmed = trimEmptyLines(content);
    if (!trimmed) {
      continue;
    }

    sections.push(`## ${note.basename}\n\n${trimmed}`);
  }

  if (sections.length === 0) {
    return notifyWarning("指定期間に対象セクションが存在しませんでした。");
  }

  await copyToClipboard(sections.join("\n\n"));
  notify("📋 クリップボードにコピーしました。", 5000);
}
