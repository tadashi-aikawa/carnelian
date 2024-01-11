import { now } from "src/lib/helpers/datetimes";
import { insertToCursor } from "src/lib/helpers/editors/basic";
import { showInputDialog } from "src/lib/helpers/ui";

/**
 * 本日のMTGノートを挿入します
 */
export async function insertTodaysMTG() {
  const today = now("YYYY-MM-DD");

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

  insertToCursor(`- [ ] ${startTime} [[📅${today} ${title}]]`);
}
