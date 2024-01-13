import { now } from "src/lib/helpers/datetimes";
import { insertToCursor } from "src/lib/helpers/editors/basic";
import { showInputDialog } from "src/lib/helpers/ui";

/**
 * [Activity note]を挿入します
 *
 * [Activity note]: (https://minerva.mamansoft.net/Notes/Activity%20note)
 */
export async function insertActivityNote() {
  const today = now("YYYY-MM-DD");

  const title = await showInputDialog({
    message: "ノートタイトルを入力してください",
    placeholder: "Obsidianを使ってみる",
  });
  if (!title) {
    return;
  }

  insertToCursor(`- [ ] [[📜${today} ${title}]]`);
}
