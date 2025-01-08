import dayjs from "dayjs";
import type { TFile } from "obsidian";
import type { UApp } from "../types";
import { getDatesInRange } from "../utils/dates";
import { isPresent } from "../utils/guard";
import { getFileByPath } from "./entries";

declare let app: UApp;

/**
 * Periodic Notesの設定を取得します
 */
export function usePeriodicNotesSettings(): UApp["plugins"]["plugins"]["periodic-notes"] {
  return app.plugins.plugins["periodic-notes"];
}

/**
 * Obsidian Publishに関する情報を使用します。
 * WARN: faviconにはLogoの画像を使用します
 */
export async function useObsidianPublishInfo(): Promise<{
  id: string;
  domain: string;
  getPageUrl: (filePath: string) => string;
  getResourceUrl: (filePath: string) => string;
}> {
  const ins = app.internalPlugins.plugins.publish.instance;
  const { id, url: domain } = await ins.apiCustomUrl();

  const resourceBaseUrl = `https://${ins.host}/access/${id}`;

  return {
    id,
    domain,
    getPageUrl(filePath) {
      return `https://${domain}/${encodeURI(filePath.replace(".md", ""))}`;
    },
    getResourceUrl(filePath) {
      return `${resourceBaseUrl}/${encodeURI(filePath)}`;
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
