export function sorter<T, U extends number | string | boolean>(
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

export function omitBy<T extends { [key: string]: any }>(
  obj: T,
  shouldOmit: (key: string, value: any) => boolean,
): T {
  const cloned = { ...obj };

  for (const [k, v] of Object.entries(cloned)) {
    if (shouldOmit(k, v)) {
      delete cloned[k];
    }
  }

  return cloned;
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

export function uniq<T>(values: T[]): T[] {
  return [...new Set(values)];
}

export function duplicateObject<T>(obj: T, count: number): T[] {
  return Array.from({ length: count }, () => ({ ...obj }));
}

export const groupBy = <T>(
  values: T[],
  toKey: (t: T) => string,
): { [key: string]: T[] } => {
  const grouped: { [key: string]: T[] } = {};
  for (const value of values) {
    const key = toKey(value);
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(value);
  }
  return grouped;
};
