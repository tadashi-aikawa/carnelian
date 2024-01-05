import dayjs from "dayjs";
import { Command, TFile } from "obsidian";
import { now } from "./lib/helpers/datetimes";
import {
  getActiveParagraph,
  sortSelectionLines,
  stripLinksAndDecorationsFromSelection,
} from "./lib/helpers/editors/advanced";
import {
  appendLine,
  insertToCursor,
  setLinesInRange,
  setLivePreview,
} from "./lib/helpers/editors/basic";
import {
  createFile,
  exists,
  getMarkdownFiles,
  getMarkdownFilesInRange,
  openFile,
  renameFileWithoutLinkModified,
} from "./lib/helpers/entries";
import { getAllMarkdownLeaves } from "./lib/helpers/leaves";
import { getDailyNotes } from "./lib/helpers/plugins";
import {
  addActiveFileProperties,
  getActiveFileDescriptionProperty,
} from "./lib/helpers/properties";
import { loadCodeBlocks } from "./lib/helpers/sections";
import {
  toggleDefaultEditingMode,
  toggleVimKeyBindings,
} from "./lib/helpers/settings";
import { notify, showInputDialog } from "./lib/helpers/ui";
import { createCard, createHTMLCard, createMeta } from "./lib/helpers/web";
import { createCommand } from "./lib/obsutils/commands";
import { CodeBlock } from "./lib/types";
import { sorter } from "./lib/utils/collections";
import * as strings from "./lib/utils/strings";
import { PluginSettings } from "./settings";

export function createCommands(settings: PluginSettings): Command[] {
  return [
    createCommand({
      name: "Insert MFDI posts to the weekly note",
      kind: "editor",
      executor: insertMFDIPostsToWeeklyNote,
    }),
    createCommand({
      name: "Insert inputs to the weekly note",
      kind: "editor",
      executor: insertInputsToWeeklyNote,
    }),
    createCommand({
      name: "Toggle Live preview",
      kind: "all",
      executor: () => {
        const nextDefault = toggleDefaultEditingMode() === "livePreview";
        getAllMarkdownLeaves().forEach((l) => setLivePreview(l, nextDefault));
      },
    }),
    createCommand({
      name: "Toggle Vim mode",
      kind: "all",
      executor: () => {
        toggleVimKeyBindings();
      },
    }),
    createCommand({
      name: "Create an Article",
      kind: "all",
      executor: createArticle,
    }),
    createCommand({
      name: "Insert site card",
      kind: "editor",
      executor: insertSiteCard,
    }),
    createCommand({
      name: "Sort selection",
      kind: "editor",
      executor: sortSelectionLines,
    }),
    createCommand({
      name: "Clean old daily notes",
      kind: "all",
      executor: () =>
        cleanOldDailyNotes("2020-12-30", "../minerva-daily-note-backup"),
    }),
    createCommand({
      name: "Create MIN ADR",
      kind: "all",
      executor: () => {
        createADR("MIN");
      },
    }),
    createCommand({
      name: "Format table",
      kind: "editor",
      executor: () => {
        formatTable();
      },
    }),
    createCommand({
      name: "Strip links and decorations",
      kind: "editor",
      executor: () => {
        stripLinksAndDecorations();
      },
    }),
  ];
}

/**
 * 選択範囲のリンクや装飾を無効化します
 * WARN: 1文字のリンクには対応していません
 * WARN: このメソッドはObsidian MobileのiPhone/iPadでは動作しない可能性があります
 */
function stripLinksAndDecorations() {
  stripLinksAndDecorationsFromSelection();
}

/**
 * Markdownテーブルをフォーマットします
 * WARN: このメソッドはObsidian MobileのiPhone/iPadでは動作しない可能性があります
 */
function formatTable() {
  const p = getActiveParagraph();
  if (!p) {
    return;
  }

  const formattedTableText = strings.formatTable(p.text);
  if (!formattedTableText) {
    return;
  }

  setLinesInRange(p.startLine, p.endLine, formattedTableText);
}

/**
 * 指定した種類のADRノートを作成し、一覧表の最後に挿入します
 */
async function createADR(type: "MIN" | "OBS" | "PRO") {
  const NOTE_BODY = `
## ステータス

#🤔Proposed 

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

/**
 * 14日前よりも古いDaily Noteをクリーンします
 * クリーンとは任意の別ディレクトリに移すこと
 *
 * WARN:
 * デイリーノート一覧はキャッシュの情報から判断します
 * デイリーノートファイルに大きな増減があった場合はObsidianを再起動してから実行してください
 *
 * @param startDate - 探索開始日付 (ex: 2023-12-30)
 * @param cleanDir - クリーンしたファイルを配置するディレクトリパス
 */
async function cleanOldDailyNotes(startDate: string, cleanDir: string) {
  const end = dayjs().subtract(2, "weeks").format("YYYY-MM-DD");

  const notes = getDailyNotes(startDate, end);
  if (notes.length === 0) {
    return notify(
      `${startDate} ～ ${end} の期間にはデイリーノートが存在しませんでした。`
    );
  }

  notify(
    `${notes.length}件のノートを ${cleanDir} 配下に移動します。しばらく時間がかかる場合があります。`
  );

  for (const f of notes) {
    await renameFileWithoutLinkModified(f.path, `${cleanDir}/${f.name}`);
  }

  notify(`${notes.length}件のノートを ${cleanDir} 配下に移動しました。`);
}

/**
 * Articleを作成します
 */
async function createArticle() {
  const title = await showInputDialog({
    message: "Articleのタイトルを入力してください",
  });
  if (title == null) {
    return;
  }
  if (title === "") {
    return notify("タイトルは必須です");
  }

  const fp = `📘Articles/📘${title}.md`;
  if (await exists(fp)) {
    return notify(`${fp} はすでに存在しています`);
  }

  const today = now("YYYY-MM-DD");
  const f = await createFile(
    fp,
    `[[📒Articles]] > [[📒2023 Articles]]

![[${today}.jpg|cover-picture]]
`
  );

  await openFile(f.path);

  addActiveFileProperties({
    created: today,
    updated: today,
    description: "TODO",
    cover: `📘Articles/attachments/${today}.jpg`,
  });
}

/**
 * MFDIでポストした内容をWeekly Reportに差し込みます
 */
async function insertMFDIPostsToWeeklyNote() {
  const description = getActiveFileDescriptionProperty();
  if (!description) {
    return notify("プロパティにdescriptionが存在しません");
  }

  const [weekBegin, weekEnd] = strings.doSinglePatternMatching(
    description,
    /\d{4}-\d{2}-\d{2}/g
  );
  if (!weekBegin) {
    return notify("descriptionプロパティに開始日が存在しません");
  }
  if (!weekEnd) {
    return notify("descriptionプロパティに終了日が存在しません");
  }

  const codeBlocks: { path: string; codeBlock: CodeBlock }[] = [];
  for (const file of getDailyNotes(weekBegin, weekEnd)) {
    const cbs = await loadCodeBlocks(file.path);
    cbs!.forEach((codeBlock) => {
      codeBlocks.push({
        path: file.path,
        codeBlock,
      });
    });
  }

  const targetCodeBlocks = codeBlocks
    .map((x) => x.codeBlock)
    .filter((cb) => cb.language === "fw" && cb.content.includes("http"))
    .toReversed();

  for (const cb of targetCodeBlocks) {
    const [url] = strings.doSinglePatternMatching(cb.content, /http.+/g);
    const meta = await createMeta(url);
    if (meta?.type !== "html") {
      continue;
    }

    insertToCursor(
      `## ${meta.title}

#todo 事実の概要

${createHTMLCard(meta)}

#todo 詳細や所感

~~~
${cb.content}
~~~

`
    );
  }

  notify(
    `${weekBegin} ～ ${weekEnd} にMFDIで投稿されたサイトURL付の投稿を挿入しました`,
    5000
  );
}

/**
 * 1週間で作成したノートの一覧をWeekly Reportに差し込みます
 */
async function insertInputsToWeeklyNote() {
  const description = getActiveFileDescriptionProperty();
  if (!description) {
    return notify("プロパティにdescriptionが存在しません");
  }

  const [weekBegin, weekEnd] = strings.doSinglePatternMatching(
    description,
    /\d{4}-\d{2}-\d{2}/g
  );
  if (!weekBegin) {
    return notify("descriptionプロパティに開始日が存在しません");
  }
  if (!weekEnd) {
    return notify("descriptionプロパティに終了日が存在しません");
  }

  const isPublicNote = (file: TFile) =>
    !file.path.startsWith("_") && file.extension === "md";

  const noteLists = getMarkdownFilesInRange(
    dayjs(weekBegin),
    dayjs(weekEnd).add(1, "days")
  )
    .filter(isPublicNote)
    .map((x) => `- [[${x.basename}]]`)
    .sort()
    .join("\n");

  insertToCursor(noteLists);

  notify(`${weekBegin} ～ ${weekEnd} に作成されたノートを挿入しました`, 5000);
}

/**
 * サイトからカードレイアウトのHTML文字列を挿入します
 */
async function insertSiteCard() {
  const url = await showInputDialog({ message: "URLを入力してください" });
  if (!url) {
    return;
  }

  try {
    const html = await createCard(url);
    insertToCursor(html);
  } catch (e: any) {
    notify(e);
  }
}
