import type { Command } from "obsidian";
import { addPermalinkProperty } from "./commands/add-permalink-property";
import { addPropertySuitably } from "./commands/add-property-suitably";
import { cleanOldDailyNotes } from "./commands/clean-old-daily-notes";
import { copyActiveFileFullPath } from "./commands/copy-active-file-full-path";
import { copyActiveImageFileToClipboard } from "./commands/copy-active-image-file-to-clipboard";
import { copyAsConfluence } from "./commands/copy-as-confluence";
import { copyAsSlack } from "./commands/copy-as-slack";
import { copyMinervaURL } from "./commands/copy-minerva-url";
import { copyStripLinksAndDecorations } from "./commands/copy-strip-links-and-decorations";
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
import { createNewNoteHorizontally } from "./commands/create-new-note-horizontally";
import { createNewNoteVertically } from "./commands/create-new-note-vertically";
import { createObsidianCookbook } from "./commands/create-obsidian-cookbook";
import { createPrimeNote } from "./commands/create-prime-note";
import { createReportNote } from "./commands/create-report-note";
import { createTDQ } from "./commands/create-tdq";
import { createTroubleshootingNote } from "./commands/create-troubleshooting-note";
import { cycleBulletCheckbox } from "./commands/cycle-bullet-checkbox";
import { deleteActiveFile } from "./commands/delete-active-file";
import { fixLink } from "./commands/fix-link";
import { formatTable } from "./commands/format-table";
import { insertBlueskyPostsToWeeklyNote } from "./commands/insert-bluesky-posts-to-weekly-note";
import { insertNewNotesToWeeklyNote } from "./commands/insert-inputs-to-weekly-note";
import { insertMOC } from "./commands/insert-moc";
import { insertNoteCard } from "./commands/insert-note-card";
import { moveToNextInspection } from "./commands/move-to-next-inspection";
import { moveToNextWorkspace } from "./commands/move-to-next-workspace";
import { moveToPreviousInspection } from "./commands/move-to-previous-inspection";
import { openActiveFileInYazi } from "./commands/open-active-file-in-yazi";
import { openActiveFolderInTerminal } from "./commands/open-active-folder-in-terminal";
import { openPropertyUrl } from "./commands/open-property-url";
import { openVaultInLazygit } from "./commands/open-vault-in-lazygit";
import { openVaultInTerminal } from "./commands/open-vault-in-terminal";
import { pasteClipboardAsAVIF } from "./commands/paste-clipboard-as-avif";
import { pasteClipboardAsWebp } from "./commands/paste-clipboard-as-webp";
import { pasteSiteCard } from "./commands/paste-site-card";
import { pasteURLToSiteLink } from "./commands/paste-url-to-site-link";
import { saveWith } from "./commands/save-with";
import { showFileInfo } from "./commands/show-file-info";
import { stripLinksAndDecorations } from "./commands/strip-links-and-decorations";
import { summarizeDescription } from "./commands/summarize-description";
import { toggleLivePreview } from "./commands/toggle-live-preview";
import { transformMOC } from "./commands/transform-moc";
import { transformToV2OGPCard } from "./commands/transform-v2-card";
import { updateChangeLog } from "./commands/update-change-log";
import { updateMOCSuitably } from "./commands/update-moc-suitably";
import { path2LinkText } from "./lib/helpers/links";
import { type CarnelianCommand, createCommand } from "./lib/obsutils/commands";
import type { PluginSettings } from "./settings";

function createCarnelianCommands(settings: PluginSettings) {
  const sa = settings.all;
  const se = settings.editor;
  const sf = settings.file;

  return [
    {
      name: "Create new note horizontally",
      kind: "all",
      enabled: sa?.["Create new note horizontally"],
      executor: createNewNoteHorizontally,
    },
    {
      name: "Create new note vertically",
      kind: "all",
      enabled: sa?.["Create new note vertically"],
      executor: createNewNoteVertically,
    },
    {
      name: "Save with",
      kind: "all",
      enabled: se?.["Save with"],
      executor: () => {
        saveWith({ lint: settings.linter, format: true });
      },
    },
    {
      name: "Move to next workspace",
      kind: "all",
      enabled: sa?.["Move to next workspace"],
      executor: moveToNextWorkspace,
    },
    {
      name: "Cycle bullet/checkbox",
      kind: "editor",
      enabled: se?.["Cycle bullet/checkbox"],
      executor: cycleBulletCheckbox,
    },
    {
      name: "Delete active file",
      kind: "file",
      enabled: sf?.["Delete active file"],
      executor: deleteActiveFile,
    },
    {
      name: "Toggle Live preview",
      kind: "all",
      enabled: sa?.["Toggle Live preview"],
      executor: toggleLivePreview,
    },
    {
      name: "Paste clipboard as WebP",
      kind: "editor",
      enabled: se?.["Paste clipboard as WebP"],
      executor: pasteClipboardAsWebp,
    },
    {
      name: "Paste clipboard as AVIF",
      kind: "editor",
      enabled: se?.["Paste clipboard as AVIF"],
      executor: () =>
        pasteClipboardAsAVIF({
          quality: se?.["Paste clipboard as AVIF"]?.quality,
        }),
    },
    {
      name: "Copy as Confluence",
      kind: "editor",
      enabled: se?.["Copy as Confluence"],
      executor: () =>
        copyAsConfluence({ domain: se?.["Copy as Confluence"]?.domain }),
    },
    {
      name: "Copy as Slack",
      kind: "editor",
      enabled: se?.["Copy as Slack"],
      executor: () =>
        copyAsSlack({
          replaceRegExpMapping: se?.["Copy as Slack"]?.replaceRegExpMapping,
        }),
    },
    {
      name: "Summarize description",
      kind: "editor",
      enabled: se?.["Summarize description"],
      executor: () =>
        summarizeDescription({
          vendor: se?.["Summarize description"]?.vendor,
          property: se?.["Summarize description"]?.property,
        }),
    },
    {
      name: "Fix link",
      kind: "editor",
      enabled: se?.["Fix link"],
      executor: fixLink,
    },
    {
      name: "Move to next inspection",
      kind: "editor",
      enabled: se?.["Move to next inspection"],
      executor: moveToNextInspection,
    },
    {
      name: "Move to previous inspection",
      kind: "editor",
      enabled: se?.["Move to previous inspection"],
      executor: moveToPreviousInspection,
    },
    {
      name: "Insert new notes to the weekly note",
      kind: "editor",
      enabled: se?.["Insert new notes to the weekly note"],
      executor: insertNewNotesToWeeklyNote,
    },
    {
      name: "Insert Bluesky posts to weekly note",
      kind: "editor",
      enabled: se?.["Insert Bluesky posts to weekly note"],
      executor: insertBlueskyPostsToWeeklyNote,
    },
    {
      name: "Insert MOC",
      kind: "editor",
      enabled: se?.["Insert MOC"],
      executor: insertMOC,
    },
    {
      name: "Transform MOC",
      kind: "editor",
      enabled: se?.["Transform MOC"],
      executor: transformMOC,
    },
    {
      name: "Update MOC suitably",
      kind: "editor",
      enabled: se?.["Update MOC suitably"],
      executor: updateMOCSuitably,
    },
    {
      name: "Create an Article",
      kind: "all",
      enabled: sa?.["Create an Article"],
      executor: createArticle,
    },
    {
      name: "Paste site card",
      kind: "editor",
      enabled: se?.["Paste site card"],
      executor: pasteSiteCard,
    },
    {
      name: "Insert note card",
      kind: "editor",
      enabled: se?.["Insert note card"],
      executor: insertNoteCard,
    },
    {
      name: "Transform to v2 OGP card",
      kind: "editor",
      enabled: se?.["Transform to v2 OGP card"],
      executor: transformToV2OGPCard,
    },
    {
      name: "Paste URL to site link",
      kind: "editor",
      enabled: se?.["Paste URL to site link"],
      executor: pasteURLToSiteLink,
    },
    {
      name: "Clean old daily notes",
      kind: "all",
      enabled: sa?.["Clean old daily notes"],
      executor: cleanOldDailyNotes,
    },
    {
      name: "Create MIN ADR",
      kind: "all",
      enabled: sa?.["Create MIN ADR"],
      executor: createMINADR,
    },
    {
      name: "Create VIM ADR",
      kind: "all",
      enabled: sa?.["Create VIM ADR"],
      executor: createVIMADR,
    },
    {
      name: "Create PRO ADR",
      kind: "all",
      enabled: sa?.["Create PRO ADR"],
      executor: createPROADR,
    },
    {
      name: "Create OBS ADR",
      kind: "all",
      enabled: sa?.["Create OBS ADR"],
      executor: createOBSADR,
    },
    {
      name: "Create Prime note",
      kind: "editor",
      enabled: se?.["Create Prime note"],
      executor: createPrimeNote,
    },
    {
      name: "Create Activity note",
      kind: "editor",
      enabled: se?.["Create Activity note"],
      executor: createActivityNote,
    },
    {
      name: "Create Hub note",
      kind: "editor",
      enabled: se?.["Create Hub note"],
      executor: createHubNote,
    },
    {
      name: "Create Report note",
      kind: "editor",
      enabled: se?.["Create Report note"],
      executor: createReportNote,
    },
    {
      name: "Create Brain note",
      kind: "editor",
      enabled: se?.["Create Brain note"],
      executor: createBrainNote,
    },
    {
      name: "Create Troubleshooting notes",
      kind: "editor",
      enabled: se?.["Create Trouble Shooting note"],
      executor: createTroubleshootingNote,
    },
    {
      name: "Create Obsidian逆引きレシピ",
      kind: "all",
      enabled: se?.["Create Obsidian逆引きレシピ"],
      executor: createObsidianCookbook,
    },
    {
      name: "Create TDQ",
      kind: "editor",
      enabled: se?.["Create TDQ"],
      executor: createTDQ,
    },
    {
      name: "Create MTG note",
      kind: "editor",
      enabled: se?.["Create MTG note"],
      executor: createMtgNote,
    },

    {
      name: "Add property suitably",
      kind: "editor",
      enabled: se?.["Add property suitably"],
      executor: addPropertySuitably,
    },
    {
      name: "Add permalink property",
      kind: "editor",
      enabled: se?.["Add permalink property"],
      executor: () =>
        addPermalinkProperty({
          vendor: se?.["Add permalink property"]?.vendor,
        }),
    },
    {
      name: "Format table",
      kind: "editor",
      enabled: se?.["Format table"],
      executor: formatTable,
    },
    {
      name: "Strip links and decorations",
      kind: "editor",
      enabled: se?.["Strip links and decorations"],
      executor: stripLinksAndDecorations,
    },
    {
      name: "Copy Strip links and decorations",
      kind: "editor",
      enabled: se?.["Copy Strip links and decorations"],
      executor: copyStripLinksAndDecorations,
    },
    {
      name: "Copy Minerva URL",
      kind: "editor",
      enabled: se?.["Copy Minerva URL"],
      executor: copyMinervaURL,
    },
    {
      name: "Copy url property",
      kind: "editor",
      enabled: se?.["Copy url property"],
      executor: copyUrlProperty,
    },
    {
      name: "Open property URL",
      kind: "editor",
      enabled: se?.["Open property URL"],
      executor: openPropertyUrl,
    },

    {
      name: "Open active folder in terminal",
      kind: "all",
      enabled: sa?.["Open active folder in terminal"],
      executor: openActiveFolderInTerminal,
    },
    {
      name: "Open vault in terminal",
      kind: "all",
      enabled: sa?.["Open vault in terminal"],
      executor: openVaultInTerminal,
    },
    {
      name: "Open vault in Lazygit",
      kind: "all",
      enabled: sa?.["Open vault in lazygit"],
      executor: openVaultInLazygit,
    },
    {
      name: "Open active file in yazi",
      kind: "all",
      enabled: sa?.["Open active file in yazi"],
      executor: openActiveFileInYazi,
    },
    {
      name: "Copy active file full path",
      kind: "file",
      enabled: sf?.["Copy active file full path"],
      executor: copyActiveFileFullPath,
    },
    {
      name: "Copy active image file to clipboard",
      kind: "file",
      enabled: sf?.["Copy active image file to clipboard"],
      executor: copyActiveImageFileToClipboard,
    },
    {
      name: "Show File info",
      kind: "file",
      enabled: sf?.["Show File info"],
      executor: showFileInfo,
    },
    {
      name: "Update change log",
      kind: "editor",
      enabled: se?.["Update change log"],
      executor: updateChangeLog,
    },
    {
      name: "test",
      kind: "editor",
      enabled: true,
      executor: () => {
        console.log(path2LinkText("Notes/TypeScript.md")!);
      },
    },
  ] as const satisfies (CarnelianCommand & { enabled: unknown })[];
}

export function createCommands(settings: PluginSettings): Command[] {
  return createCarnelianCommands(settings)
    .filter((x) => x.enabled)
    .map(createCommand);
}
