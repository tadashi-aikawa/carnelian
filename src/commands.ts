import type { Command } from "obsidian";

import { addPropertySuitably } from "./commands/add-property-suitably";
import { addTagsProperty } from "./commands/add-tags-property";
import { cleanOldDailyNotes } from "./commands/clean-old-daily-notes";
import { copyActiveFileFullPath } from "./commands/copy-active-file-full-path";
import { copyAsConfluence } from "./commands/copy-as-confluence";
import { copyMinervaURL } from "./commands/copy-minerva-url";
import { copyUrlProperty } from "./commands/copy-url-property";
import { createActivityNote } from "./commands/create-activity-note";
import { createMINADR, createVIMADR } from "./commands/create-adr";
import { createArticle } from "./commands/create-article";
import { createHubNote } from "./commands/create-hub-note";
import { createObsidianCookbook } from "./commands/create-obsidian-cookbook";
import { createPrimeNote } from "./commands/create-prime-note";
import { createReportNote } from "./commands/create-report-note";
import { createTroubleshootingNote } from "./commands/create-troubleshooting-note";
import { formatTable } from "./commands/format-table";
import { insertNewNotesToWeeklyNote } from "./commands/insert-inputs-to-weekly-note";
import { insertMFDIPostsToWeeklyNote } from "./commands/insert-mfdi-posts-to-weekly-note";
import { insertMOC } from "./commands/insert-moc";
import { insertNoteCard } from "./commands/insert-note-card";
import { insertSiteCard } from "./commands/insert-site-card";
import { insertTasksOfRelease } from "./commands/insert-tasks-of-release";
import { insertMTG } from "./commands/insert-todays-mtg";
import { openPropertyUrl } from "./commands/open-property-url";
import { pasteSiteCard } from "./commands/paste-site-card";
import { pasteURLToSiteLink } from "./commands/paste-url-to-site-link";
import { showAnotherCommandPalette } from "./commands/show-another-command-palette";
import { stripLinksAndDecorations } from "./commands/stripe-links-and-decorations";
import { toggleLivePreview } from "./commands/toggle-live-preview";
import { transformMOC } from "./commands/transform-moc";
import { transformURLToSiteLink } from "./commands/transform-url-to-site-link";
import { updateChangeLog } from "./commands/update-change-log";
import { sortSelectionLines } from "./lib/helpers/editors/advanced";
import {
  toggleEditorLength,
  toggleVimKeyBindings,
} from "./lib/helpers/settings";
import { type CarnelianCommand, createCommand } from "./lib/obsutils/commands";
import type { PluginSettings } from "./settings";

export function createCommands(settings: PluginSettings): Command[] {
  const carnelianCommands: CarnelianCommand[] = [
    {
      name: "Insert new notes to the weekly note",
      kind: "editor",
      executor: insertNewNotesToWeeklyNote,
    },
    {
      name: "Insert MFDI posts to weekly note",
      kind: "editor",
      executor: insertMFDIPostsToWeeklyNote,
    },
    {
      name: "Insert MTG",
      kind: "editor",
      executor: insertMTG,
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
      name: "Paste site card",
      kind: "editor",
      executor: pasteSiteCard,
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
      name: "Paste URL to site link",
      kind: "editor",
      executor: pasteURLToSiteLink,
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
      name: "Create VIM ADR",
      kind: "all",
      executor: createVIMADR,
    },
    {
      name: "Create Prime note",
      kind: "editor",
      executor: createPrimeNote,
    },
    {
      name: "Create Activity note",
      kind: "editor",
      executor: createActivityNote,
    },
    {
      name: "Create Hub note",
      kind: "editor",
      executor: createHubNote,
    },
    {
      name: "Create Report note",
      kind: "editor",
      executor: createReportNote,
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
    {
      name: "Add property suitably",
      kind: "editor",
      executor: addPropertySuitably,
    },
    {
      name: "Add tags property",
      kind: "editor",
      executor: addTagsProperty,
    },
    {
      name: "Toggle Live preview",
      kind: "all",
      executor: toggleLivePreview,
    },
    {
      name: "Format table",
      kind: "editor",
      executor: formatTable,
    },
    {
      name: "Strip links and decorations",
      kind: "editor",
      executor: stripLinksAndDecorations,
    },
    {
      name: "Copy Minerva URL",
      kind: "editor",
      executor: copyMinervaURL,
    },
    {
      name: "Copy url property",
      kind: "editor",
      executor: copyUrlProperty,
    },
    {
      name: "Open property URL",
      kind: "editor",
      executor: openPropertyUrl,
    },
    {
      name: "Copy active file full path",
      kind: "file",
      executor: copyActiveFileFullPath,
    },
    {
      name: "Update change log",
      kind: "editor",
      executor: updateChangeLog,
    },
    {
      name: "Show another command palette",
      kind: "all",
      executor: () => showAnotherCommandPalette(settings),
    },
  ];

  return carnelianCommands.map(createCommand);
}
