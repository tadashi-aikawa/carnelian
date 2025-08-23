/**
 * data.jsonの設定ファイルを定義するインターフェース
 * JSON Schemaを生成するためもに使用される
 */
export interface Config {
  /**
   * AIに関係する機能の設定
   */
  ai?: {
    /** プロパティに関する機能 */
    property?: {
      /** 要約 */
      summarize?: {
        /** 要約を保存するプロパティ名 (default: description) */
        property?: string;
        /** 利用するAIベンダー情報 */
        vendor: AIVendor;
      };
      /** パーマリンク */
      permalink?: {
        /** 利用するAIベンダー */
        vendor: AIVendor;
      };
    };
  };

  /**
   * Confluenceに関係する機能の設定
   */
  confluence?: {
    /**
     * Confluenceのドメイン
     * 例: `example.atlassian.net`
     */
    domain?: `${string}.atlassian.net`;
  };

  /**
   * Slackに関係する機能の設定
   */
  slack?: {
    /** Slackのメッセージ形式に変換してクリップボードにコピーする */
    copy: {
      /** Slackのメッセージを置換するためのマッピング */
      replaceMapping?: { [before: string]: string };
    };
  };

  /**
   * コマンド履歴の保存先パス
   * デフォルトはプラグインフォルダ内の `command-histories.json`
   * FIXME: 多分プラグインに分離するのでこのままにする
   */
  commandHistoryPath: string;
}

type AIVendor =
  | {
      type: "openai";
      /** OpenAI APIキー */
      apiKey: string;
    }
  | {
      type: "azure";
      /** Azure OpenAIのAPIキー */
      apiKey: string;
      /** Azure OpenAIのエンドポイント */
      apiEndpoint: string;
      /** Azure OpenAIのAPIバージョン */
      apiVersion: string;
      /** Azure OpenAIのモデル名 */
      apiModel: string;
    };
