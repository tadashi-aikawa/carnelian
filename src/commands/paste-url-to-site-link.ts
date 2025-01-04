import { insertToCursor } from "src/lib/helpers/editors/basic";
import { getClipboardText, notify } from "src/lib/helpers/ui";
import { createMeta } from "src/lib/helpers/web";
import { isUrl } from "src/lib/utils/strings";

/**
 * クリップボードのURLをサイトのリンク(OGPを利用したリンク)に変換して貼り付けます
 */
export async function pasteURLToSiteLink() {
  const url = await getClipboardText({ trim: true });
  if (!url) {
    return;
  }
  if (!isUrl(url)) {
    return notify(`クリップボードのテキストはURLではありません. ${url}`, 3000);
  }

  try {
    const nt = notify("⏳ リンクの作成に必要な情報を取得中...");

    const meta = await createMeta(url);
    if (!meta) {
      return notify(`メタデータを取得できませんでした. url=${url}`);
    }
    if (meta.type !== "html") {
      return notify(
        `HTMLを取得できないURLからはリンクを生成できません. url=${url}`,
      );
    }

    const linkText = `[${meta.title}](${url})`;
    insertToCursor(linkText);

    nt.hide();
  } catch (e: any) {
    notify(e);
  }
}
