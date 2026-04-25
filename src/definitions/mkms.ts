import type { TFile } from "obsidian";
import { getNewFileFolderPath } from "src/lib/helpers/settings";

interface Note {
  name: string;
  prefixEmoji: string | null;
  coverImagePath: string | null;
  /**
   * 判定条件に使う
   */
  pathPattern: RegExp | null;
}

function createNotes<T extends Record<string, Note>>(
  notes: {
    [K in keyof T]: T[K] & { name: K };
  },
): { [K in keyof T]: T[K] } {
  return notes;
}

// TODO:設定できるようにしたいかも?
const docDir = getNewFileFolderPath();

// 正規表現の特殊文字をエスケープ
const escapedDocDir = docDir.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const noteTypeByName = createNotes({
  "Prime note": {
    name: "Prime note",
    prefixEmoji: "📕",
    coverImagePath: `${docDir}/attachments/prime.webp`,
    pathPattern: new RegExp(`^${escapedDocDir}/📕.+\\.md$`),
  },
  "Hub note": {
    name: "Hub note",
    prefixEmoji: "📒",
    coverImagePath: `${docDir}/attachments/hub.webp`,
    pathPattern: new RegExp(`^${escapedDocDir}/📒.+\\.md$`),
  },
  "Activity note": {
    name: "Activity note",
    prefixEmoji: "📜",
    coverImagePath: `${docDir}/attachments/activity.webp`,
    pathPattern: new RegExp(`^${escapedDocDir}/📜.+\\.md$`),
  },
  "Troubleshooting note": {
    name: "Troubleshooting note",
    prefixEmoji: "📝",
    coverImagePath: `${docDir}/attachments/troubleshooting.webp`,
    pathPattern: new RegExp(`^${escapedDocDir}/📝.+\\.md$`),
  },
  "Report note": {
    name: "Report note",
    prefixEmoji: "📰",
    coverImagePath: `${docDir}/attachments/report.webp`,
    pathPattern: new RegExp(`^${escapedDocDir}/📰.+\\.md$`),
  },
  "Brain note": {
    name: "Brain note",
    prefixEmoji: "🧠",
    coverImagePath: `${docDir}/attachments/brain.webp`,
    pathPattern: new RegExp(`^${escapedDocDir}/🧠.+\\.md$`),
  },
  "Article note": {
    name: "Article note",
    prefixEmoji: "📘",
    coverImagePath: null,
    pathPattern: /^📘Articles\/📘.+\.md$/,
  },
  "My note": {
    name: "My note",
    prefixEmoji: "🦉",
    coverImagePath: `${docDir}/attachments/mynote.webp`,
    pathPattern: /^.+\/🦉.+\.md$/,
  },
  "Series note": {
    name: "Series note",
    prefixEmoji: "📗",
    coverImagePath: null,
    pathPattern: /^.+\/📗.+\.md$/,
  },
  "Rule note": {
    name: "Rule note",
    prefixEmoji: "📓",
    coverImagePath: `${docDir}/attachments/rule.webp`,
    pathPattern: new RegExp(`^${escapedDocDir}/📓.+\\.md$`),
  },
  "ADR note": {
    name: "ADR note",
    prefixEmoji: "💿",
    coverImagePath: null,
    pathPattern: /^💿ADR\/💿.+\.md$/,
  },
  "Weekly report": {
    name: "Weekly report",
    prefixEmoji: "📰",
    coverImagePath: "📰Weekly Report/attachments/cover.jpg",
    pathPattern: /^📰Weekly Report\/.+\.md$/,
  },
  "Daily note": {
    name: "Daily note",
    prefixEmoji: null,
    coverImagePath: null,
    pathPattern: /^_Privates\/Daily Notes\/.+\.md$/,
  },
  // WARN: この2つは最後に判定しないと無理
  "Glossary note": {
    name: "Glossary note",
    prefixEmoji: null,
    coverImagePath: `${docDir}/attachments/glossary.webp`,
    pathPattern: new RegExp(`^${escapedDocDir}/[^にをすむ]+\\.md$`),
  },
  "Procedure note": {
    name: "Procedure note",
    prefixEmoji: null,
    coverImagePath: `${docDir}/attachments/procedure.webp`,
    pathPattern: new RegExp(`^${escapedDocDir}/.+\\.md$`),
  },
} as const);

export type NoteType = (typeof noteTypeByName)[keyof typeof noteTypeByName];

/**
 * ファイルに適切なノートタイプを返却します。該当するものがなかった場合はnullを返します。
 */
export function findNoteType(file: TFile): NoteType | null {
  return findNoteTypeBy({ path: file.path });
}

/**
 * ファイルに適切なノートタイプを返却します。該当するものがなかった場合はnullを返します。
 */
export function findNoteTypeBy(args: {
  path: string;
}): NoteType | null {
  return (
    Object.values(noteTypeByName).find((x) => {
      if (x.pathPattern != null && !args.path.match(x.pathPattern)) {
        return false;
      }
      return true;
    }) ?? null
  );
}

/**
 * ノートタイプの名称からノートタイプを取得します。
 */
export function getNoteType<TN extends NoteType["name"]>(
  typeName: TN,
): (typeof noteTypeByName)[TN] {
  return noteTypeByName[typeName];
}
