# LINT_RULES

lint機能のルールを記載する。

## Property Linter

### No description

プロパティに `description` が存在しない。

| ノートの種類         | レベル | 備考 |
| -------------------- | ------ | ---- |
| Glossary note        | ERROR  |      |
| Hub note             |        |      |
| Procedure note       | WARN   |      |
| Activity note        | ERROR  |      |
| Troubleshooting note | ERROR  |      |
| Prime note           | ERROR  |      |
| Report note          | ERROR  |      |
| Article note         | ERROR  |      |
| My note              | WARN   |      |
| Series note          | ERROR  |      |
| Daily note           |        |      |
| Weekly Report        | ERROR  |      |

### No cover

プロパティに `cover` が存在しない。

| ノートの種類         | レベル | 備考    |
| -------------------- | ------ | ----    |
| Glossary note        |        |         |
| Hub note             | ERROR  | autofix |
| Procedure note       |        |         |
| Activity note        | ERROR  | autofix |
| Troubleshooting note | ERROR  | autofix |
| Prime note           | ERROR  | autofix |
| Report note          | ERROR  | autofix |
| Article note         | ERROR  |         |
| My note              | ERROR  |         |
| Series note          | ERROR  |         |
| Daily note           |        |         |
| Weekly Report        | ERROR  | autofix |

### No url

プロパティに `url` が存在しない。

| ノートの種類         | レベル | 備考 |
| -------------------- | ------ | ---- |
| Glossary note        | WARN   |      |
| Hub note             |        |      |
| Procedure note       | INFO   |      |
| Activity note        |        |      |
| Troubleshooting note |        |      |
| Prime note           |        |      |
| Report note          |        |      |
| Article note         |        |      |
| My note              |        |      |
| Series note          |        |      |
| Daily note           |        |      |
| Weekly Report        |        |      |

### No status

プロパティに `status` が存在しない。

| ノートの種類         | レベル | 備考    |
| -------------------- | ------ | ----    |
| Glossary note        |        |         |
| Hub note             |        |         |
| Procedure note       |        |         |
| Activity note        |        |         |
| Troubleshooting note | ERROR  | autofix |
| Prime note           |        |         |
| Report note          |        |         |
| Article note         |        |         |
| My note              |        |         |
| Series note          |        |         |
| Daily note           |        |         |
| Weekly Report        |        |         |

### Tags

プロパティに `tags` が存在する。

| ノートの種類         | レベル | 備考    |
| -------------------- | ------ | ----    |
| Glossary note        | ERROR  | autofix |
| Hub note             | ERROR  | autofix |
| Procedure note       | ERROR  | autofix |
| Activity note        | ERROR  | autofix |
| Troubleshooting note | ERROR  | autofix |
| Prime note           | ERROR  | autofix |
| Report note          | ERROR  | autofix |
| Article note         | ERROR  | autofix |
| My note              | ERROR  | autofix |
| Series note          | ERROR  | autofix |
| Daily note           | ERROR  | autofix |
| Weekly Report        | ERROR  | autofix |

以下のケースは例外的に **タグを許容し、タグが無い場合はautofixで付与する**。

- タイトルに(JavaScript)が含まれている場合のTypeScriptはOK
- タイトルに(Vim)が含まれている場合のNeovimはOK

## Content Linter

### Disallowed link card

カード型リンク(external/internal)が許可されていないのに利用されている。

- `Move to next inspection` /  `Move to previous inspection` 対応

| ノートの種類         | レベル | 備考             |
| -------------------- | ------ | ---------------- |
| Glossary note        | ERROR  |                  |
| Hub note             |        |                  |
| Procedure note       | ERROR  |                  |
| Activity note        |        |                  |
| Troubleshooting note |        |                  |
| Prime note           |        |                  |
| Report note          |        |                  |
| Article note         |        |                  |
| My note              |        |                  |
| Series note          |        |                  |
| Daily note           |        | 気にしなくていい |
| Weekly Report        |        |                  |

### No link comment

Vault内のノートを参照するカードがあるのに、その内部リンクが存在しない。

具体的には本文中に `data-href="hogehoge"` があるのに `%%[[hogehoge]]%%` がない場合。

- `Move to next inspection` /  `Move to previous inspection` 対応

| ノートの種類         | レベル | 備考             |
| -------------------- | ------ | ---------------- |
| Glossary note        |        | 使ってないはず   |
| Hub note             | ERROR  |                  |
| Procedure note       |        | 使ってないはず   |
| Activity note        | ERROR  |                  |
| Troubleshooting note | ERROR  |                  |
| Prime note           | ERROR  |                  |
| Report note          | ERROR  |                  |
| Article note         | ERROR  |                  |
| My note              | ERROR  |                  |
| Series note          | ERROR  |                  |
| Daily note           |        | 気にしなくていい |
| Weekly Report        | ERROR  |                  |

### v1 link card

Link cardが非推奨のv1形式になっている。

- `Move to next inspection` /  `Move to previous inspection` 対応

| ノートの種類         | レベル | 備考             |
| -------------------- | ------ | ---------------- |
| Glossary note        |        | 使ってないはず   |
| Hub note             | WARN   |                  |
| Procedure note       |        | 使ってないはず   |
| Activity note        | WARN   |                  |
| Troubleshooting note | WARN   |                  |
| Prime note           | WARN   |                  |
| Report note          | WARN   |                  |
| Article note         | WARN   |                  |
| My note              | WARN   |                  |
| Series note          | WARN   |                  |
| Daily note           |        | 気にしなくていい |
| Weekly Report        | WARN   |                  |

### Unofficial MOC format

MOCのフォーマットがMinervaの最新仕様に従っていない。

| ノートの種類         | レベル | 備考              |
| -------------------- | ------ | ----------------  |
| Glossary note        | ERROR  |                   |
| Hub note             |        | Hubは例外を認める |
| Procedure note       | ERROR  |                   |
| Activity note        |        | 使ってないはず    |
| Troubleshooting note |        | 使ってないはず    |
| Prime note           | ERROR  |                   |
| Report note          |        | 使ってないはず    |
| Article note         |        | 使ってないはず    |
| My note              |        | 使ってないはず    |
| Series note          |        | 使ってないはず    |
| Daily note           |        | 使ってないはず    |
| Weekly Report        |        | 使ってないはず    |

### v1 dates format 

ノートの作成日、最終更新日の形式が古い。

| ノートの種類         | レベル | 備考           |
| -------------------- | ------ | ----           |
| Glossary note        | ERROR  | autofix        |
| Hub note             | ERROR  | autofix        |
| Procedure note       | ERROR  | autofix        |
| Activity note        | ERROR  | autofix        |
| Troubleshooting note | ERROR  | autofix        |
| Prime note           | ERROR  | autofix        |
| Report note          | ERROR  | autofix        |
| Article note         | ERROR  | autofix        |
| My note              | ERROR  | autofix        |
| Series note          | ERROR  | autofix        |
| Daily note           |        | 存在しないはず |
| Weekly Report        | ERROR  | autofix        |

### Unresolved internal link

未解決の内部リンクが存在する。

- `Move to next inspection` /  `Move to previous inspection` 対応

| ノートの種類         | レベル | 備考 |
| -------------------- | ------ | ---- |
| Glossary note        | INFO   |      |
| Hub note             | INFO   |      |
| Procedure note       | INFO   |      |
| Activity note        | INFO   |      |
| Troubleshooting note | WARN   |      |
| Prime note           | WARN   |      |
| Report note          | WARN   |      |
| Article note         | ERROR  |      |
| My note              | WARN   |      |
| Series note          | ERROR  |      |
| Daily note           |        |      |
| Weekly Report        | WARN   |      |

### Link ends with parenthesis

括弧 ` (...)` で終わるリンクが存在する。( `...` は任意の文字列 )

- `Move to next inspection` /  `Move to previous inspection` 対応

| ノートの種類         | レベル | 備考                       |
| -------------------- | ------ | ----                       |
| Glossary note        | WARN   | 同名リンクで使うことがある |
| Hub note             | WARN   | 同名リンクで使うことがある |
| Procedure note       | ERROR  |                            |
| Activity note        | ERROR  |                            |
| Troubleshooting note | ERROR  |                            |
| Prime note           | ERROR  |                            |
| Report note          | ERROR  |                            |
| Article note         | ERROR  |                            |
| My note              | ERROR  |                            |
| Series note          | ERROR  |                            |
| Daily note           |        |                            |
| Weekly Report        | ERROR  | 箇条書き(New Notes)は除外  |

