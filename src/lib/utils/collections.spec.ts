import { expect, test } from "bun:test";
import { forceLowerCaseKeys, orderBy } from "./collections";

const asis = (x: any) => x;
const ASC = "asc" as const;
const DESC = "desc" as const;

test.each([
  // Asc
  [[2, 1], asis, ASC, [1, 2]],
  [[1, 2], asis, ASC, [1, 2]],
  [["z", "a"], asis, ASC, ["a", "z"]],
  [["a", "z"], asis, ASC, ["a", "z"]],
  // Desc
  [[1, 2], asis, DESC, [2, 1]],
  [[2, 1], asis, DESC, [2, 1]],
  [["a", "z"], asis, DESC, ["z", "a"]],
  [["z", "a"], asis, DESC, ["z", "a"]],
  // predicate
  [["aaa", "bb", "c"], (x) => x.length, ASC, ["c", "bb", "aaa"]],
  [["c", "bb", "aaa"], (x) => x.length, ASC, ["c", "bb", "aaa"]],
])(
  `orderBy("%s")`,
  (
    collection: any[],
    predicate: (t: any) => any,
    order: "asc" | "desc",
    expected: ReturnType<typeof orderBy>
  ) => {
    expect(orderBy(collection, predicate, order)).toEqual(expected);
  }
);

test.each([
  [
    { key: 1, key2: 2, Key3: 3, KEY4: 4 },
    { key: 1, key2: 2, key3: 3, key4: 4 },
  ],
])(
  `forceLowerCaseKeys("%s")`,
  (
    obj: Parameters<typeof forceLowerCaseKeys>[0],
    expected: ReturnType<typeof forceLowerCaseKeys>
  ) => {
    expect(forceLowerCaseKeys(obj)).toStrictEqual(expected);
  }
);
