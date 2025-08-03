import { now } from "src/lib/helpers/datetimes";
import { insertToCursor } from "src/lib/helpers/editors/basic";
import { createFile, openFile } from "src/lib/helpers/entries";
import { exists } from "src/lib/helpers/io";
import { notify, showInputDialog } from "src/lib/helpers/ui";

/**
 * MTG用ノートを作成し、カーソル配下にリンクを挿入します
 */
export async function createMtgNote() {
  const date = await showInputDialog({
    message: "MTGの日付を入力してください",
    placeholder: "YYYY-MM-DD",
    defaultValue: now("YYYY-MM-DD"),
    inputType: "date",
  });
  if (!date) {
    return;
  }

  const NOTE_BODY = `
---
created: ${date}
updated: ${date}
participants:
---

`.trim();

  const inputTitle = await showInputDialog({
    message: "MTGのタイトルを入力してください",
    defaultValue: `MTG_${date.replaceAll(/-/g, "")}_`,
  });
  if (!inputTitle) {
    return;
  }

  const path = `Notes/${inputTitle}.md`;
  if (await exists(path)) {
    return notify(`${path} は既に存在します`);
  }

  insertToCursor(`[[${inputTitle}]]`);
  const f = await createFile(path, NOTE_BODY);
  await openFile(f.path);
}
