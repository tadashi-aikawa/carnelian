import { insertToCursor } from "src/lib/helpers/editors/basic";
import { notify, showInputDialog } from "src/lib/helpers/ui";
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
    const nt = notify("⏳ カードの作成に必要な情報を取得中...");

    const html = await createCard(url);
    insertToCursor(`\n${html}`);

    nt.hide();
  } catch (e: any) {
    notify(e);
  }
}
