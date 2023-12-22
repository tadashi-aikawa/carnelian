import { CachedMetadata, MetadataCache } from "obsidian";
import { UApp } from "../types";
import { map } from "../utils/types";
import { getActiveFile, getFileByPath } from "./entries";

declare let app: UApp;

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
