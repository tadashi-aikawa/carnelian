import dayjs from "dayjs";
import { Command, TFile } from "obsidian";
import { insertToCursor, setLivePreview } from "./lib/helpers/editors/basic";
import { getMarkdownFilesInRange } from "./lib/helpers/entries";
import { getAllMarkdownLeaves } from "./lib/helpers/leaves";
import { getDailyNotes } from "./lib/helpers/plugins";
import { getActiveFileDescriptionProperty } from "./lib/helpers/properties";
import { loadCodeBlocks } from "./lib/helpers/sections";
import { toggleDefaultEditingMode } from "./lib/helpers/settings";
import { notify } from "./lib/helpers/ui";
import { createCommand } from "./lib/obsutils/commands";
import { CodeBlock } from "./lib/types";
import { doSinglePatternMatching } from "./lib/utils/strings";
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
      executor: toggleLivePreviewMode,
    }),
  ];
}

/**
 * Editor > Default editing mode の設定を切り替えます
 *  開いているMarkdownノートもすべて切り替えます
 */
function toggleLivePreviewMode() {
  const nextDefault = toggleDefaultEditingMode() === "livePreview";
  getAllMarkdownLeaves().forEach((l) => setLivePreview(l, nextDefault));
}

/**
 * MFDIでポストした内容をWeekly Reportに差し込みます
 *
 * TODO: createLinkも含めてもう少し楽にしたい
 */
async function insertMFDIPostsToWeeklyNote() {
  const description = getActiveFileDescriptionProperty();
  if (!description) {
    notify("プロパティにdescriptionが存在しません");
    return;
  }

  const [weekBegin, weekEnd] = doSinglePatternMatching(
    description,
    /\d{4}-\d{2}-\d{2}/g
  );
  if (!weekBegin) {
    notify("descriptionプロパティに開始日が存在しません");
    return;
  }
  if (!weekEnd) {
    notify("descriptionプロパティに終了日が存在しません");
    return;
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

  insertToCursor(
    codeBlocks
      .filter(({ codeBlock }) => codeBlock.language === "fw")
      .map(
        ({ path, codeBlock }) => `\`\`\`${path}\n${codeBlock.content}\n\`\`\``
      )
      .filter((x) => x.includes("http"))
      .join("\n\n")
  );
  notify(`${weekBegin} ～ ${weekEnd} に作成されたノートを挿入しました`, 5000);
}

/**
 * 1週間で作成したノートの一覧をWeekly Reportに差し込みます
 */
async function insertInputsToWeeklyNote() {
  const description = getActiveFileDescriptionProperty();
  if (!description) {
    notify("プロパティにdescriptionが存在しません");
    return;
  }

  const [weekBegin, weekEnd] = doSinglePatternMatching(
    description,
    /\d{4}-\d{2}-\d{2}/g
  );
  if (!weekBegin) {
    notify("descriptionプロパティに開始日が存在しません");
    return;
  }
  if (!weekEnd) {
    notify("descriptionプロパティに終了日が存在しません");
    return;
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
