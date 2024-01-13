import { now } from "src/lib/helpers/datetimes";
import { appendLine } from "src/lib/helpers/editors/basic";
import {
  getMarkdownFiles,
  exists,
  openFile,
  createFile,
} from "src/lib/helpers/entries";
import { showInputDialog, notify } from "src/lib/helpers/ui";
import { sorter } from "src/lib/utils/collections";

/**
 * MINのADRを作成します
 */
export async function createMINADR() {
  createADR("MIN");
}

/**
 * 指定した種類のADRノートを作成し、一覧表の最後に挿入します
 */
async function createADR(type: "MIN" | "OBS" | "PRO") {
  const today = now("YYYY-MM-DD");

  const NOTE_BODY = `
---
created: ${today}
updated: ${today}
status:
  - 🤔Proposed
---
%% 結論があればここ %%

## 経緯

%%提案に至った理由が分かるように書く%%

## 提案内容

%%選択肢がある場合は複数書く%%

## 承諾した場合の結果

%%選択肢がある場合は複数書く%%

### メリット

- aa
- bb

### デメリット

- aa
- bb
`.trim();

  const prefix = `💿${type}`;
  const maxNumber = Number(
    getMarkdownFiles()
      .filter((x) => x.name.startsWith(`${prefix}-`))
      .sort(sorter((x) => x.name))
      .pop()
      ?.name.split(" ")[0]
      .replace(`${prefix}-`, "") ?? -1
  );

  const newNumber = String(maxNumber + 1).padStart(4, "0");
  const inputTitle = await showInputDialog({
    message: `[${prefix}-${newNumber}] タイトルを入力してください`,
  });
  if (!inputTitle) {
    return;
  }

  const adrTitle = `${prefix}-${newNumber} ${inputTitle}`;

  const adrFilePath = `💿ADR/${adrTitle}.md`;
  if (await exists(adrFilePath)) {
    return notify(`${adrFilePath} は既に存在します`);
  }

  const adrListPath = `💿ADR/${prefix}.md`;
  await openFile(adrListPath);
  appendLine(`| [[${adrTitle}]]       | #🤔Proposed |`);

  const f = await createFile(adrFilePath, NOTE_BODY);
  await openFile(f.path);
}
