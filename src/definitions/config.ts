/**
 * data.jsonの設定ファイルを定義するインターフェース
 * JSON Schemaを生成するためにも使用される
 */
export interface Config {
  /**
   * エディタ本文の機能
   */
  editor?: {
    /** 装飾 */
    decoration?: {
      strip?: boolean;
    };

    /** 切り替え */
    toggle?: {
      /** エディタの長さ(横幅) */
      length?: boolean;
      /** Live Previewの切り替え */
      livePreview?: boolean;
    };

    /** テーブル */
    table?: {
      format?: boolean;
    };

    /** MOC */
    moc?: {
      fix?: boolean;
      insert?: boolean;
      suitably?: boolean;
    };

    /** リンク */
    link?: {
      fix?: boolean;
      /** クリップボードのURLから貼り付け */
      paste?: boolean;
    };

    /** プロパティ */
    property?: {
      /** カーソル行の内容からよしなに追加 */
      suitably?: boolean;
      /** created/updatedの更新 */
      changeLog?: boolean;

      /** urlプロパティ */
      url?: {
        copy?: boolean;
        open?: boolean;
      };
    };

    /** カード */
    card?: {
      /** v1カードをv2に変換 */
      fix?: boolean;
      /** 外部サイト */
      site?: {
        /** クリップボードのURLから貼り付け */
        paste?: boolean;
      };
      /** Vault内のノート */
      note?: {
        /** Vault内のノートから挿入 */
        insert?: boolean;
      };
    };

    /**
     * 画像関連
     */
    image?: {
      /** Webpに変換 */
      webp?: {
        paste?: boolean;
      };
      /** AVIFに変換 */
      avif?: {
        paste?: boolean;
      };
    };

    /** Weekly Report に対する機能 */
    weeklyNote?: {
      /** 新しく作成したノートの挿入 */
      newNotes?: boolean;
      /** BlueSkyで投稿したポストの挿入 */
      blueskyPosts?: boolean;
    };
  };

  /**
   * 外部連携
   */
  external?: {
    /** ターミナルで開く */
    terminal?: boolean;
  };

  /**
   * リンターに関する機能
   */
  linter?: boolean;

  /**
   * ファイル作成/削除に関する機能
   */
  file?: {
    /** 作成 */
    create?: {
      article?: boolean;
      activity?: boolean;
      brain?: boolean;
      hub?: boolean;
      mtg?: boolean;
      obsidianCookbook?: boolean;
      prime?: boolean;
      report?: boolean;
      tdq?: boolean;
      troubleShooting?: boolean;

      /** ADR関連 */
      adr?: {
        min?: boolean;
        vim?: boolean;
        pro?: boolean;
        obs?: boolean;
      };
    };

    /** 削除 */
    delete?: {
      oldDailyNotes?: boolean;
    };

    /** ファイルの情報をコピー */
    copy?: {
      /** 現在ファイルのパスをクリップボードにコピー */
      fullPath?: boolean;
      /** 現在画像ファイルをクリップボードにコピー */
      image?: boolean;
      /** 現在ファイルのMinerva URLをクリップボードにコピー */
      minervaUrl?: boolean;
    };

    /** ファイル情報の表示 */
    show?: {
      info?: boolean;
    };
  };

  /**
   * AIに関係する機能
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
   * Confluenceに関係する機能
   */
  confluence?: {
    /**
     * Confluenceのドメイン
     * 例: `example.atlassian.net`
     */
    domain?: `${string}.atlassian.net`;
  };

  /**
   * Slackに関係する機能
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
