import type { TFile } from "obsidian";

interface Note {
  name: string;
  prefixEmoji: string | null;
  coverImagePath: string | null;
}

function createNotes<T extends Record<string, Note>>(
  notes: {
    [K in keyof T]: T[K] & { name: K };
  },
): { [K in keyof T]: T[K] } {
  return notes;
}

const noteTypeByName = createNotes({
  "Glossary note": {
    name: "Glossary note",
    prefixEmoji: null,
    coverImagePath: null,
  },
  "Procedure note": {
    name: "Procedure note",
    prefixEmoji: null,
    coverImagePath: null,
  },
  "Prime note": {
    name: "Prime note",
    prefixEmoji: "📕",
    coverImagePath: "Notes/attachments/prime.webp",
  },
  "Hub note": {
    name: "Hub note",
    prefixEmoji: "📒",
    coverImagePath: "Notes/attachments/hub.webp",
  },
  "Activity note": {
    name: "Activity note",
    prefixEmoji: "📜",
    coverImagePath: "Notes/attachments/activity.webp",
  },
  "Troubleshooting note": {
    name: "Troubleshooting note",
    prefixEmoji: "📝",
    coverImagePath: "Notes/attachments/troubleshooting.webp",
  },
  "Article note": {
    name: "Article note",
    prefixEmoji: "📘",
    coverImagePath: null,
  },
  "Report note": {
    name: "Report note",
    prefixEmoji: "📰",
    coverImagePath: "Notes/attachments/report.webp",
  },
} as const);

export type NoteType = (typeof noteTypeByName)[keyof typeof noteTypeByName];

/**
 * ファイルに適切なノートタイプを返却します。該当するものがなかった場合はnullを返します。
 */
export function findNoteType(file: TFile): NoteType | null {
  return (
    Object.values(noteTypeByName).find((x) =>
      x.prefixEmoji != null ? file.name.startsWith(x.prefixEmoji) : false,
    ) ?? null
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
