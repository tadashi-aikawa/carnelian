# Carnelian Commands

このドキュメントはCarnelianプラグインで利用可能な全コマンドの一覧です。

## ノート作成

### 基本ノート


| コマンド名                   | 機能説明                                                                                               |
| -----------                  | ----------                                                                                             |
| Create an Article            | 📘Articlesディレクトリに新しい記事を作成。カバー画像とプロパティを自動設定                             |
| Create Prime note            | 📕プレフィックス付きPrime noteを作成し、カーソル位置にリンクを挿入                                     |
| Create Hub note              | 📒Hub noteを作成。関連コンテンツの中心的なリンクポイントとして使用                                     |
| Create Activity note         | 📜日付プレフィックス付きActivity noteを作成                                                            |
| Create Report note           | 📰レポート形式のノートを作成                                                                           |
| Create Brain note            | 🧠ブレイン形式のノートを作成                                                                           |
| Create Troubleshooting notes | 📝トラブルシューティング用の構造化されたテンプレートを作成。事象・環境・原因・解決方法のセクション付き |
| Create MTG note              | 📅ミーティング用のノートを作成                                                                         |


### 特殊ノート


| コマンド名                  | 機能説明                                                                                                  |
| -----------                 | ----------                                                                                                |
| Create MIN ADR              | Minerva用のArchitecture Decision Recordを作成。自動採番とADRリスト更新                                    |
| Create VIM ADR              | Vim用のADRを作成。経緯・提案内容・メリット/デメリットのセクション付き                                     |
| Create PRO ADR              | PRO用のADRを作成                                                                                          |
| Create OBS ADR              | Obsidian用のADRを作成                                                                                     |
| Create TDQ                  | 自動採番されるTDQ（Training/Development Questions）ノートを作成。Reference・Lesson・Missionセクション付き |
| Create Obsidian逆引きレシピ | 📗Obsidian逆引きレシピディレクトリにレシピノートを作成。概要とソリューションのテンプレート付き            |


## AI機能


| コマンド名             | 機能説明                                                                                      |
| -----------            | ----------                                                                                    |
| Summarize description  | OpenAI APIを使用してノートタイプに応じた150文字の説明を生成し、descriptionプロパティに設定    |
| Add permalink property | ArticleノートはAIでSEO対応パーマリンクを生成、ADRノートはファイル名ベースでパーマリンクを追加 |


## クリップボード・画像操作


| コマンド名                        | 機能説明                                                                                   |
| -----------                       | ----------                                                                                 |
| Paste clipboard as WebP           | クリップボードの画像をWebP形式に変換してattachmentsフォルダに保存・挿入（ImageMagick必須） |
| Paste clipboard as AVIF           | クリップボードの画像をAVIF形式（35%品質）に変換して保存・挿入                              |
| Paste clipboard as AVIF 1920      | クリップボードの画像をAVIF形式で1920pxリサイズして保存・挿入                               |
| Paste URL to site link            | クリップボードのURLからOGPメタデータを取得してMarkdownリンク形式で挿入                     |
| Copy as Confluence                | 現在の内容をConfluence記法に変換してクリップボードにコピー                                 |
| Copy active file full path        | 現在のファイルのフルシステムパスをクリップボードにコピー（macOS対応）                      |
| Copy active image file to clipboard | 現在のアクティブな画像ファイルをクリップボードにコピー                                     |
| Copy url property                 | 現在ファイルのurlプロパティ値をクリップボードにコピー                                      |
| Copy Minerva URL                  | 現在ファイルのObsidian Publish URLを生成してコピー                                         |


## リンク・カード操作


| コマンド名               | 機能説明                                                                  |
| -----------              | ----------                                                                |
| Fix link                 | `[[title (alias)]]`形式のwikiリンクを`[[title (alias)\|title]]`形式に修正 |
| Insert site card         | 入力URLからOGPメタデータを取得してHTMLカード形式で挿入                    |
| Paste site card          | クリップボードのURLからサイトカードを作成・挿入                           |
| Insert note card         | 内部ノート用のカードレイアウトを作成。ファイルピッカーでノート選択        |
| Transform to v2 OGP card | 既存のカード（内部・外部問わず）を最新フォーマットに更新                  |


## テキスト処理・フォーマット


| コマンド名                  | 機能説明                                                                   |
| -----------                 | ----------                                                                 |
| Sort selection              | 選択したテキスト行をアルファベット順またはカスタム条件でソート             |
| Format table                | Markdownテーブルを整形して一貫した配置に調整（モバイル非対応）             |
| Strip links and decorations | 選択テキストからMarkdown装飾（太字・イタリック・ハイライト・リンク）を除去 |
| Duplicate line up           | 現在行を上方向に複製（カーソルは元の位置を維持）                           |
| Duplicate line down         | 現在行を下方向に複製（カーソルは複製された行に移動）                       |


## ナビゲーション・検査


| コマンド名                  | 機能説明                                 |
| -----------                 | ----------                               |
| Move to next inspection     | 現在ファイルの次のリンティング問題に移動 |
| Move to previous inspection | 現在ファイルの前のリンティング問題に移動 |


## 週次レポート統合


| コマンド名                          | 機能説明                                                           |
| -----------                         | ----------                                                         |
| Insert new notes to the weekly note | 週の期間内に作成されたパブリックノートのリストを挿入               |
| Insert Bluesky posts to weekly note | 指定週のBlueskyポストを取得してカード形式で挿入（外部URL付きのみ） |


## プロパティ管理


| コマンド名            | 機能説明                                                                                  |
| -----------           | ----------                                                                                |
| Add property suitably | カーソル行の内容に応じて適切なプロパティを自動追加（URL→url、#→tags、その他→description） |


## ユーティリティ


| コマンド名                     | 機能説明                                                                       |
| -----------                    | ----------                                                                     |
| Toggle editor length           | Obsidianの「読みやすい行の長さ」設定をグローバルに切り替え                     |
| Toggle Live preview            | ライブプレビューとソースモード間で全エディタを一括切り替え                     |
| Clean old daily notes          | 14日以上前のデイリーノートをバックアップディレクトリに移動                     |
| Update change log              | HTMLフッター情報またはファイルシステム情報からcreated・updatedプロパティを更新 |
| Open property URL              | ファイルのurlプロパティに保存されたURLを開く                                   |
| Open active folder in terminal | 現在アクティブなフォルダをターミナルで開く                                     |
| Open vault in terminal         | 現在のvaultをターミナルで開く                                                  |
| Show File info                 | 現在のファイルの詳細情報を表示                                                 |
| Show another command palette   | 使用履歴とファジー検索機能付きの代替コマンドパレットを表示                     |


## コンテンツ構成


| コマンド名    | 機能説明                                                                                           |
| -----------   | ----------                                                                                         |
| Insert MOC    | Map of Content（目次）テンプレートを挿入（関連・アクティビティ・トラブルシューティングセクション） |
| Transform MOC | 既存のMOCコンテンツを絵文字プレフィックスに基づいて構造化された形式に再編成                        |


## 依存関係・制限事項

- **ImageMagick**: 画像変換コマンド用（Homebrew経由でインストール）
- **OpenAI API**: AI機能用（設定でAPIキーが必要）
- **インターネット接続**: OGPメタデータ取得用
- **Bluesky API**: ソーシャルメディア統合用
- **モバイル互換性**: 一部コマンドはiOS/Androidで動作しない可能性
- **Minerva特化**: 多くのコマンドは作者のMinerva知識管理システム向けにカスタマイズ
