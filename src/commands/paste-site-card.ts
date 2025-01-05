import { insertToCursor } from "src/lib/helpers/editors/basic";
import { getClipboardText, notify } from "src/lib/helpers/ui";
import { createCard } from "src/lib/helpers/web";
import { isUrl } from "src/lib/utils/strings";

/**
 * クリップボードのURLからカードレイアウトのHTML文字列を挿入します
 */
export async function pasteSiteCard() {
  const url = await getClipboardText({ trim: true });
  if (!url) {
    return;
  }
  if (!isUrl(url)) {
    return notify(`クリップボードのテキストはURLではありません. ${url}`, 3000);
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
