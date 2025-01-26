import { now } from "src/lib/helpers/datetimes";
import { createFile, openFile } from "src/lib/helpers/entries";
import { exists } from "src/lib/helpers/io";
import { addActiveFileProperties } from "src/lib/helpers/properties";
import { notify, showInputDialog } from "src/lib/helpers/ui";

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
    `[[📒Articles]] > [[📒2025 Articles]]

![[${today}.webp|cover-picture]]
`,
  );

  await openFile(f.path);

  addActiveFileProperties({
    created: today,
    updated: today,
    cover: `📘Articles/attachments/${today}.webp`,
    publish: false,
  });
}
