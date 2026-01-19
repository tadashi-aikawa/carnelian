import { getNoteType } from "src/definitions/mkms";
import { now } from "src/lib/helpers/datetimes";
import { insertToCursor } from "src/lib/helpers/editors/basic";
import { createFile, openFile } from "src/lib/helpers/entries";
import { exists } from "src/lib/helpers/io";
import {
  getActiveFileProperties,
  updateActiveFileProperty,
} from "src/lib/helpers/properties";
import { notify, showInputDialog } from "src/lib/helpers/ui";
import { dateTimePropertyFormat } from "src/lib/utils/dates";

/**
 * [Hub note]を作成し、カーソル配下にリンクを挿入します
 *
 * [Hub note]: (https://minerva.mamansoft.net/Notes/Hub%20note)
 */
export async function createHubNote() {
  const today = now(dateTimePropertyFormat);
  const nt = getNoteType("Hub note");

  const NOTE_BODY = `
---
created: ${today}
updated: ${today}
cover: ${nt.coverImagePath}
---

`.trim();

  const inputTitle = await showInputDialog({
    message: "ノートタイトルを入力してください",
    placeholder: "Obsidianを使ってみる",
  });
  if (!inputTitle) {
    return;
  }

  const title = `${nt.prefixEmoji}${inputTitle}`;
  const path = `Notes/${title}.md`;
  if (await exists(path)) {
    return notify(`${path} は既に存在します`);
  }

  insertToCursor(`[[${title}]]`);

  if (getActiveFileProperties()?.updated) {
    updateActiveFileProperty("updated", today);
  }

  const f = await createFile(path, NOTE_BODY);
  await openFile(f.path);
}
