import { Command } from "obsidian";

import { addDescriptionProperty } from "./commands/add-description-property";
import { addTagsProperty } from "./commands/add-tags-property";
import { addUrlProperty } from "./commands/add-url-property";
import { cleanOldDailyNotes } from "./commands/clean-old-daily-notes";
import { copyActiveFileFullPath } from "./commands/copy-active-file-full-path";
import { copyAsConfluence } from "./commands/copy-as-confluence";
import { copyMinervaURL } from "./commands/copy-minerva-url";
import { copyUrlProperty } from "./commands/copy-url-property";
import { createMINADR } from "./commands/create-adr";
import { createArticle } from "./commands/create-article";
import { createObsidianCookbook } from "./commands/create-obsidian-cookbook";
import { formatTable } from "./commands/format-table";
import { insertActivityNote } from "./commands/insert-activity-note";
import { insertInputsToWeeklyNote } from "./commands/insert-inputs-to-weekly-note";
import { insertMFDIPostsToWeeklyNote } from "./commands/insert-mfdi-posts-to-weekly-note";
import { insertMOC } from "./commands/insert-moc";
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
import { addPropertySuitably } from "./commands/add-property-suitably";
import { insertNoteCard } from "./commands/insert-note-card";

export function createCommands(settings: PluginSettings): Command[] {
  const carnelianCommands: CarnelianCommand[] = [
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
      name: "Add url property",
      kind: "editor",
      executor: addUrlProperty,
      hideOnCommandList: true,
    },
    {
      name: "Add description property",
      kind: "editor",
      executor: addDescriptionProperty,
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
      name: "Insert note card",
      kind: "editor",
      executor: insertNoteCard,
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
      name: "Create Obsidian逆引きレシピ",
      kind: "all",
      executor: createObsidianCookbook,
    },
    {
      name: "Format table",
      kind: "editor",
      executor: formatTable,
      hideOnCommandList: true,
    },
    {
      name: "Copy as Confluence",
      kind: "editor",
      executor: copyAsConfluence,
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
      name: "Copy url property",
      kind: "editor",
      executor: copyUrlProperty,
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
