import { getParagraphAtLineNo } from "src/lib/helpers/editors/advanced";
import {
  getActiveLineNo,
  setLinesInRange,
} from "src/lib/helpers/editors/basic";
import { getFileByPath } from "src/lib/helpers/entries";
import { linkText2Path } from "src/lib/helpers/links";
import {
  notify,
  notifyRuntimeError,
  notifyValidationError,
} from "src/lib/helpers/ui";
import { createCard, createNoteCard } from "src/lib/helpers/web";
import { doSinglePatternCaptureMatching, isUrl } from "src/lib/utils/strings";

/**
 * カーソルより1行下のOGPカード情報をv2形式で上書きします。
 * 既にv2形式の場合も情報は最新化されます。
 */
export async function transformToV2OGPCard() {
  const activeLineNo = getActiveLineNo();
  if (!activeLineNo) {
    notifyValidationError("現在行が取得できません");
    return;
  }

  const p = getParagraphAtLineNo(activeLineNo + 1);
  if (!p) {
    notifyValidationError("段落が空です");
    return;
  }

  if (
    !p.text.includes('<div class="link-card">') &&
    !p.text.includes('<div class="link-card-v2">')
  ) {
    notifyValidationError("段落はOGP Cardではありません");
    return;
  }

  const isInternalLink = p.text.includes('class="internal-link"');
  const html = isInternalLink
    ? await transformAsNote(p.text)
    : await transformAsSite(p.text);
  if (!html) {
    return;
  }

  setLinesInRange(p.startLine, p.endLine, html);
}

async function transformAsSite(text: string): Promise<string | null> {
  const url = doSinglePatternCaptureMatching(
    text,
    /<a href="([^"]+)"><\/a>/g,
  ).at(0);
  if (!url) {
    notifyValidationError("パターンが一致せずURLを抽出できません");
    return null;
  }

  if (!isUrl(url)) {
    notifyValidationError(`抽出した文字列がURLではありません: ${url}`);
    return null;
  }

  const nt = notify("⏳ カードの作成に必要な情報を取得中...");
  try {
    const html = await createCard(url);
    return html;
  } catch (e: any) {
    notifyRuntimeError(e);
    return null;
  } finally {
    nt.hide();
  }
}

async function transformAsNote(text: string): Promise<string | null> {
  const linkText = doSinglePatternCaptureMatching(
    text,
    /data-href="([^"]+)"/g,
  ).at(0);
  if (!linkText) {
    notifyValidationError("パターンが一致せずノートのパスを抽出できません");
    return null;
  }

  const path = linkText2Path(linkText);
  if (!path) {
    notifyValidationError(
      `リンクテキストからpathを取得できませんでした: ${linkText}`,
    );
    return null;
  }

  const file = getFileByPath(path);
  if (!file) {
    notifyValidationError(`パスに該当するファイルが存在しません: ${path}`);
    return null;
  }

  const nt = notify("⏳ カードの作成に必要な情報を取得中...");
  try {
    // TODO: insert-note-card.tsと重複している...
    const html = await createNoteCard(file, {
      defaultImageUrl:
        "https://publish-01.obsidian.md/access/35d05cd1bf5cc500e11cc8ba57daaf88/Notes/attachments/minerva-image.webp",
      faviconUrl:
        "https://publish-01.obsidian.md/access/35d05cd1bf5cc500e11cc8ba57daaf88/favicon-64.png",
      siteName: "Minerva",
    });
    return html;
  } catch (e: any) {
    notifyRuntimeError(e);
    return null;
  } finally {
    nt.hide();
  }
}
