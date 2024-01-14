import { Command } from "obsidian";
import { addTagsProperty } from "./commands/add-tags-property";
import { cleanOldDailyNotes } from "./commands/clean-old-daily-notes";
import { copyMinervaURL } from "./commands/copy-minerva-url";
import { createMINADR } from "./commands/create-adr";
import { createArticle } from "./commands/create-article";
import { formatTable } from "./commands/format-table";
import { insertInputsToWeeklyNote } from "./commands/insert-inputs-to-weekly-note";
import { insertMFDIPostsToWeeklyNote } from "./commands/insert-mfdi-posts-to-weekly-note";
import { insertSiteCard } from "./commands/insert-site-card";
import { insertTodaysMTG } from "./commands/insert-todays-mtg";
import { stripLinksAndDecorations } from "./commands/stripe-links-and-decorations";
import { toggleLivePreview } from "./commands/toggle-live-preview";
import { sortSelectionLines } from "./lib/helpers/editors/advanced";
import {
  toggleEditorLength,
  toggleVimKeyBindings,
} from "./lib/helpers/settings";
import {
  CarnelianCommand,
  createCommand,
  showCarnelianCommands,
} from "./lib/obsutils/commands";
import { PluginSettings } from "./settings";
import { insertMOC } from "./commands/insert-moc";
import { insertActivityNote } from "./commands/insert-activity-note";
import { copyActiveFileFullPath } from "./commands/copy-active-file-full-path";

// INFO: _settingsは使ってないけど、設定を使いたい場合はここで渡すべし
export function createCommands(_settings: PluginSettings): Command[] {
  const carnelianCommands: CarnelianCommand[] = [
    {
      name: "Add tags property",
      kind: "editor",
      executor: addTagsProperty,
      hideOnCommandList: true,
    },
    {
      name: "Insert MFDI posts to the weekly note",
      kind: "editor",
      executor: insertMFDIPostsToWeeklyNote,
    },
    {
      name: "Insert inputs to the weekly note",
      kind: "editor",
      executor: insertInputsToWeeklyNote,
    },
    {
      name: "Insert today's MTG",
      kind: "editor",
      executor: insertTodaysMTG,
    },
    {
      name: "Insert MOC",
      kind: "editor",
      executor: insertMOC,
    },
    {
      name: "Insert Activity note",
      kind: "editor",
      executor: insertActivityNote,
    },
    {
      name: "Toggle Live preview",
      kind: "all",
      executor: toggleLivePreview,
      hideOnCommandList: true,
    },
    {
      name: "Toggle Vim mode",
      kind: "all",
      executor: toggleVimKeyBindings,
    },
    {
      name: "Toggle editor length",
      kind: "all",
      executor: toggleEditorLength,
    },
    {
      name: "Create an Article",
      kind: "all",
      executor: createArticle,
    },
    {
      name: "Insert site card",
      kind: "editor",
      executor: insertSiteCard,
    },
    {
      name: "Sort selection",
      kind: "editor",
      executor: sortSelectionLines,
    },
    {
      name: "Clean old daily notes",
      kind: "all",
      executor: cleanOldDailyNotes,
    },
    {
      name: "Create MIN ADR",
      kind: "all",
      executor: createMINADR,
    },
    {
      name: "Format table",
      kind: "editor",
      executor: formatTable,
      hideOnCommandList: true,
    },
    {
      name: "Strip links and decorations",
      kind: "editor",
      executor: stripLinksAndDecorations,
      hideOnCommandList: true,
    },
    {
      name: "Copy Minerva URL",
      kind: "editor",
      executor: copyMinervaURL,
      hideOnCommandList: true,
    },
    {
      name: "Copy active file full path",
      kind: "editor",
      executor: copyActiveFileFullPath,
      hideOnCommandList: true,
    },
  ];

  const commands = carnelianCommands.map(createCommand);

  return [
    ...commands,
    createCommand({
      name: "Show Carnelian commands",
      kind: "all",
      executor: () => {
        showCarnelianCommands(carnelianCommands);
      },
    }),
  ];
}
