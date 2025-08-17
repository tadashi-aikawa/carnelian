import dayjs from "dayjs";
import type { TFile } from "obsidian";
import type { UApp } from "../types";
import { getDatesInRange } from "../utils/dates";
import { isPresent } from "../utils/guard";
import { encodeToUrl } from "../utils/strings";
import { getFileByPath } from "./entries";
import { getActiveFileProperties } from "./properties";

declare let app: UApp;

/**
 * Periodic Notesの設定を取得します
 */
export function usePeriodicNotesSettings(): UApp["plugins"]["plugins"]["periodic-notes"] {
  return app.plugins.plugins["periodic-notes"];
}

/**
 * Obsidian Publishに関する情報を使用します。
 *
 * getPageUrlはpermalinkを考慮します。permalinkを考慮しない場合はgetOriginPageUrlを使用してください。
 */
export async function useObsidianPublishInfo(): Promise<{
  id: string;
  domain: string;
  getPageUrl: (filePath: string) => string;
  getOriginPageUrl: (filePath: string) => string;
  getResourceUrl: (filePath: string) => string;
}> {
  const ins = app.internalPlugins.plugins.publish.instance;
  const { id, url: domain } = await ins.apiCustomUrl();

  const baseUrl = `https://${domain}`;
  const resourceBaseUrl = `https://${ins.host}/access/${id}`;

  const permalink = getActiveFileProperties()?.permalink;

  return {
    id,
    domain,
    getPageUrl(filePath) {
      return permalink
        ? `${baseUrl}/${permalink}`
        : `${baseUrl}/${encodeToUrl(filePath.replace(".md", ""))}`;
    },
    getOriginPageUrl(filePath) {
      return `${baseUrl}/${encodeToUrl(filePath.replace(".md", ""))}`;
    },
    getResourceUrl(filePath) {
      return `${resourceBaseUrl}/${encodeToUrl(filePath)}`;
    },
  };
}

/**
 * 日付beginとendの間に存在するデイリーノートのファイルオブジェクトを取得します
 *
 * ```ts
 * getDailyNotes("2023-10-12", "2023-10-14")
 * // ["Daily Note/2023-10-12.md", "Daily Note/2023-10-13.md", "Daily Note/2023-10-14.md"]
 * ```
 */
export function getDailyNotes(begin: string, end: string): TFile[] {
  const dailySettings = usePeriodicNotesSettings()?.settings.daily;
  if (!dailySettings) {
    throw new Error("Periodic Notesプラグインがインストールされていません");
  }

  return getDatesInRange(dayjs(begin), dayjs(end))
    .map((x) =>
      getFileByPath(
        `${dailySettings.folder}/${x.format(
          dailySettings.format || "YYYY-MM-DD",
        )}.md`,
      ),
    )
    .filter(isPresent);
}
