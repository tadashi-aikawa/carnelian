import { insertToCursor } from "src/lib/helpers/editors/basic";
import { notify, showFileSearchDialog } from "src/lib/helpers/ui";
import { createNoteCard } from "src/lib/helpers/web";

/**
 * VaultのノートからカードレイアウトのHTML文字列を挿入します
 */
export async function insertNoteCard() {
  const file = await showFileSearchDialog();
  if (!file) {
    return;
  }

  try {
    const nt = notify("⏳ カードの作成に必要な情報を取得中...");

    const html = await createNoteCard(file, {
      defaultImageUrl:
        "https://publish-01.obsidian.md/access/35d05cd1bf5cc500e11cc8ba57daaf88/Notes/attachments/minerva-image.webp",
      faviconUrl:
        "https://publish-01.obsidian.md/access/35d05cd1bf5cc500e11cc8ba57daaf88/favicon-64.png",
    });
    insertToCursor(`\n${html}

%%[[${file.basename}]]%%

`);

    nt.hide();
  } catch (e: any) {
    notify(e);
  }
}
