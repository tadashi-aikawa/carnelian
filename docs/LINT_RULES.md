# LINT_RULES

lint機能の設定方法を記載する。

## Linter note type

Linterは `linter.noteTypes` に定義されたノート種別だけを検査対象にする。
`mkms.ts` のノート種別とは独立しており、ノート作成コマンドなどには影響しない。

```json
{
  "linter": {
    "noteTypes": [
      {
        "name": "Article note",
        "pathPattern": "^📘Articles/📘.+\\.md$",
        "coverImagePath": null
      },
      {
        "name": "Daily note",
        "pathPattern": "^_Privates/Daily Notes/.+\\.md$"
      }
    ]
  }
}
```

- `name`: Linter上のノート種別名。
- `pathPattern`: Vault rootからの相対パスに対して評価する正規表現文字列。
- `coverImagePath`: `No cover` のautofixで設定するcover画像パス。省略または `null` の場合、診断のみ行う。
- 複数の `pathPattern` に一致する場合は、配列の先頭にあるノート種別を使う。
- どの `pathPattern` にも一致しないファイルは、diagnosticsを出力しない。

## Rule config

各ruleは `linter.rules.property` または `linter.rules.content` 配下に定義する。
rule keyが存在すれば有効、存在しなければ無効になる。

```json
{
  "linter": {
    "rules": {
      "property": {
        "No cover": {
          "defaultLevel": "ERROR",
          "levels": {
            "Daily note": null
          },
          "ignoreFiles": ["Templates/**"]
        },
        "Inconsistent description": {
          "defaultLevel": null,
          "levels": {
            "Glossary note": "ERROR",
            "Hub note": "ERROR",
            "Procedure note": "ERROR",
            "My note": "ERROR"
          },
          "ignoreFiles": []
        }
      },
      "content": {
        "Unresolved internal link": {
          "defaultLevel": "WARN",
          "levels": {
            "Article note": "ERROR",
            "Daily note": null
          }
        },
        "No backlinks": {
          "defaultLevel": "WARN",
          "levels": {
            "Article note": null,
            "Daily note": null
          },
          "ignoreFiles": []
        }
      }
    }
  }
}
```

- `defaultLevel`: `levels` で未指定のノート種別に使うLevel。`"INFO"`, `"WARN"`, `"ERROR"`, `null` を指定できる。
- `levels`: ノート種別ごとのLevel。`null` を指定したノート種別では診断しない。
- `ignoreFiles`: 各ruleで指定可能。globパターンに一致するファイルをそのruleだけ検査対象外にする。

## Property Linter rules

| Rule | Description | Autofix |
| --- | --- | --- |
| `No description` | `description` プロパティが存在しない。 | - |
| `No cover` | `cover` プロパティが存在しない。 | `coverImagePath` がある場合、`cover` を設定する。 |
| `No url` | `url` プロパティが存在しない。 | - |
| `No status` | `status` プロパティが存在しない。 | `✅解決済` を設定する。 |
| `Tags` | タグの付与漏れまたは不要な `tags` プロパティを検出する。 | タグを追加・削除する。 |
| `MkDocs title` | MkDocs向けの `title` プロパティをファイル名と同期する。 | `title` を設定・削除する。 |
| `Inconsistent fixme` | 本文の `!FIXME` / `!fixme` / `==ハイライト==` と `fixme` プロパティの不整合を検出する。 | `fixme` プロパティを本文に合わせる。 |
| `Inconsistent description` | 本文1行目と `description` プロパティの不整合を検出する。 | `description` を本文1行目に合わせる。 |

## Content Linter rules

| Rule | Description | Autofix |
| --- | --- | --- |
| `Disallowed link card` | カード型リンクが使われている。 | - |
| `No link comment` | 内部リンクカードに対応するリンクコメントが存在しない。 | - |
| `v1 link card` | 非推奨のv1形式カードリンクを検出する。 | - |
| `Unofficial MOC format` | MOCのフォーマットが最新仕様に従っていない。 | - |
| `v1 dates format` | 古い日付メタを検出する。 | `created` / `updated` を追加する。 |
| `Unresolved internal link` | 未解決の内部リンクを検出する。 | - |
| `Link ends with parenthesis` | 括弧 ` (...)` で終わる内部リンクを検出する。 | - |
| `Redundant link alias` | `[[hoge\|hoge]]` のような冗長な内部リンクエイリアスを検出する。 | - |
| `Disallow fixme` | 本文に `!FIXME` / `!fixme` / `==ハイライト==` が残っている。 | - |
| `No backlinks` | バックリンクが存在しない。 | - |
