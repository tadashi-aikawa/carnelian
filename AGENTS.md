# リポジトリガイドライン

## プロジェクト構成

- `src/main.ts`: Obsidian プラグインのエントリポイント。`main.js` にバンドルされる。
- `src/commands/`: コマンド実装。ファイル名は kebab-case、関数は export する。
- `src/services/`: バックグラウンドサービス。`Service` インターフェースのライフサイクルに従う。
- `src/lib/`: ユーティリティとヘルパー。テストは `*.spec.ts` として実装の近くに置く。
- `docs/`: コマンド一覧や lint ルール。
- ルート配下の主なファイル: `manifest.json`, `styles.css`, `config.schema.json`（生成物）, `main.js`（ビルド成果物）。

## ビルド・テスト・開発コマンド

- `bun dev`: esbuild で watch + build を行い、生成物を Vault の `.obsidian/plugins/carnelian` にコピーする。`carnelianrc.json` が必要。
- `bun build`: 本番用ビルドを実行する。出力は単一の `main.js`。
- `bun test`: Bun のテストランナーでユニットテストを実行する。
- `ALLOW_LARGE_TEST=1 bun test` または `bun test:large`: 重いテストや時間のかかるテストも含めて実行する。
- `bun check`: Biome で lint / format チェックを行う。
- `bun pre:push`: typecheck・lint・test をまとめて実行する。push 時には Husky からも実行される。
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

## コミットとプルリクエスト

- コミットメッセージは Conventional Commits を使う（例: `feat(scope): ...`, `fix: ...`, `docs: ...`）。破壊的変更は `feat!:` を使う。
- PR には分かりやすい説明、関連 issue、再現手順を書く。挙動変更がある場合はスクリーンショットやログも添付する。
- 品質ゲートとして `bun pre:push` を通す。必要に応じて `docs/` や schema も更新する。

## セキュリティと設定

- `carnelianrc.json` は `{ "vaultPath": "/path/to/your/Vault" }` の形式で作成する。個人環境のパスはコミットしない。
- `bun dev` を快適に使うため、Obsidian の Hot Reload プラグインを有効にしておく。

