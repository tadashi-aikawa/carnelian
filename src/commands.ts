import type { Command } from "obsidian";

import { addPropertySuitably } from "./commands/add-property-suitably";
import { cleanOldDailyNotes } from "./commands/clean-old-daily-notes";
import { copyActiveFileFullPath } from "./commands/copy-active-file-full-path";
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
import { fixLink } from "./commands/fix-link";
import { formatTable } from "./commands/format-table";
import { insertBlueskyPostsToWeeklyNote } from "./commands/insert-bluesky-posts-to-weekly-note";
import { insertNewNotesToWeeklyNote } from "./commands/insert-inputs-to-weekly-note";
import { insertMOC } from "./commands/insert-moc";
import { insertNoteCard } from "./commands/insert-note-card";
import { insertSiteCard } from "./commands/insert-site-card";
import { moveToNextInspection } from "./commands/move-to-next-inspection";
import { moveToPreviousInspection } from "./commands/move-to-previous-inspection";
import { openPropertyUrl } from "./commands/open-property-url";
import { pasteSiteCard } from "./commands/paste-site-card";
import { pasteURLToSiteLink } from "./commands/paste-url-to-site-link";
import { showAnotherCommandPalette } from "./commands/show-another-command-palette";
import { stripLinksAndDecorations } from "./commands/stripe-links-and-decorations";
import { toggleLivePreview } from "./commands/toggle-live-preview";
import { transformMOC } from "./commands/transform-moc";
import { transformToV2OGPCard } from "./commands/transform-v2-card";
import { updateChangeLog } from "./commands/update-change-log";
import { sortSelectionLines } from "./lib/helpers/editors/advanced";
import { toggleEditorLength } from "./lib/helpers/settings";
import { type CarnelianCommand, createCommand } from "./lib/obsutils/commands";
import type { PluginSettings } from "./settings";

export function createCommands(settings: PluginSettings): Command[] {
  const carnelianCommands: CarnelianCommand[] = [
    {
      name: "Fix link",
      kind: "editor",
      executor: fixLink,
    },
    {
      name: "Move to next inspection",
      kind: "editor",
      executor: moveToNextInspection,
    },
    {
      name: "Move to previous inspection",
      kind: "editor",
      executor: moveToPreviousInspection,
    },
    {
      name: "Insert new notes to the weekly note",
      kind: "editor",
      executor: insertNewNotesToWeeklyNote,
    },
    {
      name: "Insert Bluesky posts to weekly note",
      kind: "editor",
      executor: insertBlueskyPostsToWeeklyNote,
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
      name: "Transform to v2 OGP card",
      kind: "editor",
      executor: transformToV2OGPCard,
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
      name: "Add property suitably",
      kind: "editor",
      executor: addPropertySuitably,
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
