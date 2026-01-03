/**
 * Carnelianプラグインの設定ファイルを定義するインターフェース
 * JSON Schemaを生成するためにも使用される
 *
 * INFO: ここではrequiredになっていても、設定ミスでnullishな値は入る可能性があるので、処理するときは例外処理が必要
 *
 * ## 依存関係
 * - ImageMagick: 画像変換コマンド用（Homebrew経由でインストール）
 * - OpenAI API: AI機能用（設定でAPIキーが必要）
 * - インターネット接続: OGPメタデータ取得用
 * - Bluesky API: ソーシャルメディア統合用
 *
 * ## モバイル互換性
 * 一部コマンドはiOS/Androidで動作しない可能性があります
 */
export interface Config {
  /** グローバルコマンド（ファイルを開いていなくても実行可能） */
  all?: {
    // ── Appearance ──────────────────────────────────────────
    /** ライブプレビュー/ソースモード切替。全エディタが対象 */
    "Toggle Live preview"?: boolean;

    // ── Notes(MKMS) ────────────────────────────────────────
    /** 📘 Articlesディレクトリに記事を作成。カバー画像とプロパティを自動設定 */
    "Create an Article"?: boolean;

    // ── Notes(ADR) ─────────────────────────────────────────
    /** Minerva用ADRを作成。自動採番とADRリスト更新 */
    "Create MIN ADR"?: boolean;
    /** Vim用ADRを作成。経緯・提案内容・メリット/デメリットのセクション付き */
    "Create VIM ADR"?: boolean;
    /** PRO用ADRを作成 */
    "Create PRO ADR"?: boolean;
    /** Obsidian用ADRを作成 */
    "Create OBS ADR"?: boolean;

    // ── Others ─────────────────────────────────────────────
    /** 指定期間のDaily Noteから特定セクションを集約してクリップボードにコピー */
    "Copy daily note section in range"?: {
      /** 対象セクション名 (H2) */
      sectionName: string;
    };
    /** 14日前より古いデイリーノートを別ディレクトリに移動（要Obsidian再起動でキャッシュ更新） */
    "Clean old daily notes"?: boolean;

    // ── External ───────────────────────────────────────────
    /** 現在のディレクトリをターミナルで開く（Ghostty必須） */
    "Open active folder in terminal"?: boolean;
    /** 現在のVaultをターミナルで開く（Ghostty必須） */
    "Open vault in terminal"?: boolean;
    /** 現在のVaultをLazygitで開く（Ghostty必須） */
    "Open vault in lazygit"?: boolean;
    /** 現在のVaultをyaziで開く（yazi, Ghostty, zsh必須） */
    "Open active file in yazi"?: boolean;

    // ── Workspaces ─────────────────────────────────────────
    /** 次のワークスペースに移動 */
    "Move to next workspace"?: boolean;

    // ── Tab groups ─────────────────────────────────────────
    /** 水平方向に新しいノートを作成 */
    "Create new note horizontally"?: boolean;
    /** 垂直方向に新しいノートを作成 */
    "Create new note vertically"?: boolean;

    /** 前処理を行いObsidian Publishに公開する */
    Publish?: {
      /** 更新履歴のノートパス (ex: 更新履歴.md) */
      changelogNotePath?: string;
      /**
       * 更新ファイルに含めないファイルパスのglobパターン配列
       * default: []
       * ex: ["Templates/**", "Notes/Untitled.md"]
       */
      ignoreFiles?: string[];
    };
  };

  /** ファイルを開いているときに実行可能なコマンド */
  file?: {
    /** 現在のファイルのフルシステムパスをクリップボードにコピー */
    "Copy active file full path"?: boolean;
    /** 現在の画像ファイルをクリップボードにコピー */
    "Copy active image file to clipboard"?: boolean;
    /** 現在のファイルの詳細情報を表示 */
    "Show File info"?: boolean;
    /** 現在のファイルを複製して新しいタブで開く */
    "Duplicate active file"?: boolean;
    /** 現在のファイルを複製して下方向に開く */
    "Duplicate active file horizontally"?: boolean;
    /** 現在のファイルを複製して右方向に開く */
    "Duplicate active file vertically"?: boolean;
    /** 現在のファイルを削除（バックリンクが存在する場合はエラー） */
    "Delete active file"?: boolean;
  };

  /** クリックイベントに関連するコマンド */
  click?: {
    /** 修飾キーを押しながら左クリックしたときに垂直分割で開くサービス */
    "Open link vertically"?: boolean;
  };

  /** 保存時のフォーマッター設定 */
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

  /** リンター設定 */
  linter?: {
    rules?: {
      /** プロパティに関するルール */
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
        "Inconsistent fixme"?: boolean;
        /** descriptionプロパティと本文の内容を比較し、不一致を検出する */
        "Inconsistent description"?: {
          ignoreFiles?: string[];
        };
      };
      /** コンテンツに関するルール */
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
        /** 本文のFIXME記述を禁止する */
        "Disallow fixme"?: boolean;
      };
    };
  };

  /** エディタコンテキストで実行可能なコマンド */
  editor?: {
    // ── Notes(MKMS) ────────────────────────────────────────
    /** 📕 Prime noteを作成し、カーソル位置にリンク挿入 */
    "Create Prime note"?: boolean;
    /** 📜 Activity noteを作成し、カーソル位置にリンク挿入 */
    "Create Activity note"?: boolean;
    /** 📒 Hub noteを作成し、カーソル位置にリンク挿入 */
    "Create Hub note"?: boolean;
    /** 📰 Report noteを作成し、カーソル位置にリンク挿入 */
    "Create Report note"?: boolean;
    /** 🧠 Brain noteを作成し、カーソル位置にリンク挿入 */
    "Create Brain note"?: boolean;
    /** 📝 Troubleshooting noteを作成し、カーソル位置にリンク挿入 */
    "Create Trouble Shooting note"?: boolean;

    // ── Notes(Not MKMS) ────────────────────────────────────
    /** 📗 Obsidian逆引きレシピを作成 */
    "Create Obsidian逆引きレシピ"?: boolean;
    /** TDQを作成し、カーソル位置にリンク挿入（自動採番） */
    "Create TDQ"?: boolean;
    /** 📅 MTG用ノートを作成し、カーソル位置にリンク挿入 */
    "Create MTG note"?: boolean;

    // ── Images ─────────────────────────────────────────────
    /** クリップボード画像をWebP変換して保存・挿入（ImageMagick必須） */
    "Paste clipboard as WebP"?: {
      /** 最大幅 (超えている場合は自動で縮小する) */
      maxWidth?: number;
    };
    /** クリップボード画像をAVIF変換して保存・挿入（ImageMagick必須） */
    "Paste clipboard as AVIF"?: {
      /** AVIFの品質 (default: 35) */
      quality?: number;
      /** 最大幅 (超えている場合は自動で縮小する) */
      maxWidth?: number;
    };

    /** エディタの本文にフォーカスを移す */
    "Focus editor content"?: boolean;

    // ── Copy ───────────────────────────────────────────────
    /** 現在の内容をConfluence記法に変換してコピー */
    "Copy as Confluence"?: {
      /**
       * Confluenceのドメイン
       * 例: `example.atlassian.net`
       */
      domain: `${string}.atlassian.net`;
    };
    /** 現在の内容をSlack記法に変換してコピー */
    "Copy as Slack"?: {
      /** Slackのメッセージを置換するための正規表現マッピング */
      replaceRegExpMapping?: { [before: string]: string };
    };
    /** 現在ファイルのObsidian Publish URLを生成してコピー */
    "Copy Minerva URL"?: boolean;
    /** 現在ファイルのurlプロパティ値をコピー */
    "Copy url property"?: boolean;
    /** 選択テキストからリンクや装飾を除去してコピー（モバイル非対応） */
    "Copy Strip links and decorations"?: boolean;

    /** OpenAI APIで150文字の説明を生成しdescriptionプロパティに設定 */
    "Summarize description"?: {
      /** 要約を保存するプロパティ名 (default: description) */
      property?: string;
      /** 利用するAIベンダー情報 */
      vendor: AIVendor;
    };

    // ── Linter ─────────────────────────────────────────────
    /** [[title (alias)]]を[[title (alias)|title]]形式に修正 */
    "Fix link"?: boolean;
    /** 現在ファイルの次のリンティング問題に移動 */
    "Move to next inspection"?: boolean;
    /** 現在ファイルの前のリンティング問題に移動 */
    "Move to previous inspection"?: boolean;

    // ── Weekly Report ──────────────────────────────────────
    /** 週の期間内に作成されたパブリックノートのリストを挿入 */
    "Insert new notes to the weekly note"?: boolean;
    /** 指定週のBlueskyポストをカード形式で挿入（外部URL付きのみ） */
    "Insert Bluesky posts to weekly note"?: boolean;

    // ── Link/Card ──────────────────────────────────────────
    /** クリップボードURLからOGPメタデータを取得してサイトカード挿入 */
    "Paste site card"?: boolean;
    /** クリップボードのBluesky埋め込みスクリプトから埋め込みHTMLを挿入 */
    "Paste Bluesky embed"?: boolean;
    /** 内部ノート用のカードレイアウトを作成（ファイルピッカー） */
    "Insert note card"?: boolean;
    /** カーソル配下のOGPカードをv2形式に変換（情報も最新化） */
    "Transform to v2 OGP card"?: boolean;
    /** クリップボードURLからOGPメタデータを取得してMarkdownリンク挿入 */
    "Paste URL to site link"?: boolean;

    // ── Wrapper ────────────────────────────────────────────
    /** 箇条書き/チェックボックスを切り替え */
    "Cycle bullet/checkbox"?: boolean;

    // ── MOC ────────────────────────────────────────────────
    /** MOCテンプレートを挿入 */
    "Insert MOC"?: boolean;
    /** MOCを新しい形式に変換 */
    "Transform MOC"?: boolean;
    /** MOCがなければ挿入、あれば新形式に変換 */
    "Update MOC suitably"?: boolean;

    // ── Property ───────────────────────────────────────────
    /** カーソル行の内容からよしなにプロパティを追加（URL→url、その他→description） */
    "Add property suitably"?: boolean;
    /** パーマリンクプロパティを追加（Articleはタイトルから生成、それ以外はADRとして） */
    "Add permalink property"?: {
      /** 利用するAIベンダー情報 */
      vendor: AIVendor & { type: "openai" };
    };
    /** created/updatedプロパティを更新（HTMLフッターがあればその日付を使用） */
    "Update change log"?: boolean;

    // ── Format ─────────────────────────────────────────────
    /** Markdownテーブルを整形（モバイル非対応） */
    "Format table"?: boolean;
    /** 選択範囲のリンクや装飾を無効化（1文字リンク非対応、モバイル非対応） */
    "Strip links and decorations"?: boolean;

    // ── Line operations ────────────────────────────────────
    /** 現在行を上方向に複製 */
    "Duplicate line up"?: boolean;
    /** 現在行を下方向に複製 */
    "Duplicate line down"?: boolean;

    // ── External ───────────────────────────────────────────
    /** ファイルのurlプロパティに保存されたURLを開く */
    "Open property URL"?: boolean;
    /** ローカルMkDocsサイトとして開く */
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
    /** リモートMkDocsサイトとして開く */
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

    // ── 保存 ───────────────────────────────────────────────
    /** LintやFormatなどを実行して保存 */
    "Save with"?: boolean;
  };
}

export type EditorConfig = NonNullable<Config["editor"]>;
export type AllConfig = NonNullable<Config["all"]>;

type LinterConfig = NonNullable<Config["linter"]>;
export type PropertyLinterConfig = NonNullable<
  NonNullable<LinterConfig["rules"]>["propery"]
>;

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
