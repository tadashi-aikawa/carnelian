import { now } from "src/lib/helpers/datetimes";
import { appendLine } from "src/lib/helpers/editors/basic";
import {
  createFile,
  getMarkdownFiles,
  openFile,
} from "src/lib/helpers/entries";
import { exists } from "src/lib/helpers/io";
import {
  getActiveFileProperties,
  updateActiveFileProperty,
} from "src/lib/helpers/properties";
import { notify, showInputDialog } from "src/lib/helpers/ui";
import { sorter } from "src/lib/utils/collections";
import { dateTimePropertyFormat } from "src/lib/utils/dates";

/**
 * MINのADRを作成します
 */
export async function createMINADR() {
  createADR("MIN");
}

/**
 * VIMのADRを作成します
 */
export async function createVIMADR() {
  createADR("VIM");
}

/**
 * PROのADRを作成します
 */
export async function createPROADR() {
  createADR("PRO");
}

/**
 * OBSのADRを作成します
 */
export async function createOBSADR() {
  createADR("OBS");
}

/**
 * 指定した種類のADRノートを作成し、一覧表の最後に挿入します
 */
async function createADR(type: "MIN" | "OBS" | "PRO" | "VIM") {
  const today = now(dateTimePropertyFormat);

  const prefix = `💿${type}`;
  const maxNumber = Number(
    getMarkdownFiles()
      .filter((x) => x.name.startsWith(`${prefix}-`))
      .sort(sorter((x) => x.name))
      .pop()
      ?.name.split(" ")[0]
      .replace(`${prefix}-`, "") ?? -1,
  );

  const newNumber = String(maxNumber + 1).padStart(4, "0");

  // WARN: min-adr.webpが404のまま動かないのでMINだけルールを変えている (いつか戻したい...)
  const cover =
    type === "MIN"
      ? "💿ADR/attachments/minerva-adr.webp"
      : `Notes/attachments/${type.toLowerCase()}-adr.webp`;
  const permalink = `${type.toLocaleLowerCase()}-${newNumber}`;

  const NOTE_BODY = `
---
created: ${today}
updated: ${today}
cover: ${cover}
permalink: ${permalink}
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
  appendLine(`| [[${adrTitle}]]       |  |`);

  if (getActiveFileProperties()?.updated) {
    updateActiveFileProperty("updated", today);
  }

  const f = await createFile(adrFilePath, NOTE_BODY);
  await openFile(f.path);
}
