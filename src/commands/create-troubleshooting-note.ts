import { now } from "src/lib/helpers/datetimes";
import { insertToCursor } from "src/lib/helpers/editors/basic";
import { createFile, openFile } from "src/lib/helpers/entries";
import { exists } from "src/lib/helpers/io";
import { notify, showInputDialog } from "src/lib/helpers/ui";

/**
 * [Troubleshooting note]を作成し、カーソル配下にリンクを挿入します
 *
 * [Troubleshooting note]: (https://minerva.mamansoft.net/Notes%2FTroubleshooting%20note)
 */
export async function createTroubleshootingNote() {
  const today = now("YYYY-MM-DD");

  const NOTE_BODY = `
---
created: ${today}
updated: ${today}
cover: Notes/attachments/troubleshooting.webp
status:
  - ❌未解決
---
## 事象



## 原因

## 解決方法

## 参考

- マークダウンリンク
`.trim();

  const inputTitle = await showInputDialog({
    message: "タイトルを入力してください",
  });
  if (!inputTitle) {
    return;
  }

  const title = `📝${inputTitle}`;
  const path = `Notes/${title}.md`;
  if (await exists(path)) {
    return notify(`${path} は既に存在します`);
  }

  insertToCursor(`[[${title}]]`);
  const f = await createFile(path, NOTE_BODY);
  await openFile(f.path);
}
