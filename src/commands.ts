import type { Command } from "obsidian";

import { addPermalinkProperty } from "./commands/add-permalink-property";
import { addPropertySuitably } from "./commands/add-property-suitably";
import { cleanOldDailyNotes } from "./commands/clean-old-daily-notes";
import { copyActiveFileFullPath } from "./commands/copy-active-file-full-path";
import { copyActiveImageFileToClipboard } from "./commands/copy-active-image-file-to-clipboard";
import { copyAsConfluence } from "./commands/copy-as-confluence";
import { copyAsSlack } from "./commands/copy-as-slack";
import { copyMinervaURL } from "./commands/copy-minerva-url";
import { copyUrlProperty } from "./commands/copy-url-property";
import { createActivityNote } from "./commands/create-activity-note";
import {
  createMINADR,
  createOBSADR,
  createPROADR,
  createVIMADR,
} from "./commands/create-adr";
import { createArticle } from "./commands/create-article";
import { createBrainNote } from "./commands/create-brain-note";
import { createHubNote } from "./commands/create-hub-note";
import { createMtgNote } from "./commands/create-mtg-note";
import { createObsidianCookbook } from "./commands/create-obsidian-cookbook";
import { createPrimeNote } from "./commands/create-prime-note";
import { createReportNote } from "./commands/create-report-note";
import { createTDQ } from "./commands/create-tdq";
import { createTroubleshootingNote } from "./commands/create-troubleshooting-note";
import { fixLink } from "./commands/fix-link";
import { formatTable } from "./commands/format-table";
import { insertBlueskyPostsToWeeklyNote } from "./commands/insert-bluesky-posts-to-weekly-note";
import { insertNewNotesToWeeklyNote } from "./commands/insert-inputs-to-weekly-note";
import { insertMOC } from "./commands/insert-moc";
import { insertNoteCard } from "./commands/insert-note-card";
import { moveToNextInspection } from "./commands/move-to-next-inspection";
import { moveToPreviousInspection } from "./commands/move-to-previous-inspection";
import { openActiveFolderInTerminal } from "./commands/open-active-folder-in-terminal";
import { openPropertyUrl } from "./commands/open-property-url";
import { openVaultInTerminal } from "./commands/open-vault-in-terminal";
import { pasteClipboardAs } from "./commands/paste-clipboard-to-webp";
import { pasteSiteCard } from "./commands/paste-site-card";
import { pasteURLToSiteLink } from "./commands/paste-url-to-site-link";
import { showAnotherCommandPalette } from "./commands/show-another-command-palette";
import { showFileInfo } from "./commands/show-file-info";
import { stripLinksAndDecorations } from "./commands/stripe-links-and-decorations";
import { summarizeDescription } from "./commands/summarize-description";
import { toggleLivePreview } from "./commands/toggle-live-preview";
import { transformMOC } from "./commands/transform-moc";
import { transformToV2OGPCard } from "./commands/transform-v2-card";
import { updateChangeLog } from "./commands/update-change-log";
import { toggleEditorLength } from "./lib/helpers/settings";
import { type CarnelianCommand, createCommand } from "./lib/obsutils/commands";
import type { PluginSettings } from "./settings";

function createCarnelianCommands(settings: PluginSettings) {
  return [
    {
      name: "Paste clipboard as WebP",
      kind: "editor",
      enabled: settings.editor?.image?.webp?.paste,
      executor: () => pasteClipboardAs({ format: "webp" }),
    },
    {
      name: "Paste clipboard as AVIF",
      kind: "editor",
      enabled: settings.editor?.image?.avif?.paste,
      executor: () => pasteClipboardAs({ format: "avif", quality: 35 }),
    },
    {
      name: "Paste clipboard as AVIF 1920",
      kind: "editor",
      enabled: settings.editor?.image?.avif?.paste,
      executor: () =>
        pasteClipboardAs({ format: "avif", quality: 35, resize: "1920x" }),
    },
    {
      name: "Copy as Confluence",
      kind: "editor",
      enabled: settings.confluence?.domain,
      executor: () => copyAsConfluence(settings),
    },
    {
      name: "Copy as Slack",
      kind: "editor",
      enabled: settings.slack,
      executor: () => copyAsSlack(settings),
    },
    {
      name: "Summarize description",
      kind: "editor",
      enabled: settings.ai?.property?.summarize,
      executor: () => summarizeDescription(settings),
    },
    {
      name: "Fix link",
      kind: "editor",
      enabled: settings.editor?.link?.fix,
      executor: fixLink,
    },
    {
      name: "Move to next inspection",
      kind: "editor",
      enabled: settings.linter,
      executor: moveToNextInspection,
    },
    {
      name: "Move to previous inspection",
      kind: "editor",
      enabled: settings.linter,
      executor: moveToPreviousInspection,
    },
    {
      name: "Insert new notes to the weekly note",
      kind: "editor",
      enabled: settings.editor?.weeklyNote?.newNotes,
      executor: insertNewNotesToWeeklyNote,
    },
    {
      name: "Insert Bluesky posts to weekly note",
      kind: "editor",
      enabled: settings.editor?.weeklyNote?.blueskyPosts,
      executor: insertBlueskyPostsToWeeklyNote,
    },
    {
      name: "Insert MOC",
      kind: "editor",
      enabled: settings.editor?.moc?.insert,
      executor: insertMOC,
    },
    {
      name: "Transform MOC",
      kind: "editor",
      enabled: settings.editor?.moc?.fix,
      executor: transformMOC,
    },
    {
      name: "Toggle editor length",
      kind: "all",
      enabled: settings.editor?.toggle?.length,
      executor: toggleEditorLength,
    },
    {
      name: "Create an Article",
      kind: "all",
      enabled: settings.file?.create?.article,
      executor: createArticle,
    },
    {
      name: "Paste site card",
      kind: "editor",
      enabled: settings.editor?.card?.site?.paste,
      executor: pasteSiteCard,
    },
    {
      name: "Insert note card",
      kind: "editor",
      enabled: settings.editor?.card?.note?.insert,
      executor: insertNoteCard,
    },
    {
      name: "Transform to v2 OGP card",
      kind: "editor",
      enabled: settings.editor?.card?.fix,
      executor: transformToV2OGPCard,
    },
    {
      name: "Paste URL to site link",
      kind: "editor",
      enabled: settings.editor?.link?.paste,
      executor: pasteURLToSiteLink,
    },
    {
      name: "Clean old daily notes",
      kind: "all",
      enabled: settings.file?.delete?.oldDailyNotes,
      executor: cleanOldDailyNotes,
    },
    {
      name: "Create MIN ADR",
      kind: "all",
      enabled: settings.file?.create?.adr?.min,
      executor: createMINADR,
    },
    {
      name: "Create VIM ADR",
      kind: "all",
      enabled: settings.file?.create?.adr?.vim,
      executor: createVIMADR,
    },
    {
      name: "Create PRO ADR",
      kind: "all",
      enabled: settings.file?.create?.adr?.pro,
      executor: createPROADR,
    },
    {
      name: "Create OBS ADR",
      kind: "all",
      enabled: settings.file?.create?.adr?.obs,
      executor: createOBSADR,
    },
    {
      name: "Create Prime note",
      kind: "editor",
      enabled: settings.file?.create?.prime,
      executor: createPrimeNote,
    },
    {
      name: "Create Activity note",
      kind: "editor",
      enabled: settings.file?.create?.article,
      executor: createActivityNote,
    },
    {
      name: "Create Hub note",
      kind: "editor",
      enabled: settings.file?.create?.hub,
      executor: createHubNote,
    },
    {
      name: "Create Report note",
      kind: "editor",
      enabled: settings.file?.create?.report,
      executor: createReportNote,
    },
    {
      name: "Create Brain note",
      kind: "editor",
      enabled: settings.file?.create?.brain,
      executor: createBrainNote,
    },
    {
      name: "Create Troubleshooting notes",
      kind: "editor",
      enabled: settings.file?.create?.troubleShooting,
      executor: createTroubleshootingNote,
    },
    {
      name: "Create Obsidian逆引きレシピ",
      kind: "all",
      enabled: settings.file?.create?.obsidianCookbook,
      executor: createObsidianCookbook,
    },
    {
      name: "Create TDQ",
      kind: "editor",
      enabled: settings.file?.create?.tdq,
      executor: createTDQ,
    },
    {
      name: "Create MTG note",
      kind: "editor",
      enabled: settings.file?.create?.mtg,
      executor: createMtgNote,
    },
    {
      name: "Add property suitably",
      kind: "editor",
      enabled: settings.editor?.property?.suitably,
      executor: addPropertySuitably,
    },
    {
      name: "Add permalink property",
      kind: "editor",
      enabled: settings.ai?.property?.permalink,
      executor: () => addPermalinkProperty(settings),
    },
    {
      name: "Toggle Live preview",
      kind: "all",
      enabled: settings.editor?.toggle?.livePreview,
      executor: toggleLivePreview,
    },
    {
      name: "Format table",
      kind: "editor",
      enabled: settings.editor?.table?.format,
      executor: formatTable,
    },
    {
      name: "Strip links and decorations",
      kind: "editor",
      enabled: settings.editor?.decoration?.strip,
      executor: stripLinksAndDecorations,
    },
    {
      name: "Copy Minerva URL",
      kind: "editor",
      enabled: settings.file?.copy?.minervaUrl,
      executor: copyMinervaURL,
    },
    {
      name: "Copy url property",
      kind: "editor",
      enabled: settings.editor?.property?.url?.copy,
      executor: copyUrlProperty,
    },
    {
      name: "Open property URL",
      kind: "editor",
      enabled: settings.editor?.property?.url?.open,
      executor: openPropertyUrl,
    },
    {
      name: "Open active folder in terminal",
      kind: "all",
      enabled: settings.external?.terminal,
      executor: openActiveFolderInTerminal,
    },
    {
      name: "Open vault in terminal",
      kind: "all",
      enabled: settings.external?.terminal,
      executor: openVaultInTerminal,
    },
    {
      name: "Copy active file full path",
      kind: "file",
      enabled: settings.file?.copy?.fullPath,
      executor: copyActiveFileFullPath,
    },
    {
      name: "Copy active image file to clipboard",
      kind: "file",
      enabled: settings.file?.copy?.image,
      executor: copyActiveImageFileToClipboard,
    },
    {
      name: "Update change log",
      kind: "editor",
      enabled: settings.editor?.property?.url,
      executor: updateChangeLog,
    },
    {
      name: "Show File info",
      kind: "file",
      enabled: settings.file?.show?.info,
      executor: showFileInfo,
    },
    {
      name: "Show another command palette",
      kind: "all",
      enabled: true,
      executor: () => showAnotherCommandPalette(settings),
    },
  ] as const satisfies (CarnelianCommand & { enabled: unknown })[];
}

export function createCommands(settings: PluginSettings): Command[] {
  return createCarnelianCommands(settings)
    .filter((x) => x.enabled)
    .map(createCommand);
}
