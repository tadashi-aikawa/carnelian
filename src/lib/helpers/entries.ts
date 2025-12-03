import dayjs, { type Dayjs } from "dayjs";
import type { Loc, TAbstractFile, TFile, TFolder } from "obsidian";
import { match } from "ts-pattern";
import { toEditorPosition, toFullPath } from "../obsutils/mapper";
import type { UApp } from "../types";
import { map, orThrow } from "../utils/guard";
import { getActiveEditor } from "./editors/basic";
import { getActiveLeaf } from "./leaves";
import { getActiveFileCache, getFileCacheByPath } from "./metadata";
import { getFileDeleteMode } from "./settings";

declare let app: UApp;

/**
 * 対応画像タイプ
 */
export const imageExtensions = [
  "png",
  "jpg",
  "jpeg",
  "gif",
  "bmp",
  "webp",
  "svg",
  "avif",
] as const;
export type ImageExtension = (typeof imageExtensions)[number];
export const imageMimeTypesByExtension = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  bmp: "image/bmp",
  webp: "image/webp",
  svg: "image/svg+xml",
  avif: "image/avif",
} as const satisfies Record<ImageExtension[number], string>;
export function extensionToMimeType(
  extension: (typeof imageExtensions)[number],
): string {
  return imageMimeTypesByExtension[extension];
}

/**
 * entryがファイルであるかを判定します
 */
export function isFile(entry: TAbstractFile): entry is TFile {
  return "stat" in entry;
}

/**
 * entryがMarkdownファイルであるかを判定します
 */
export function isMarkdownFile(entry: TAbstractFile): entry is TFile {
  return isFile(entry) && entry.extension === "md";
}

/**
 * entryがフォルダであるかを判定します
 */
export function isFolder(entry: TAbstractFile): entry is TFolder {
  return !isFile(entry);
}

/**
 * 現在のファイルを取得します
 */
export function getActiveFile(): TFile | null {
  return app.workspace.getActiveFile();
}

/**
 * 現在ファイルのフォルダを取得します
 */
export function getActiveFileFolder(): TFolder | null {
  return getActiveFile()?.parent ?? null;
}

/**
 * 現在ファイルのタイトルを取得します
 *
 * ```ts
 * getActiveFileTitle()
 * // "activeFile"
 * ```
 */
export function getActiveFileTitle(): string | null {
  return map(getActiveFile(), (af) => af.basename);
}

/**
 * 現在ファイルのパスを取得します
 *
 * ```ts
 * getActiveFilePath()
 * // "Notes/activeFile.md"
 * ```
 */
export function getActiveFilePath(): string | null {
  return map(getActiveFile(), (af) => af.path);
}

/**
 * 現在ファイルのフルパスを取得します
 *
 * ```ts
 * getActiveFilePath()
 * // "C:/Minerva/Notes/activeFile.md"
 * ```
 */
export function getActiveFileFullPath(): string | null {
  return map(getActiveFile(), (af) => toFullPath(af.path));
}

/**
 * Vaultの全ファイル一覧を取得します
 *
 * ```ts
 * getAllFiles()
 * // [TFile, TFile, ... , TFile]
 * ```
 */
export function getAllFiles(): TFile[] {
  return Object.values(getAllFilesByPath());
}

/**
 * Vault内の全ファイルをVault rootからの相対パスをキーとしたMapで取得します
 *
 * ```ts
 * getAllFilesByPath()
 * // { "Notes/hoge.md": TFile, "Notes/hoga.md": TFile, ... }
 * ```
 */
export function getAllFilesByPath(): { [path: string]: TFile } {
  return app.vault.fileMap;
}

/**
 * Vaultのマークダウンファイル一覧を取得します
 *
 * ```ts
 * getAllMarkdownFiles()
 * // [TFile, TFile, ... , TFile]
 * ```
 */
export function getMarkdownFiles(): TFile[] {
  return app.vault.getMarkdownFiles();
}

/**
 * Vaultのマークダウンファイル一覧を最近アクセスした順を付与して取得します
 */
export function getMarkdownFilesWithRecentAccessIndex(): {
  file: TFile;
  lastAccessIndex?: number;
}[] {
  const lastOpenFileIndexByPath: { [path: string]: number } = {};
  app.workspace.getLastOpenFiles().forEach((v, i) => {
    lastOpenFileIndexByPath[v] = i;
  });

  return getMarkdownFiles().map((file) => ({
    file,
    lastAccessIndex: lastOpenFileIndexByPath[file.path],
  }));
}

/**
 * 期間内に作成されたマークダウンファイル一覧を取得します
 * beginは境界値を含み、endは境界値を含みません
 */
export function getMarkdownFilesInRange(begin: Dayjs, end: Dayjs): TFile[] {
  return getMarkdownFiles().filter((x) => {
    // stat.ctimeはミリ秒、Dayjsは秒 なので単位の違いに注意
    const ctimeSec = x.stat.ctime / 1000;
    return ctimeSec >= begin.unix() && ctimeSec < end.unix();
  });
}

/**
 * パスからファイルを取得します
 * 存在しないパスの場合はnullを返却します
 */
export function getFileByPath(path: string): TFile | null {
  const abstractFile = app.vault.getAbstractFileByPath(path);
  if (!abstractFile) {
    return null;
  }

  // TFolderになる可能性は?
  return abstractFile as TFile;
}

/**
 * ファイルを作成します
 *
 * ```ts
 * await createFile("Notes/mimizou.md", "みみぞうとはフクロウのぬいぐるみです")
 * ```
 */
export function createFile(path: string, data = ""): Promise<TFile> {
  return app.vault.create(path, data);
}

/**
 * リンクテキストからMarkdownファイルを作成します。作成フォルダは設定に準拠します。
 *
 * ```ts
 * await createNewMarkdownFile("title") // title.mdで作成
 * ```
 */
export function createNewMarkdownFile(linkText: string): Promise<TFile> {
  return app.fileManager.createNewMarkdownFileFromLinktext(linkText);
}

/**
 * 関連リンクを変更せずに関連ファイルをリネームします
 *
 * ```ts
 * await renameFileWithoutLinkModified("Notes/mimizou.md", "Notes/mimizou2.md")
 * await renameFileWithoutLinkModified("Notes/mimizou.md", "../vaultの親のmimizou.md")
 * ```
 */
export async function renameFileWithoutLinkModified(
  path: string,
  dst: string,
): Promise<void> {
  await app.vault.adapter.rename(path, dst);
}

/**
 * Trash > Deleted files の設定に従ってファイルを削除します
 * ```ts
 * await deleteFile(getFileByPath("Notes/hoge.md")!)
 * ```
 */
export async function deleteFile(file: TFile): Promise<void> {
  await match(getFileDeleteMode())
    .with("system", () => app.vault.trash(file, true))
    .with("local", () => app.vault.trash(file, false))
    .with("none", () => app.vault.delete(file))
    .exhaustive();
}

/**
 * 現在のファイルを削除します
 * タブグループが空になった場合はタブグループも閉じます
 * TODO: deleteFileと統一する?
 */
export async function deleteActiveFile(): Promise<void> {
  await orThrow(getActiveFile(), deleteFile, { message: "ActiveFile is null" });

  // リーフの親はタブグループ想定なので、子が1つだけなら閉じる
  const parent = getActiveLeaf()?.parent ?? null;
  if (parent?.children?.length === 1) {
    parent.detach();
  }
}

/**
 * ファイルを開きます
 *
 * ```ts
 * // 現在のLeaf(タブ)で開く
 * await openFile("Notes/hoge.md")
 * // 新しいLeaf(タブ)で開く
 * await openFile("Notes/hoge.md", { newLeaf: true })
 * // 垂直分割で新しいLeaf(タブ)で開く
 * await openFile("Notes/hoge.md", { splitVertical: true })
 * ```
 */
export function openFile(
  path: string,
  option?: { newLeaf?: boolean; splitVertical?: boolean },
): Promise<void> {
  const leaf = match(option)
    .with({ newLeaf: true }, () => "tab" as const)
    .with({ splitVertical: true }, () => "split" as const)
    .otherwise(() => false);

  return app.workspace.openLinkText("", path, leaf);
}

/**
 * タイトルから新しいMarkdownファイルを作成して開きます
 * ファイル作成フォルダは設定に準拠します
 *
 * ```ts
 * await openNewMarkdownFile("title") // title.mdで作成して開く
 * await openNewMarkdownFile() // デフォルトタイトルで作成して開く
 * ```
 */
export function openNewMarkdownFile(title?: string): Promise<TFile> {
  return app.fileManager.createAndOpenMarkdownFile(title);
}

/**
 * ファイルの最後にテキストを追記します
 *
 * ```ts
 * // 最後に新しくhogehogeの行を追加
 * await appendTextToFile("hogehoge")
 * ```
 */
export async function appendTextToFile(
  path: string,
  text: string,
): Promise<void> {
  await app.vault.adapter.append(path, text);
}

/**
 * ファイルキャッシュの中身(テキスト)を取得します
 *
 * ```ts
 * await loadFileContent("Notes/Obsidian.md")
 * // "Obsidianは最高のマークダウンエディタである\n完"
 * await loadFileContent("Notes/Obsidian.md", { start: { offset: 1 }, end: { offset: 10 } })
 * // "bsidianは最"
 * ```
 */
export async function loadFileContentCache(
  path: string,
  position?: {
    start: Pick<Loc, "offset">;
    end: Pick<Loc, "offset">;
  },
): Promise<string | null> {
  const f = getFileByPath(path);
  if (!f) {
    return null;
  }

  const text = await app.vault.cachedRead(f);
  return position
    ? text.slice(position.start.offset, position.end.offset)
    : text;
}

/**
 * ファイルキャッシュの本文(frontmatter以外)を取得します
 *
 * ```ts
 * await loadFileBodyCache("Notes/Obsidian.md")
 * // "Obsidianは最高のマークダウンエディタである\n完"
 * ```
 */
export async function loadFileBodyCache(path: string): Promise<string | null> {
  const cache = getFileCacheByPath(path);
  if (!cache) {
    return null;
  }

  const content = await loadFileContentCache(path);
  if (content == null) {
    return null;
  }

  const frontmatterEndOffset = cache.frontmatterPosition?.end.offset;
  return frontmatterEndOffset
    ? content.slice(frontmatterEndOffset + 1)
    : content;
}

/**
 * 現在ファイルの中身を取得します
 *
 * ```ts
 * await getActiveFileContent()
 * // "Obsidianは最高のマークダウンエディタである\n完"
 * await getActiveFileContent({ start: { offset: 1 }, end: { offset: 10 } })
 * // "bsidianは最"
 * ```
 */
export function getActiveFileContent(position?: {
  start: Omit<Loc, "offset">;
  end: Omit<Loc, "offset">;
}): string | null {
  const editor = getActiveEditor();
  if (!editor) {
    return null;
  }

  if (!position) {
    return editor.getValue();
  }

  return editor.getRange(
    toEditorPosition(position.start),
    toEditorPosition(position.end),
  );
}

/**
 * 現在ファイルの本文(frontmatter以外)を取得します
 */
export function getActiveFileBody(): string | null {
  const content = getActiveFileContent();
  if (content == null) {
    return null;
  }

  const frontmatterEndOffset =
    getActiveFileCache()?.frontmatterPosition?.end.offset ?? 0;

  return content.slice(frontmatterEndOffset);
}

/**
 * 現在ファイルの作成日時を取得します
 *
 * ```ts
 * getCreationDate("YYYY-MM-DD")
 * // "2023-11-06"
 * getCreationDate("unixtime")
 * // 1699259384
 * getCreationDate("dayjs")
 * ```
 */
export function getCreationDate(
  format: string | "unixtime" | "dayjs",
): string | number | Dayjs | null {
  return map(getActiveFile()?.stat.ctime, (unixtime) => {
    switch (format) {
      case "unixtime":
        return unixtime;
      case "dayjs":
        return dayjs(unixtime);
      default:
        return dayjs(unixtime).format(format);
    }
  });
}

/**
 * 現在ファイルの更新日時を取得します
 *
 * ```ts
 * getUpdateDate("YYYY-MM-DD")
 * // "2023-11-06"
 * getUpdateDate("unixtime")
 * // 1699259384
 * getUpdateDate("dayjs")
 * ```
 */
export function getUpdateDate(
  format: string | "unixtime" | "dayjs",
): string | number | Dayjs | null {
  return map(getActiveFile()?.stat.mtime, (unixtime) => {
    switch (format) {
      case "unixtime":
        return unixtime;
      case "dayjs":
        return dayjs(unixtime);
      default:
        return dayjs(unixtime).format(format);
    }
  });
}
