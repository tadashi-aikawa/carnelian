<div align="center">
    <h1>
       <img src="./carnelian_logo.svg" />
    </h1>
    <img src="./carnelian.webp" width="256" />
    <p>
      <div>IncredibleなObsidian体験を実現するための機能を提供する宝石、紅玉髄(カーネリアン)。</div>
      <div>プラグインの機構を使って自分だけの最強のObsidianを構築する。</div>
    </p>
</div>

> [!NOTE]
> 基本的にtadashi-aikawaが利用する機能を実装しています。ただ、全体の仕組みと`lib`配下のメソッドは流用できるので、どなたでも利用できます。

## 前提環境

- macOS
- [Bun] v1.3.5
- [Hot Reload]プラグイン

## 開発環境構築

### 依存パッケージのインストール

```bash
bun install --frozen-lockfile --ignore-scripts
```

### 設定ファイルの作成

`carnelianrc.json`を作成してください。

```json
{
  "vaultPath": "<Vaultのパス>"
}
```

## 開発コマンド

```bash
bun dev
```

このコマンドは3つのことを行います。

- Vaultのプラグインディレクトリ(`.obsidian/plugins`)配下に`carnelian`プロジェクトを生成する
- TypeScriptのファイルに変更があったら、[esbuild]が自動でビルドしてJavaScriptファイルと`config.schema.json`を生成する
- `esbuild.config.mjs`の`FILES`に記載されたファイルに変更があったら、`PLUGIN_DIR`で指定したディレクトリ配下に自動でコピーする

```typescript
// FILESのデフォルト (変更は不要なはず)
const FILES = ["main.js", "manifest.json", "styles.css",  "config.schema.json"];
```

## push前のチェックコマンド

```bash
bun pre:push
```

## 秘密情報の管理

Keychainを使って管理しています。以下のコマンドで必要な秘密情報を登録してください。

```
security add-generic-password \
  -s net.mamansoft.Obsidian.Carnelian \
  -a <設定のキー名> \
  -w <秘密情報>
```

`<設定のキー名>` は `data.json` に設定します。`src/definitions/config.ts` で `KeyChainAccountName` 型として割り当てられている項目に利用できます。

## 機能追加要望

個人的に必要と感じたものに限り取り入れることがあります。IssueやPull Requestからどうぞ。(受け入れ基準は厳しめです)

[Bun]: https://bun.sh/
[esbuild]: https://esbuild.github.io/
[Hot Reload]: https://github.com/pjeby/hot-reload

<small style="color: gray">※ ロゴ画像はAIで生成されています</small>

