import { now } from "src/lib/helpers/datetimes";
import { insertToCursor } from "src/lib/helpers/editors/basic";
import { createFile, openFile } from "src/lib/helpers/entries";
import { exists } from "src/lib/helpers/io";
import { notify, showInputDialog } from "src/lib/helpers/ui";

/**
 * [Prime note]を作成し、カーソル配下にリンクを挿入します
 *
 * [Prime note]: (https://minerva.mamansoft.net/Notes/Prime%20note)
 */
export async function createPrimeNote() {
  const today = now("YYYY-MM-DD");

  const NOTE_BODY = `
---
created: ${today}
updated: ${today}
cover: Notes/attachments/prime.webp
---

`.trim();

  const inputTitle = await showInputDialog({
    message: "ノートタイトルを入力してください",
    placeholder: "Obsidianを使ってみる",
  });
  if (!inputTitle) {
    return;
  }

  const title = `📕 ${inputTitle}`;
  const path = `Notes/${title}.md`;
  if (await exists(path)) {
    return notify(`${path} は既に存在します`);
  }

  insertToCursor(`[[${title}]]`);
  const f = await createFile(path, NOTE_BODY);
  await openFile(f.path);
}
