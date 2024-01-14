export function sorter<T, U extends number | string>(
  toOrdered: (t: T) => U,
  order: "asc" | "desc" = "asc",
) {
  return (a: T, b: T) =>
    order === "asc"
      ? toOrdered(a) > toOrdered(b)
        ? 1
        : toOrdered(b) > toOrdered(a)
          ? -1
          : 0
      : toOrdered(a) < toOrdered(b)
        ? 1
        : toOrdered(b) < toOrdered(a)
          ? -1
          : 0;
}

export function orderBy<T, U extends number | string>(
  collections: T[],
  predicate: (t: T) => U,
  order: "asc" | "desc" = "asc",
): T[] {
  return collections.slice().sort(sorter(predicate, order));
}

export function forceLowerCaseKeys(obj: { [key: string]: any }): {
  [key: string]: any;
} {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key.toLowerCase(), value]),
  );
}

export const maxReducer = <T>(toNum: (t: T) => number) => {
  return (a: T, b: T) => (toNum(a) >= toNum(b) ? a : b);
};

export function zipRotate<T>(matrix: T[][]): T[][] {
  const maxColRow = matrix.reduce(maxReducer((x) => x.length));
  return maxColRow.map((_col, i) => matrix.map((row) => row[i]));
}
