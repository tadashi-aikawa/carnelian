<div align="center">
    <h1>Carnelian</h1>
    <img src="./logo.png" width="384" />
    <p>
      <div>InvisibleなObsidian体験を実現するための機能を提供する宝石、紅玉髄(カーネリアン)。</div>
      <div>プラグインの機構を使って自分だけの最強のObsidianを構築する。</div>
    </p>
</div>

> [!NOTE]
> 基本的にtadashi-aikawaが利用する機能を実装しています。ただ、全体の仕組みと`lib`配下のメソッドは流用できるので、どなたでも利用できます。

## 開発の前提環境

- Ubuntu (macOSでも動きそう)
- [Bun] v1.1.20
- [Hot Reload]プラグイン

## 開発環境構築

### 依存パッケージのインストール

```console
bun i
```

### 設定ファイルの作成

`carnelianrc.json`を作成してください。

```json
{
  "vaultPath": "<Vaultのパス>"
}
```

## 開発コマンド

```console
bun dev
```

このコマンドは3つのことを行います。

- Vaultのプラグインディレクトリ(`.obsidian/plugins`)配下に`carnelian`プロジェクトを生成する
- TypeScriptのファイルに変更があったら、[esbuild]が自動でビルドしてJavaScriptファイルを生成する
- `esbuild.config.mjs`の`FILES`に記載されたファイルに変更があったら、`PLUGIN_DIR`で指定したディレクトリ配下に自動でコピーする

```ts
// FILESのデフォルト (変更は不要なはず)
const FILES = ["main.js", "manifest.json", "styles.css"];
```

## Lint

```console
bun lint
```

## 機能追加要望

個人的に必要と感じたものに限り取り入れることがあります。IssueやPull Requestからどうぞ。(受け入れ基準は厳しめです)

[Bun]: https://bun.sh/
[esbuild]: https://esbuild.github.io/
[Hot Reload]: https://github.com/pjeby/hot-reload

<small style="color: gray">※ ロゴ画像はAIで生成されています</small>

