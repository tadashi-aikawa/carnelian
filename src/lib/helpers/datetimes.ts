import dayjs, { type Dayjs } from "dayjs";

export function now(format: "unixtime"): number;
export function now(format: "dayjs"): Dayjs;
export function now(format: string): string;

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
  format: string | "unixtime" | "dayjs",
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
