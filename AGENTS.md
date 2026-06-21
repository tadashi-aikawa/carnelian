# リポジトリガイドライン

## プロジェクト構成

- `src/main.ts`: Obsidian プラグインのエントリポイント。`main.js` にバンドルされる。
- `src/commands/`: コマンド実装。ファイル名は kebab-case、関数は export する。
- `src/services/`: バックグラウンドサービス。`Service` インターフェースのライフサイクルに従う。
- `src/lib/`: ユーティリティとヘルパー。テストは `*.spec.ts` として実装の近くに置く。
- `docs/`: コマンド一覧や lint ルール。
- ルート配下の主なファイル: `manifest.json`, `styles.css`, `config.schema.json`（生成物）, `main.js`（ビルド成果物）。

## 必要なコマンド

- `bun pre:push`: typecheck・lint・test をまとめて実行する。
- `bun schema`: `src/definitions/config.ts` から `config.schema.json` を生成する。

## コーディングスタイルと命名規則

- 言語は TypeScript（strict）。ターゲットは ES2018、module は ESNext。
- フォーマットは Biome を使用する。インデントは 2 スペース、`organizeImports` を有効にしている。`.editorconfig` により LF / 末尾改行を強制する。
- コマンドやサービスのファイル名は kebab-case にする。テストファイルは `*.spec.ts` として実装の近くに置く。
- モジュールは小さく責務を絞る。Obsidian 依存のコードは `lib/obsutils` 系の領域に寄せる。
- 単発のコマンド固有ロジックは utils に切り出さない
- 1回しか使わない値は定数化しない

## テスト方針

- 小規模な個人用コマンド追加ではテストを書かない
    - 基本は utility や linter のみ
- テストフレームワークは Bun 標準のテストランナーを使う。必要に応じて JSDOM を使ってよい。
- テストファイルは実装の近く（`src/**/name.spec.ts`）に置く。
- ローカルでは `bun test` を使い、必要なら `bun test:large` で重いテストも確認する。

