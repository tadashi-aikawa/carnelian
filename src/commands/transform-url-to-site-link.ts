import {
  getSelectionText,
  replaceSelection,
} from "src/lib/helpers/editors/basic";
import { notify } from "src/lib/helpers/ui";
import { createMeta } from "src/lib/helpers/web";
import { isUrl } from "src/lib/utils/strings";

/**
 * 選択したURLをサイトのリンク(OGPを利用したリンク)に変換します
 */
export async function transformURLToSiteLink() {
  const url = getSelectionText();
  if (!url) {
    return;
  }
  if (!isUrl(url)) {
    return notify(`選択中のテキストはURLではありません. ${url}`);
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
    replaceSelection(linkText);

    nt.hide();
  } catch (e: any) {
    notify(e);
  }
}
