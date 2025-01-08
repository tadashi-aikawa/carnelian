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
| Daily Note           |        |      |
| Weekly Report        | ERROR  |      |

### No cover

プロパティに `cover` が存在しない。

| ノートの種類         | レベル | 備考 |
| -------------------- | ------ | ---- |
| Glossary note        |        |      |
| Hub note             | ERROR  |      |
| Procedure note       |        |      |
| Activity note        | ERROR  |      |
| Troubleshooting note | ERROR  |      |
| Prime note           | ERROR  |      |
| Report note          | ERROR  |      |
| Article note         | ERROR  |      |
| Daily Note           |        |      |
| Weekly Report        | ERROR  |      |

> [!NOTE]
> TODO: autofixを追加予定

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
| Daily Note           |        |      |
| Weekly Report        |        |      |

## Content Linter

### Disallowed link card

カード型リンク(external/internal)が許可されていないのに利用されている。

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
| Daily Note           |        | 気にしなくていい |
| Weekly Report        |        |                  |

### No link comment

Vault内のノートを参照するカードがあるのに、その内部リンクが存在しない。

具体的には本文中に `data-href="hogehoge"` があるのに `%%[[hogehoge]]%%` がない場合。

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
| Daily Note           |        | 気にしなくていい |
| Weekly Report        | ERROR  |                  |

### v1 link card

Link cardが非推奨のv1形式になっている。

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
| Daily Note           |        | 気にしなくていい |
| Weekly Report        | WARN   |                  |

