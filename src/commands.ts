import { Command } from "obsidian";
import { insertToCursor } from "./lib/helpers/editors/basic";
import { getDailyNotes } from "./lib/helpers/plugins";
import { getActiveFileProperties } from "./lib/helpers/properties";
import { loadCodeBlocks } from "./lib/helpers/sections";
import { notify } from "./lib/helpers/ui";
import { CodeBlock } from "./lib/types";
import { createCommand } from "./lib/utils/commands";
import { PluginSettings } from "./settings";

export function createCommands(settings: PluginSettings): Command[] {
  return [
    createCommand({
      name: "Insert MFDI posts to the weekly note",
      kind: "editor",
      executor: insertMFDIPostsToWeeklyNote,
    }),
  ];
}

/**
 * MFDIでポストした内容をWeekly Reportに差し込みます
 *
 * TODO: createLinkも含めてもう少し楽にしたい
 */
async function insertMFDIPostsToWeeklyNote() {
  const description = getActiveFileProperties()?.description as string;
  if (!description) {
    notify("プロパティにdescriptionが存在しません");
    return;
  }

  const [weekBegin, weekEnd] = Array.from(
    description.matchAll(/(\d{4}-\d{2}-\d{2})/g)
  ).map((x) => x[0]);
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
  notify(`${weekBegin} ～ ${weekEnd} に作成されたノートを挿入しました`);
}
