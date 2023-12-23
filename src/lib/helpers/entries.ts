import dayjs, { Dayjs } from "dayjs";
import { Loc, TFile } from "obsidian";
import { toEditorPosition } from "../obsutils/mapper";
import { UApp } from "../types";
import { map } from "../utils/types";
import { getActiveEditor } from "./editors/basic";

declare let app: UApp;

/**
 * パス(ファイル/ディレクトリ)が存在するかどうかを確認します
 *
 * ```ts
 * await exists("Notes/hoge.md")
 * // true
 */
export function exists(path: string): Promise<boolean> {
  return app.vault.adapter.exists(path);
}

/**
 * 現在のファイルを取得します
 */
export function getActiveFile(): TFile | null {
  return app.workspace.getActiveFile();
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
export function createFile(path: string, data: string = ""): Promise<TFile> {
  return app.vault.create(path, data);
}

/**
 * ファイルを開きます
 *
 * ```ts
 * // 現在のLeafで開く
 * await openFile("Notes/hoge.md")
 * // 新しいLeafで開く
 * await openFile("Notes/hoge.md", {newLeaf})
 * ```
 */
export function openFile(
  path: string,
  option?: { newLeaf: boolean }
): Promise<void> {
  const newLeaf = option?.newLeaf ?? false;
  return app.workspace.openLinkText("", path, newLeaf);
}

/**
 * ファイルの中身(テキスト)を取得します
 *
 * ```ts
 * await loadFileContent("Notes/Obsidian.md")
 * // "Obsidianは最高のマークダウンエディタである\n完"
 * await loadFileContent("Notes/Obsidian.md", { start: { offset: 1 }, end: { offset: 10 } })
 * // "bsidianは最"
 * ```
 */
export async function loadFileContent(
  path: string,
  position?: {
    start: Pick<Loc, "offset">;
    end: Pick<Loc, "offset">;
  }
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
    toEditorPosition(position.end)
  );
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
  format: string | "unixtime" | "dayjs"
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
  format: string | "unixtime" | "dayjs"
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
