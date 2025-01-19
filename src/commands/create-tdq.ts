import { now } from "src/lib/helpers/datetimes";
import { insertToCursor } from "src/lib/helpers/editors/basic";
import {
  createFile,
  getMarkdownFiles,
  openFile,
} from "src/lib/helpers/entries";
import { exists } from "src/lib/helpers/io";
import { notify, showInputDialog } from "src/lib/helpers/ui";
import { sorter } from "src/lib/utils/collections";

/**
 * TDQを作成し、カーソル配下にリンクを挿入します
 */
export async function createTDQ() {
  const today = now("YYYY-MM-DD");

  const NOTE_BODY = `
---
created: ${today}
updated: ${today}
cover: 📗TDQ/attachments/tdq.webp
---

\`\`\`
---

*NEXT*  >> <前回ノートの最後にここのリンクを張る>
\`\`\`

<説明文>

## Lesson

<必要な事前知識を記載(任意)>

## Mission 1

#🙂NORMAL 

<ここに問題文>

%%
回答例

\`\`\`js
// TODO:
\`\`\`
%%

> [!hint]- Hint 1
> <ヒントの内容>

`.trim();

  const prefix = "📗TDQ";
  const maxNumber = Number(
    getMarkdownFiles()
      .filter((x) => x.name.startsWith(`${prefix}-`))
      .sort(sorter((x) => x.name))
      .pop()
      ?.name.split(" ")[0]
      .replace(`${prefix}-`, "") ?? -1,
  );

  const newNumber = String(maxNumber + 1).padStart(3, "0");
  const inputTitle = await showInputDialog({
    message: `[${prefix}-${newNumber}] タイトルを入力してください`,
  });
  if (!inputTitle) {
    return;
  }

  const title = `${prefix}-${newNumber} ${inputTitle}`;

  const filePath = `📗TDQ/${title}.md`;
  if (await exists(filePath)) {
    return notify(`${filePath} は既に存在します`);
  }

  insertToCursor(`[[${title}]]`);
  const f = await createFile(filePath, NOTE_BODY);
  await openFile(f.path);
}
