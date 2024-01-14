import { Properties, UApp, UMetadataEditor } from "../types";
import { errorMessage } from "../utils/errors";
import { orThrow } from "../utils/types";
import { getActiveFileCache, getFileCacheByPath } from "./metadata";

declare let app: UApp;

/**
 * 現在ファイルのメタデータエディタを取得します
 */
export function getActiveMetadataEditor(): UMetadataEditor | null {
  return (app.workspace.activeEditor as any).metadataEditor ?? null;
}

/**
 * ファイルパスからプロパティを取得します
 *
 * ```ts
 * getPropertiesByPath("Notes/sample-code.md").description
 * // 説明文
 * ```
 */
export function getPropertiesByPath(path: string): Properties | null {
  return getFileCacheByPath(path)?.frontmatter ?? null;
}

/**
 * 現在のファイルからプロパティを取得します
 *
 * ```ts
 * getActiveFileProperties().description
 * // 説明文
 * ```
 */
export function getActiveFileProperties(): Properties | null {
  return getActiveFileCache()?.frontmatter ?? null;
}

/**
 * 現在ファイルのtagsプロパティを取得します
 *
 * ```ts
 * getActiveFileTagsProperty()
 * // ["id", "favorites"]
 * ```
 */
export function getActiveFileTagsProperty(): string[] {
  const tagsValue = getActiveFileProperties()?.tags;
  if (!tagsValue) {
    return [];
  }

  return Array.isArray(tagsValue) ? tagsValue : [tagsValue];
}

/**
 * 現在ファイルのaliasesプロパティを取得します
 *
 * ```ts
 * getActiveFileAliasesProperty()
 * // ["obsidian", "オブシディアン"]
 * ```
 */
export function getActiveFileAliasesProperty(): string[] {
  const aliasesValue = getActiveFileProperties()?.aliases;
  if (!aliasesValue) {
    return [];
  }

  return Array.isArray(aliasesValue) ? aliasesValue : [aliasesValue];
}

/**
 * 現在ファイルのdescriptionプロパティを取得します
 *
 * ```ts
 * getActiveFileDescriptionProperty()
 * // 説明文
 * ```
 */
export function getActiveFileDescriptionProperty(): string | null {
  return getActiveFileProperties()?.description ?? null;
}

/**
 * 現在ファイルにプロパティを追加します
 *
 * ```ts
 * addActiveFileProperty("id", 100)
 * addActiveFileProperty("favorites", ["apple", "orange"])
 * ```
 */
export function addActiveFileProperty(key: string, value: any | any[]): void {
  orThrow(
    getActiveMetadataEditor(),
    (me) => me.insertProperties({ [key]: value }),
    { message: errorMessage["MetadataEditor is null"] },
  );
}

/**
 * 現在ファイルに複数のプロパティを追加します
 *
 * ```ts
 * addActiveFileProperty({id: 100, favorites: ["apple", "orange"]})
 * ```
 */
export function addActiveFileProperties(properties: {
  [key: string]: any | any[];
}): void {
  orThrow(getActiveMetadataEditor(), (me) => me.insertProperties(properties), {
    message: errorMessage["MetadataEditor is null"],
  });
}

/**
 * 現在ファイルのプロパティを削除します
 *
 * ```ts
 * removeActiveFileProperty("id")
 * ```
 */
export function removeActiveFileProperty(key: string): void {
  orThrow(
    getActiveMetadataEditor(),
    (me) => me.insertProperties({ [key]: null }),
    { message: errorMessage["MetadataEditor is null"] },
  );
}

/**
 * 現在ファイルのプロパティを更新します
 *
 * /```ts
 * updateActiveFileProperty("id", 200)
 * ```
 */
export function updateActiveFileProperty(
  key: string,
  value: any | any[],
): void {
  removeActiveFileProperty(key);
  addActiveFileProperty(key, value);
}

/**
 * 現在ファイルのプロパティにフォーカスをあてます
 *
 * ```ts
 * focusPropertyValue("id")
 * ```
 */
export function focusPropertyValue(key: string): void {
  orThrow(getActiveMetadataEditor(), (me) => me.focusValue(key), {
    message: errorMessage["MetadataEditor is null"],
  });
}
