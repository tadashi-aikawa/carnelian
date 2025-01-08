import { expect, test } from "bun:test";
import {
  forceLowerCaseKeys,
  omitBy,
  orderBy,
  uniq,
  zipRotate,
} from "./collections";

const asIs = (x: any) => x;
const ASC = "asc" as const;
const DESC = "desc" as const;

test.each([
  // Asc
  [[2, 1], asIs, ASC, [1, 2]],
  [[1, 2], asIs, ASC, [1, 2]],
  [["z", "a"], asIs, ASC, ["a", "z"]],
  [["a", "z"], asIs, ASC, ["a", "z"]],
  // Desc
  [[1, 2], asIs, DESC, [2, 1]],
  [[2, 1], asIs, DESC, [2, 1]],
  [["a", "z"], asIs, DESC, ["z", "a"]],
  [["z", "a"], asIs, DESC, ["z", "a"]],
  // predicate
  [["aaa", "bb", "c"], (x) => x.length, ASC, ["c", "bb", "aaa"]],
  [["c", "bb", "aaa"], (x) => x.length, ASC, ["c", "bb", "aaa"]],
])(
  `orderBy("%s")`,
  (
    collection: any[],
    predicate: (t: any) => any,
    order: "asc" | "desc",
    expected: ReturnType<typeof orderBy>,
  ) => {
    expect(orderBy(collection, predicate, order)).toEqual(expected);
  },
);

test.each<
  [
    Parameters<typeof omitBy>[0],
    Parameters<typeof omitBy>[1],
    ReturnType<typeof omitBy>,
  ]
>([
  [{ a: 1, b: 2, c: 3 }, (_, v) => v > 1, { a: 1 }],
  [{ a: 1, b: 2, c: 3 }, (k, _) => k === "c", { a: 1, b: 2 }],
])(`omitBy("%s")`, (collection, shouldOmit, expected) => {
  expect(omitBy(collection, shouldOmit)).toEqual(expected);
});

test.each([
  [
    { key: 1, key2: 2, Key3: 3, KEY4: 4 },
    { key: 1, key2: 2, key3: 3, key4: 4 },
  ],
])(
  `forceLowerCaseKeys("%s")`,
  (
    obj: Parameters<typeof forceLowerCaseKeys>[0],
    expected: ReturnType<typeof forceLowerCaseKeys>,
  ) => {
    expect(forceLowerCaseKeys(obj)).toStrictEqual(expected);
  },
);

test.each([
  [
    [["1", "2"], ["3", "4"], ["5"]],
    [
      ["1", "3", "5"],
      ["2", "4", undefined],
    ],
  ],
])(
  `zipRotate("%s")`,
  (
    matrix: Parameters<typeof zipRotate>[0],
    expected: ReturnType<typeof zipRotate>,
  ) => {
    expect(zipRotate(matrix)).toStrictEqual(expected);
  },
);

test.each([
  [
    [1, 2, 1],
    [1, 2],
  ],
  [
    [{ key: "a" }, { key: "a" }],
    [{ key: "a" }, { key: "a" }],
  ],
  [
    [
      [1, 2],
      [1, 2],
    ],
    [
      [1, 2],
      [1, 2],
    ],
  ],
])(
  `uniq("%s")`,
  (values: Parameters<typeof uniq>[0], expected: ReturnType<typeof uniq>) => {
    expect(uniq(values)).toStrictEqual(expected);
  },
);
