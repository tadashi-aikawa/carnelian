import { now } from "src/lib/helpers/datetimes";
import { insertToCursor } from "src/lib/helpers/editors/basic";
import { createFile, openFile } from "src/lib/helpers/entries";
import { exists } from "src/lib/helpers/io";
import {
  getActiveFileProperties,
  updateActiveFileProperty,
} from "src/lib/helpers/properties";
import { notify, notifyWarning, showInputDialog } from "src/lib/helpers/ui";
import { dateTimePropertyFormat } from "src/lib/utils/dates";
import type { PluginSettings } from "src/settings";

type CreateTaskNoteSetting = NonNullable<
  PluginSettings["editor"]
>["Create task note"];

/**
 * タスクノートを作成し、カーソル配下にリンクを挿入します
 */
export async function createTaskNote(setting?: CreateTaskNoteSetting) {
  const directory = setting?.directory?.trim();
  if (!directory) {
    return notifyWarning("Create task note の directory を設定してください");
  }

  if (!(await exists(directory))) {
    return notifyWarning(`${directory} は存在しません`);
  }

  const inputTitle = await showInputDialog({
    message: "タスクのタイトルを入力してください",
    placeholder: "タスクノート作成コマンドの追加",
  });
  if (!inputTitle) {
    return;
  }

  const title = `📌${inputTitle}`;
  const path = `${directory.replace(/\/+$/u, "")}/${title}.md`;
  if (await exists(path)) {
    return notify(`${path} は既に存在します`);
  }

  const today = now(dateTimePropertyFormat);
  insertToCursor(`[[${title}]]`);

  if (getActiveFileProperties()?.updated) {
    updateActiveFileProperty("updated", today);
  }

  const f = await createFile(
    path,
    `
---
id: ${generateTaskNoteId()}
status: 🔵TODO
description:
created: ${today}
updated: ${today}
---
## 概要

## 成果物

## 作業メモ
`.trim(),
  );
  await openFile(f.path);
}

function generateTaskNoteId(): string {
  return Array.from(globalThis.crypto.getRandomValues(new Uint8Array(5)))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")
    .toLowerCase();
}
