import { now } from "src/lib/helpers/datetimes";
import { exists, createFile, openFile } from "src/lib/helpers/entries";
import { addActiveFileProperties } from "src/lib/helpers/properties";
import { showInputDialog, notify } from "src/lib/helpers/ui";

/**
 * Articleを作成します
 */
export async function createArticle() {
  const title = await showInputDialog({
    message: "Articleのタイトルを入力してください",
  });
  if (title == null) {
    return;
  }
  if (title === "") {
    return notify("タイトルは必須です");
  }

  const fp = `📘Articles/📘${title}.md`;
  if (await exists(fp)) {
    return notify(`${fp} はすでに存在しています`);
  }

  const today = now("YYYY-MM-DD");
  const f = await createFile(
    fp,
    `[[📒Articles]] > [[📒2023 Articles]]

![[${today}.jpg|cover-picture]]
`,
  );

  await openFile(f.path);

  addActiveFileProperties({
    created: today,
    updated: today,
    description: "TODO",
    cover: `📘Articles/attachments/${today}.jpg`,
  });
}
