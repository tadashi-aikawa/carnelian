import type { TFile } from "obsidian";

interface Note {
  name: string;
  prefixEmoji: string | null;
  coverImagePath: string | null;
}

const noteTypes = [
  { name: "Glossary note", prefixEmoji: null, coverImagePath: null },
  { name: "Procedure note", prefixEmoji: null, coverImagePath: null },
  {
    name: "Prime note",
    prefixEmoji: "📕",
    coverImagePath: "Notes/attachments/prime.webp",
  },
  {
    name: "Hub note",
    prefixEmoji: "📒",
    coverImagePath: "Notes/attachments/hub.webp",
  },
  {
    name: "Activity note",
    prefixEmoji: "📜",
    coverImagePath: "Notes/attachments/activity.webp",
  },
  {
    name: "Troubleshooting note",
    prefixEmoji: "📝",
    coverImagePath: "Notes/attachments/troubleshooting.webp",
  },
  {
    name: "Article note",
    prefixEmoji: "📘",
    coverImagePath: null,
  },
  {
    name: "Report note",
    prefixEmoji: "📰",
    coverImagePath: "Notes/attachments/report.webp",
  },
] as const satisfies Note[];

export type NoteType = (typeof noteTypes)[number];

/**
 * ファイルに適切なノートタイプを返却します。該当するものがなかった場合はnullを返します。
 */
export function findNoteType(file: TFile): NoteType | null {
  return (
    noteTypes.find((x) =>
      x.prefixEmoji != null ? file.name.startsWith(x.prefixEmoji) : false,
    ) ?? null
  );
}
