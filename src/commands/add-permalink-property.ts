import { findNoteType } from "src/definitions/mkms";
import { fetchOpenAIChatCompletion } from "src/lib/helpers/clients/openai";
import { getActiveFile, getActiveFileTitle } from "src/lib/helpers/entries";
import {
  addActiveFileProperty,
  getActiveFileProperties,
} from "src/lib/helpers/properties";
import {
  notify,
  notifyRuntimeError,
  notifyValidationError,
} from "src/lib/helpers/ui";
import type { PluginSettings } from "src/settings";

/**
 * パーマネントリンクプロパティを追加します
 *
 * - Article noteの場合はタイトルから作成
 * - それ以外はADRとして
 */
export async function addPermalinkProperty(settings: PluginSettings) {
  const file = getActiveFile();
  if (!file) {
    return notifyValidationError("No active file found");
  }

  const noteType = findNoteType(file);
  if (!noteType) {
    return notifyValidationError("ノートタイプが取得できませんでした");
  }
  if (noteType?.name === "Article note") {
    const permalink = await createArticlePermalink(settings.openAPIKey);
    if (permalink) {
      addActiveFileProperty("permalink", permalink);
    }
    return;
  }

  const permalink = file.basename.toLowerCase().split(" ")[0].slice(2);
  addActiveFileProperty("permalink", permalink);
}

async function createArticlePermalink(
  openAPIKey: string,
): Promise<string | null> {
  const properties = getActiveFileProperties();
  if (!properties) {
    notifyValidationError("ファイルのプロパティが取得できませんでした");
    return null;
  }

  const created = properties.created;
  if (!created) {
    notifyValidationError("ファイルのcreatedプロパティが取得できませんでした");
    return null;
  }

  const nt = notify("⏳ permalinkを作成中...");

  const summary = await fetchOpenAIChatCompletion({
    systemMessage: `ページのタイトルを渡します。それを元にパーマリンクを作成してください。

- パーセントエンコードは禁止
- 重要と思われる語句(日本語の場合は英語に訳したもの)を含めてハイフンでつなげる
- あまり長くなりすぎないように
- 結果だけ返して. 解説などは一切不要
  - 例: "2023年のMKMSの振り返り" -> "mkms-2023-review"
    `,
    userMessage: getActiveFileTitle()!,
    apiKey: openAPIKey,
  });
  nt.hide();
  if (!summary) {
    notifyRuntimeError("パーマリンクの作成に失敗しました");
    return null;
  }

  notify(
    `価格: ${Math.round(summary.costYen * 100) / 100}円 / 文字数: ${summary.text.length}`,
    3000,
  );

  return `${created}-${summary.text}`;
}
