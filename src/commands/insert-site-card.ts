import { insertToCursor } from "src/lib/helpers/editors/basic";
import { showInputDialog, notify } from "src/lib/helpers/ui";
import { createCard } from "src/lib/helpers/web";

/**
 * サイトからカードレイアウトのHTML文字列を挿入します
 */
export async function insertSiteCard() {
  const url = await showInputDialog({ message: "URLを入力してください" });
  if (!url) {
    return;
  }

  try {
    const html = await createCard(url);
    insertToCursor(html);
  } catch (e: any) {
    notify(e);
  }
}
