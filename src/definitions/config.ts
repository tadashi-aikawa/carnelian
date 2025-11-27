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
    "Open vault in lazygit"?: boolean;
    "Open active file in yazi"?: boolean;

    // Workspaces
    "Move to next workspace"?: boolean;

    // Tab groups
    "Create new note horizontally"?: boolean;
    "Create new note vertically"?: boolean;
  };

  file?: {
    "Copy active file full path"?: boolean;
    "Copy active image file to clipboard"?: boolean;
    "Show File info"?: boolean;
    "Delete active file"?: boolean;
  };

  click?: {
    "Open link vertically"?: boolean;
  };

  formatter?: {
    /**
     * 変換を無視するファイルパスのglobパターン配列
     * default: []
     * ex: ["Templates/**", "Notes/Untitled.md"]
     */
    ignoreFiles?: string[];
    /** プロパティの並び順を指定する配列 (default: ["title", "created", "updated"]) */
    propertyOrder?: string[];
    /** 空のプロパティを削除するかどうか (default: true) */
    removeIfEmpty?: boolean;
  };

  linter?: {
    rules?: {
      propery?: {
        /** descriptionプロパティが必須のノートで未設定を検出する */
        "No description"?: boolean;
        /** ノート種別に応じてcoverを自動付与・必須チェックする */
        "No cover"?: boolean;
        /** urlプロパティが必要なノートで未設定を検出する */
        "No url"?: boolean;
        /** statusの未設定を検出し、必要に応じて既定値を割り当てる */
        "No status"?: boolean;
        /** タイトルやパスに応じて所定のタグ付与/削除を行う */
        Tags?: boolean;
        /** MkDocs向けのtitleプロパティをファイル名と同期させる */
        "MkDocs title"?: boolean;
        /** 本文の!FIXMEや==強調とfixmeプロパティの状態を同期させる */
        "Sync fixme"?: boolean;
      };
      content?: {
        /** リンクカードの利用を禁止しているノート種別で検出する */
        "Disallowed link card"?: boolean;
        /** リンクカードに対応するリンクコメントの欠如を検出する */
        "No link comment"?: boolean;
        /** 旧形式(v1)のリンクカード使用を警告する */
        "v1 link card"?: boolean;
        /** 最新仕様に従っていないMOCセクションを検出する */
        "Unofficial MOC format"?: boolean;
        /** 旧形式の投稿日/更新日ブロックを検出し、created/updatedを付与する */
        "v1 dates format"?: boolean;
        /** 未解決の内部リンクを検出する */
        "Unresolved internal link"?: boolean;
        /** 末尾に括弧を含む内部リンクを検出する（必要に応じ箇条書きを除外） */
        "Link ends with parenthesis"?: boolean;
      };
    };
  };

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

    /** エディタの本文にフォーカスを移す */
    "Focus editor content"?: boolean;

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
    "Copy Strip links and decorations"?: boolean;

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

    // Wrapper
    "Cycle bullet/checkbox"?: boolean;

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
    "Open as local MkDocs site"?: {
      /**
       * ex: http://localhost:8081 (default: http://localhost:8000)
       */
      baseUrl?: string;
      /**
       * ex: notes (default: docs)
       */
      docsRootPath?: string;
    };
    "Open as remote MkDocs site"?: {
      /**
       * ex: http://your-mkdocs-domain
       */
      baseUrl: string;
      /**
       * ex: notes (default: docs)
       */
      docsRootPath?: string;
    };

    // 保存
    "Save with"?: boolean;
  };
}

export type EditorConfig = NonNullable<Config["editor"]>;

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
