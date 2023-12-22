import dayjs, { Dayjs } from "dayjs";
import { map } from "../utils/types";
import { getActiveFile } from "./entries";

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

/**
 * 現在日時を取得します
 *
 * ```ts
 * now("YYYY-MM-DD")
 * // "2023-11-06"
 * now("unixtime")
 * // 1699259384
 * now("dayjs")
 * ```
 */
export function now(
  format: string | "unixtime" | "dayjs"
): string | number | Dayjs {
  const now = dayjs();
  switch (format) {
    case "unixtime":
      return now.unix();
    case "dayjs":
      return now;
    default:
      return now.format(format);
  }
}
