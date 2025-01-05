import type { UApp, ULinkCache } from "../types";
import { map } from "../utils/types";
import { getActiveFile, getFileByPath } from "./entries";
import { getMetadataCache } from "./metadata";

declare let app: UApp;

/**
 * 現在ファイルにおける ファイルパスごとのバックリンクリストを取得します
 */
export function getActiveFileBacklinksByFilePath(): {
  [path: string]: ULinkCache[];
} | null {
  return map(
    getActiveFile(),
    (f) => app.metadataCache.getBacklinksForFile(f).data,
  );
}

/**
 * 現在ファイルにおけるバックリンクのパスを取得します
 *
 * ```ts
 * getActiveFileBacklinkPaths()
 * // ["Notes/backlink1.md", "Notes/backlink2.md"]
 * ```
 */
export function getActiveFileBacklinkPaths(): string[] {
  return Object.keys(getActiveFileBacklinksByFilePath() ?? {});
}

/**
 * リンクテキストからファイルパスを取得します
 *
 * ```ts
 * linkText2Path("[[Obsidian]]")
 * // "Notes/Obsidian.md"
 * linkText2Path("Obsidian")
 * // "Notes/Obsidian.md"
 * linkText2Path("Obsidian.md")
 * // "Notes/Obsidian.md"
 * ```
 */
export function linkText2Path(linkText: string): string | null {
  return map(
    getActiveFile(),
    (f) =>
      getMetadataCache().getFirstLinkpathDest(linkText, f.path)?.path ?? null,
  );
}

/**
 * ファイルパスからリンクテキストを取得します
 *
 * ```ts
 * path2LinkText("Notes/Obsidian.md")
 * // "[[Obsidian]]"
 * ```
 */
export function path2LinkText(path: string): string | null {
  const dstFile = getFileByPath(path);
  const activeFile = getActiveFile();
  if (!dstFile || !activeFile) {
    return null;
  }

  return app.fileManager.generateMarkdownLink(dstFile, activeFile.path);
}
