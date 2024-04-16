import { Command } from "obsidian";

import { addPropertySuitably } from "./commands/add-property-suitably";
import { addTagsProperty } from "./commands/add-tags-property";
import { cleanOldDailyNotes } from "./commands/clean-old-daily-notes";
import { copyActiveFileFullPath } from "./commands/copy-active-file-full-path";
import { copyAsConfluence } from "./commands/copy-as-confluence";
import { copyMinervaURL } from "./commands/copy-minerva-url";
import { copyUrlProperty } from "./commands/copy-url-property";
import { createActivityNote } from "./commands/create-activity-note";
import { createMINADR } from "./commands/create-adr";
import { createArticle } from "./commands/create-article";
import { createObsidianCookbook } from "./commands/create-obsidian-cookbook";
import { createTroubleshootingNote } from "./commands/create-troubleshooting-note";
import { formatTable } from "./commands/format-table";
import { insertNewNotesToWeeklyNote } from "./commands/insert-inputs-to-weekly-note";
import { insertMOC } from "./commands/insert-moc";
import { insertNoteCard } from "./commands/insert-note-card";
import { insertSiteCard } from "./commands/insert-site-card";
import { insertTodaysMTG } from "./commands/insert-todays-mtg";
import { openPropertyUrl } from "./commands/open-property-url";
import { showAnotherCommandPalette } from "./commands/show-another-command-palette";
import { stripLinksAndDecorations } from "./commands/stripe-links-and-decorations";
import { toggleLivePreview } from "./commands/toggle-live-preview";
import { updateChangeLog } from "./commands/update-change-log";
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
import { insertTasksOfRelease } from "./commands/insert-tasks-of-release";
import { transformURLToSiteLink } from "./commands/transform-url-to-site-link";
import { transformMOC } from "./commands/transform-moc";

export function createCommands(settings: PluginSettings): Command[] {
  const carnelianCommands: CarnelianCommand[] = [
    // コマンドリストに表示する
    {
      name: "Insert new notes to the weekly note",
      kind: "editor",
      executor: insertNewNotesToWeeklyNote,
    },
    {
      name: "Insert today's MTG",
      kind: "editor",
      executor: insertTodaysMTG,
    },
    {
      name: "Insert tasks of release",
      kind: "editor",
      executor: insertTasksOfRelease,
    },
    {
      name: "Insert MOC",
      kind: "editor",
      executor: insertMOC,
    },
    {
      name: "Transform MOC",
      kind: "editor",
      executor: transformMOC,
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
      name: "Insert note card",
      kind: "editor",
      executor: insertNoteCard,
    },
    {
      name: "Transform URL to site link",
      kind: "editor",
      executor: transformURLToSiteLink,
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
      name: "Create Activity note",
      kind: "editor",
      executor: createActivityNote,
    },
    {
      name: "Create Troubleshooting notes",
      kind: "editor",
      executor: createTroubleshootingNote,
    },
    {
      name: "Create Obsidian逆引きレシピ",
      kind: "all",
      executor: createObsidianCookbook,
    },
    {
      name: "Copy as Confluence",
      kind: "editor",
      executor: () => copyAsConfluence(settings),
    },

    // コマンドリストに表示しない
    {
      name: "Add property suitably",
      kind: "editor",
      executor: addPropertySuitably,
      hideOnCommandList: true,
    },
    {
      name: "Add tags property",
      kind: "editor",
      executor: addTagsProperty,
      hideOnCommandList: true,
    },
    {
      name: "Toggle Live preview",
      kind: "all",
      executor: toggleLivePreview,
      hideOnCommandList: true,
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
      name: "Copy url property",
      kind: "editor",
      executor: copyUrlProperty,
      hideOnCommandList: true,
    },
    {
      name: "Open property URL",
      kind: "editor",
      executor: openPropertyUrl,
      hideOnCommandList: true,
    },
    {
      name: "Copy active file full path",
      kind: "file",
      executor: copyActiveFileFullPath,
      hideOnCommandList: true,
    },
    {
      name: "Update change log",
      kind: "editor",
      executor: updateChangeLog,
      hideOnCommandList: true,
    },
    {
      name: "Show another command palette",
      kind: "all",
      executor: () => showAnotherCommandPalette(settings),
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
