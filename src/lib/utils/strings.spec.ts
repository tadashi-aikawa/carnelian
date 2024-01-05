import { expect, test } from "bun:test";
import {
  countCharsWidth,
  doSinglePatternMatching,
  formatTable,
  getParagraphAtLine,
  pad,
} from "./strings";

test.each([
  [
    "2023-10-12から2023-10-02",
    /\d{4}-\d{2}-\d{2}/g,
    ["2023-10-12", "2023-10-02"],
  ],
  ["hoge", /h../g, ["hog"]],
  ["hogehoge", /h../g, ["hog", "hog"]],
  ["aaaa", /h../g, []],
])(
  `doSinglePatternMatching("%s")`,
  (
    text: Parameters<typeof doSinglePatternMatching>[0],
    pattern: Parameters<typeof doSinglePatternMatching>[1],
    expected: ReturnType<typeof doSinglePatternMatching>
  ) => {
    expect(doSinglePatternMatching(text, pattern)).toEqual(expected);
  }
);

test.each([
  ["abc", 3],
  ["あいう", 6],
  ["%.,●", 5],
])(
  `countCharsWidth("%s")`,
  (
    chars: Parameters<typeof countCharsWidth>[0],
    expected: ReturnType<typeof countCharsWidth>
  ) => {
    expect(countCharsWidth(chars)).toBe(expected);
  }
);

test.each([
  ["abc", 5, " ", " abc "],
  ["abc", 6, " ", " abc  "],
  ["abc", 4, " ", "abc "],
  ["abc", 3, " ", "abc"],
  ["abc", 2, " ", "abc"],
])(
  `pad("%s", %d, "%s")`,
  (
    text: Parameters<typeof pad>[0],
    length: Parameters<typeof pad>[1],
    char: Parameters<typeof pad>[2],
    expected: ReturnType<typeof pad>
  ) => {
    expect(pad(text, length, char)).toBe(expected);
  }
);

test.each([
  [
    `1 正常系
2 B

3 C
4 D

5 E
`,
    3,
    {
      startLine: 3,
      endLine: 4,
      text: `3 C
4 D`,
    },
  ],
  [
    `1 startLineが0
2 B
3 C
4 D

5 E
`,
    2,
    {
      startLine: 0,
      endLine: 3,
      text: `1 startLineが0
2 B
3 C
4 D`,
    },
  ],
  [
    `1 endLineが終端
2 B

3 C
4 D
5 E
`,
    3,
    {
      startLine: 3,
      endLine: 5,
      text: `3 C
4 D
5 E`,
    },
  ],
  [
    `1 現在行の周辺が空行

3 C

5 E
`,
    2,
    {
      startLine: 2,
      endLine: 2,
      text: `3 C`,
    },
  ],
  [
    `1 現在行が空行
2 B

3 C
4 D

5 E
`,
    2,
    null,
  ],
])(
  `getActiveParagraph("%s", "%d")`,
  (
    text: Parameters<typeof getParagraphAtLine>[0],
    line: Parameters<typeof getParagraphAtLine>[1],
    expected: ReturnType<typeof getParagraphAtLine>
  ) => {
    expect(getParagraphAtLine(text, line)).toStrictEqual(expected);
  }
);

test.each([
  [
    `
| id | name |
|-|-|
|1|hoge|
|1000000|take|
`.trim(),
    `
| id      | name |
| ------- | ---- |
| 1       | hoge |
| 1000000 | take |
`.trim(),
  ],
  [
    `
| id | name |
|-|-|
|1|ほげほげ|
|1000000|武|
`.trim(),
    `
| id      | name     |
| ------- | -------- |
| 1       | ほげほげ |
| 1000000 | 武       |
`.trim(),
  ],
  [
    `
| id | name |
|
|1|1武|
|2
3
`.trim(),
    `
| id | name |
| -- | ---- |
| 1  | 1武  |
| 2  |      |
| 3  |      |
`.trim(),
  ],
  [
    `
| id | name |
|-|-|
|1|1武| 頑張ります！ |
|2
`.trim(),
    `
| id | name |              |
| -- | ---- | ------------ |
| 1  | 1武  | 頑張ります！ |
| 2  |      |              |
`.trim(),
  ],
  [
    `
| id | name |
|-|-|
|1| [[エス\\|ケープ]] |
|2
`.trim(),
    `
| id | name             |
| -- | ---------------- |
| 1  | [[エス\\|ケープ]] |
| 2  |                  |
`.trim(),
  ],
])(
  `formatTable("%s")`,
  (
    tableText: Parameters<typeof formatTable>[0],
    expected: ReturnType<typeof formatTable>
  ) => {
    expect(formatTable(tableText)).toBe(expected);
  }
);
