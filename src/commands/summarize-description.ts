import type { AIVendor } from "src/definitions/config";
import { type NoteType, findNoteType } from "src/definitions/mkms";
import { resolveAzure, resolveOpenAI } from "src/envs";
import { fetchOpenAIChatCompletion } from "src/lib/helpers/clients/openai";
import { getActiveFile, getActiveFileTitle } from "src/lib/helpers/entries";
import { addActiveFileProperty } from "src/lib/helpers/properties";
import { getActiveFileSectionContents } from "src/lib/helpers/sections";
import {
  notify,
  notifyRuntimeError,
  notifyValidationError,
} from "src/lib/helpers/ui";
import { ExhaustiveError } from "src/lib/utils/errors";
import { match } from "ts-pattern";

/**
 * OpenAI APIで本文を要約し、descriptionプロパティに挿入します
 */
export async function summarizeDescription(options: {
  property?: string;
  vendor?: AIVendor;
}) {
  const { property = "description", vendor } = options;

  if (!vendor) {
    return notifyValidationError(
      "ai.property.summarize.vendorが設定されていません",
    );
  }

  const vendorSecrets = await match(vendor)
    .with({ type: "openai" }, async (v) => {
      const a = await resolveOpenAI(v.apiKeyEnvName);
      return { ...a, apiEndpoint: null };
    })
    .with({ type: "azure" }, async (v) => await resolveAzure(v))
    .exhaustive();
  if (vendorSecrets.error != null) {
    return notifyValidationError(vendorSecrets.error);
  }

  const content = await getActiveFileSectionContents({
    excludeSectionTypes: ["yaml"],
  });
  if (!content) {
    return notifyValidationError("本文が存在しません");
  }

  const noteType = findNoteType(getActiveFile()!);
  if (!noteType) {
    return notifyValidationError("ノートタイプが取得できませんでした");
  }

  const systemMessage = createSystemMessage(noteType);
  if (!systemMessage) {
    return notifyValidationError(`${noteType.name} の ノートは要約できません`);
  }

  const nt = notify("⏳ 本文を要約中...");

  const summary = await fetchOpenAIChatCompletion({
    systemMessage,
    userMessage: `
{ title: ${getActiveFileTitle()}}

${content}`,
    apiKey: vendorSecrets.apiKey,
    // WARN: 型安全ではないが。。。
    azure:
      vendor.type === "azure"
        ? {
            model: vendor.apiModel,
            apiEndpoint: vendorSecrets.apiEndpoint!,
            apiVersion: vendor.apiVersion,
          }
        : undefined,
  });
  nt.hide();
  if (!summary) {
    return notifyRuntimeError("要約の取得に失敗しました");
  }

  notify(
    `価格: ${Math.round(summary.costYen * 100) / 100}円 / 文字数: ${summary.text.length}`,
    3000,
  );
  addActiveFileProperty(property, summary.text);
}

function createSystemMessage(noteType: NoteType): string | null {
  const base = `以下の要件で本文を150文字以下で要約して。

- OGPのdescriptionとして使う文章を想定しているので以下2点を意識して
  - titleに含まれないけど検索されそうなキーワードは優先して入れて
  - ただし、文章として意味が成立するようにして(単語の羅列のみは禁止)
- 本文に記載されていない内容を推測するのは禁止`;

  switch (noteType.name) {
    case "Prime note":
    case "Hub note":
    case "Report note":
    case "My note":
    case "Procedure note":
      return `${base}
- 『で・ある調』にして
`;
    case "Series note":
      return `${base}
- 『です・ます調』にして
`;
    case "Activity note":
      // INFO: 少し特殊なのでbaseは使わない
      return `以下の要件で本文を140文字から160文字で要約して。

- OGPのdescriptionとして使う文章を想定しているので以下2点を意識して
  - titleに含まれないけど検索されそうなキーワードは優先して入れて
  - ただし、文章として意味が成立するようにして(単語の羅列のみは禁止)
  - 読者に向けた宣伝はしないで
    - ex: 『...のような方には有用である』『...のアクティビティ記録である』などは禁止
- 本文に記載されていない内容を推測するのは禁止
- 『で・ある調』にして
  - ただ『...である。』という表現は禁止
  - 動詞は『〇〇した』という表現で
- 結論だけでなく、本文の内容に取り組もうとした経緯があればそれも入れて
- 『環境』セクションの内容は実施環境であり、サポート環境ではない
`;
    case "Troubleshooting note":
      // INFO: 少し特殊なのでbaseは使わない
      return `以下の要件で本文を150文字以下で要約して。

- OGPのdescriptionとして使う文章を想定しているので以下2点を意識して
  - titleに含まれないけど検索されそうなキーワードは優先して入れて
  - ただし、文章として意味が成立するようにして(単語の羅列のみは禁止)
- 本文に記載されていない内容を推測するのは禁止
- 『で・ある調』にして
- 検索されそうなエラーメッセージがあれば優先して入れて
  - エラーメッセージはlangにerrorと指定されたコードブロックに記載されていることが多い
    - たまにlangがconsoleのコードブロックになることもある
    - HTMLの中にあることはほぼない
  - 150文字に収まらなくても250文字くらいまでなら許容
- 要約の優先度は以下の順
  1. 事象の補足
    - 『環境』セクションの内容は再現環境
    - タイトルと重複する説明は不要
  2. 原因
  3. 解決方法
`;
    case "ADR note":
      // INFO: 少し特殊なのでbaseは使わない
      return `以下の要件で本文を150文字以下で要約して。

- OGPのdescriptionとして使う文章を想定しているので以下3点を意識して
  - titleに含まれないけど検索されそうなキーワードは優先して入れて
    - ただし、文章として意味が成立するようにして(単語の羅列のみは禁止)
  - 読者に向けた宣伝はしないで
    - ex: 『...のような方には有用である』『...のアクティビティ記録である』などは禁止
  - 提案内容 -> 結果 -> 理由 が伝わる内容に要約する
- 本文に記載されていない内容を推測するのは禁止
- 『で・ある調』にして
  - ただ『...である。』という表現は禁止
  - 動詞は『〇〇した』という表現で
`;
    case "Article note":
      // INFO: 少し特殊なのでbaseは使わない
      return `以下の要件で本文を140文字から160文字で要約して。

- OGPのdescriptionとして使う文章を想定しているので以下2点を意識して
  - titleに含まれないけど検索されそうなキーワードは優先して入れて
  - ただし、文章として意味が成立するようにして(単語の羅列のみは禁止)
- 本文に記載されていない内容を推測するのは禁止
- ブログ記事に移動してくれそうな文章にして
- 『です・ます調』にして
`;
    case "Weekly report":
      // INFO: Weekly Reportは検索されることを想定しないのでbaseは使わない
      return `以下の要件で本文を140文字から160文字で要約して。

- 本文に記載されていない内容を推測するのは禁止
- 冒頭は必ず『yyyy-mm-ddからyyyy-mm-ddまでのWeekly Reportです。』にして
  - 日付の範囲はタイトルから推測して
  - ex: 『2025年16週 Weekly Report』なら『2025-04-14から2025-04-20までのWeekly Reportです。』
- 文章全体の末尾は必ず『...など。』にして
- 『です・ます調』にして
- 内容はTopics見出しだけにして
  - 体言止めで文字数を節約すること
  - ReadingとNew Notesの内容は不要
`;
    case "Daily note":
    case "Glossary note":
    case "Brain note":
    case "Rule note":
      return null;
    default:
      throw new ExhaustiveError(noteType);
  }
}
