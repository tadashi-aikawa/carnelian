import dayjs from "dayjs";
import { TFile } from "obsidian";
import { UApp } from "../types";
import { getDatesInRange } from "../utils/dates";
import { isPresent } from "../utils/types";
import { getFileByPath } from "./entries";

declare let app: UApp;

/**
 * Periodic Notesの設定を取得します
 */
export function usePeriodicNotesSettings(): UApp["plugins"]["plugins"]["periodic-notes"] {
  return app.plugins.plugins["periodic-notes"];
}

/**
 * Obsidian Publishで設定したhostを取得します
 */
export async function getObsidianPublishHost(): Promise<string> {
  return app.internalPlugins.plugins.publish.instance
    .apiCustomUrl()
    .then((x: any) => x.url);
}

/**
 * Obsidian PublishのURLを生成します
 *
 * ```ts
 * createObsidianPublishUrl("Notes/published_site.md")
 * // "https://minerva.mamansoft.net/Notes/published_site"
 * ```
 */
export async function createObsidianPublishUrl(path: string): Promise<string> {
  const host = await getObsidianPublishHost();
  return `https://${host}/${encodeURIComponent(path.replace(".md", ""))}`;
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
