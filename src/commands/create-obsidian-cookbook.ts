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
 * Obsidian逆引きレシピを追加します
 */
export async function createObsidianCookbook() {
  const today = now(dateTimePropertyFormat);

  const NOTE_BODY = `---
created: ${today}
updated: ${today}
cover: "Notes/attachments/obsidian-recipe.webp"
---
## 概要



## ソリューション

`;

  const title = await showInputDialog({
    message: "タイトルを入力してください",
  });
  if (!title) {
    return;
  }

  const filePath = `📗Obsidian逆引きレシピ/📗${title}.md`;
  if (await exists(filePath)) {
    return notify(`${title} は既に存在します`);
  }

  const f = await createFile(filePath, NOTE_BODY);
  insertToCursor(`- [[${f.basename}]]`);

  if (getActiveFileProperties()?.updated) {
    updateActiveFileProperty("updated", today);
  }

  await openFile(f.path);
}
