import type { Properties, UApp, UMetadataEditor } from "../types";
import { errorMessage } from "../utils/errors";
import { orThrow } from "../utils/guard";
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
 * valueがanyの場合は上書き、any[]の場合は上書きせず追加します
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
    // removePropertiesを使うとフォーカスが外れるのでinsertPropertiesでundefinedを入れる
    (me) => me.insertProperties({ [key]: undefined }),
    { message: errorMessage["MetadataEditor is null"] },
  );
}

/**
 * 現在ファイルのプロパティを更新します
 *
 * ```ts
 * updateActiveFileProperty("id", 200)
 * ```
 */
export function updateActiveFileProperty(
  key: string,
  value: any | any[],
): void {
  addActiveFileProperty(key, value);
}

/**
 * 現在ファイルのプロパティをソートします
 *
 * ```ts
 * // ソートしたい順番を記載
 * sortActiveFileProperties(["prop1", "prop2", "prop3"])
 * // 空のプロパティは削除
 * sortActiveFileProperties(["prop1", "prop2", "prop3"], {option: {removeIfEmpty: true}})
 * ```
 */
export function sortActiveFileProperties(
  sortOrderKeys: string[],
  option?: {
    removeIfEmpty?: boolean;
  },
): void {
  orThrow(
    getActiveMetadataEditor(),
    (me) => {
      const sortedProps = Object.entries(me.serialize())
        .filter(([_k, v]) => {
          // 空のプロパティを削除するオプションがある場合
          if (option?.removeIfEmpty) {
            return v != null && !(Array.isArray(v) && v.length === 0);
          }
          return true;
        })
        .toSorted(([k1], [k2]) => {
          for (const soKey of sortOrderKeys) {
            if (k1 === soKey) return -1;
            if (k2 === soKey) return 1;
          }
          return 0;
        })
        .reduce((acc, [k, v]) => {
          acc[k] = v;
          return acc;
        }, {} as Properties);
      me.synchronize(sortedProps);
      me.save();
    },
    { message: errorMessage["MetadataEditor is null"] },
  );
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
