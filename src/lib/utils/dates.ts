import type { Dayjs } from "dayjs";

export const dateTimePropertyFormat = "YYYY-MM-DD HH:mm";

export function getDatesInRange(begin: Dayjs, end: Dayjs): Dayjs[] {
  let date = begin;
  if (begin.isAfter(end)) {
    throw new Error("beginDate is after endDate");
  }

  const dates = [];
  while (true) {
    dates.push(date);
    date = date.add(1, "days");
    if (date.isAfter(end, "days")) {
      break;
    }
  }

  return dates;
}
