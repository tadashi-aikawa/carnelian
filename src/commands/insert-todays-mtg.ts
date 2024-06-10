import { now } from "src/lib/helpers/datetimes";
import { insertToCursor } from "src/lib/helpers/editors/basic";
import { getActiveFile } from "src/lib/helpers/entries";
import { notify, showInputDialog } from "src/lib/helpers/ui";

/**
 * MTGノートを挿入します
 * 表示中のデイリーノートの日付を使用します
 * WARN: YYYY-MM-DDというデイリーノート名である前提
 */
export async function insertMTG() {
  const file = getActiveFile();
  if (!file) {
    return notify("デイリーノートで実行してください");
  }

  const date = now(file.basename);

  const title = await showInputDialog({
    message: "MTGタイトルを入力してください",
  });
  if (!title) {
    return;
  }

  const startTime = await showInputDialog({
    message: "開始時間を入力してください",
    placeholder: "12:30",
  });
  if (!startTime) {
    return;
  }

  insertToCursor(`- [ ] ${startTime} [[📅${date} ${title}]]`);
}
