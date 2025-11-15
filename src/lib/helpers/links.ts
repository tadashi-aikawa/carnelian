import type { LinkToken, UApp, ULinkCache } from "../types";
import { map } from "../utils/guard";
import { getActiveEditor, offsetToPos } from "./editors/basic";
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
 * ファイルの未解決リンクを{ノート名: 出現数}のマッピングオブジェクトで取得します
 * キャッシュに存在しない場合はnullを返します
 *
 * ```ts
 * getUnresolvedLinkMap("Obsidian.md")
 * // { "Minerva": 2, "Carnelian": 3 }
 * ```
 */
export function getUnresolvedLinkMap(filePath: string): {
  [name: string]: number;
} | null {
  return app.metadataCache.unresolvedLinks[filePath] ?? null;
}

/**
 * リンクテキストからファイルパスを取得します
 *
 * ```ts
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

/**
 * 現在のエディタのオフセット位置にあるリンクトークンを取得します
 *
 * ```ts
 * getlinkTokenAtOffset(10)
 * // { type: "internal-link", text: "内部リンク (Obsidian)", displayText: "内部リンク" }
 * ```
 */
export function getLinkTokenAtOffset(offset: number): LinkToken | null {
  const editor = getActiveEditor();
  const position = offsetToPos(offset);
  return position && editor ? editor.getClickableTokenAt(position) : null;
}
