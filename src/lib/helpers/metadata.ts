import type { CachedMetadata, MetadataCache } from "obsidian";
import type { UApp } from "../types";
import { map } from "../utils/guard";
import { getActiveFile, getFileByPath, imageExtensions } from "./entries";

declare let app: UApp;

export type FileInfo = {
  /** バイト数 */
  size: number;
  /** 拡張子 */
  extension?: string;
  /** 画像情報 (画像の場合) */
  image?: {
    /** 画像の幅 */
    width: number;
    /** 画像の高さ */
    height: number;
  };
};

/**
 * メタデータのキャッシュを取得します
 */
export function getMetadataCache(): MetadataCache {
  return app.metadataCache;
}

/**
 * パスからメタデータのキャッシュを取得します
 */
export function getFileCacheByPath(path: string): CachedMetadata | null {
  return map(getFileByPath(path), (p) => app.metadataCache.getFileCache(p));
}

/**
 * 現在のファイルに対するメタデータキャッシュを取得します
 */
export function getActiveFileCache(): CachedMetadata | null {
  return map(getActiveFile(), (f) => app.metadataCache.getFileCache(f));
}

/**
 * 現在のファイルの情報を取得します
 */
export async function getFileInfo(): Promise<FileInfo | null> {
  const file = getActiveFile();
  if (!file) {
    return null;
  }

  let image: FileInfo["image"];
  if (imageExtensions.find((x) => x === file.extension)) {
    const res = await fetch(app.vault.getResourcePath(file));
    const bitmap = await createImageBitmap(await res.blob());
    image = { width: bitmap.width, height: bitmap.height };
  }

  return {
    size: file.stat.size,
    extension: file.extension,
    image,
  };
}
