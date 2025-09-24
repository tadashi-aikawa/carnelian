/**
 * data.jsonの設定ファイルを定義するインターフェース
 * JSON Schemaを生成するためにも使用される
 *
 * INFO: ここではrequiredになっていても、設定ミスでnullishな値は入る可能性があるので、処理するときは例外処理が必要
 */
export interface Config {
  all?: {
    // Appearance
    /** 『Toggle Live Preview/Source mode』との違いは全エディタが対象になること */
    "Toggle Live preview"?: boolean;

    // Notes(MKMS)
    "Create an Article"?: boolean;

    // Notes(not MKMS)
    "Create MIN ADR"?: boolean;
    "Create VIM ADR"?: boolean;
    "Create PRO ADR"?: boolean;
    "Create OBS ADR"?: boolean;

    // Others
    "Clean old daily notes"?: boolean;

    // External
    "Open active folder in terminal"?: boolean;
    "Open vault in terminal"?: boolean;
  };

  file?: {
    "Copy active file full path"?: boolean;
    "Copy active image file to clipboard"?: boolean;
    "Show File info"?: boolean;
  };

  /** Linterを有効にするかどうか */
  linter?: boolean;

  editor?: {
    // Notes(MKMS)
    "Create Prime note"?: boolean;
    "Create Activity note"?: boolean;
    "Create Hub note"?: boolean;
    "Create Report note"?: boolean;
    "Create Brain note"?: boolean;
    "Create Trouble Shooting note"?: boolean;

    // Notes(Not MKMS)
    "Create Obsidian逆引きレシピ"?: boolean;
    "Create TDQ"?: boolean;
    "Create MTG note"?: boolean;

    // Images
    "Paste clipboard as WebP"?: boolean;
    "Paste clipboard as AVIF"?: {
      /** AVIFの品質 (default: 35) */
      quality?: number;
    };

    // Copy
    "Copy as Confluence"?: {
      /**
       * Confluenceのドメイン
       * 例: `example.atlassian.net`
       */
      domain: `${string}.atlassian.net`;
    };
    "Copy as Slack"?: {
      /** Slackのメッセージを置換するための正規表現マッピング */
      replaceRegExpMapping?: { [before: string]: string };
    };
    "Copy Minerva URL"?: boolean;
    "Copy url property"?: boolean;

    "Summarize description"?: {
      /** 要約を保存するプロパティ名 (default: description) */
      property?: string;
      /** 利用するAIベンダー情報 */
      vendor: AIVendor;
    };

    // Linter
    "Fix link"?: boolean;
    "Move to next inspection"?: boolean;
    "Move to previous inspection"?: boolean;

    // Weekly Report
    "Insert new notes to the weekly note"?: boolean;
    "Insert Bluesky posts to weekly note"?: boolean;

    // Link/Card
    "Paste site card"?: boolean;
    "Insert note card"?: boolean;
    "Transform to v2 OGP card"?: boolean;
    "Paste URL to site link"?: boolean;

    // MOC
    "Insert MOC"?: boolean;
    "Transform MOC"?: boolean;
    "Update MOC suitably"?: boolean;

    // Property
    "Add property suitably"?: boolean;
    "Add permalink property"?: {
      /** 利用するAIベンダー情報 */
      vendor: AIVendor & { type: "openai" };
    };
    "Update change log"?: boolean;

    // Format
    "Format table"?: boolean;
    "Strip links and decorations"?: boolean;

    // External
    "Open property URL"?: boolean;
  };

  /**
   * コマンド履歴の保存先パス
   * デフォルトはプラグインフォルダ内の `command-histories.json`
   * FIXME: 多分プラグインに分離するのでこのままにする
   */
  commandHistoryPath: string;
}

type KeyChainAccountName = string;

export type OpenAIVendor = {
  type: "openai";
  /** OpenAI APIキーを格納するKeychainのアカウント名 */
  apiKeyEnvName: KeyChainAccountName;
};

type AzureVendor = {
  type: "azure";
  /** Azure OpenAIのApiKeyを格納するKeychainのアカウント名 */
  apiKeyEnvName: KeyChainAccountName;
  /** Azure OpenAIのエンドポイントを格納するKeychainのアカウント名 */
  apiEndpointEnvName: KeyChainAccountName;
  /** Azure OpenAIのAPIバージョン */
  apiVersion: string;
  /** Azure OpenAIのモデル名 */
  apiModel: string;
};

export type AIVendor = OpenAIVendor | AzureVendor;
