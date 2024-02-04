import { expect, test } from "bun:test";
import {
  FuzzyResult,
  countCharsWidth,
  doSinglePatternMatching,
  excludeEmoji,
  excludeSpace,
  formatTable,
  getParagraphAtLine,
  getSinglePatternMatchingLocations,
  getWikiLinks,
  microFuzzy,
  pad,
  replaceAt,
} from "./strings";

test.each([
  ["aa bb", "aabb"],
  [" pre", "pre"],
  ["suf ", "suf"],
  [" both ", "both"],
  [" a ll ", "all"],
])(
  `excludeSpace("%s"))`,
  (
    text: Parameters<typeof excludeSpace>[0],
    expected: ReturnType<typeof excludeSpace>,
  ) => {
    expect(excludeSpace(text)).toBe(expected);
  },
);

test.each([
  ["a🍰b", "ab"],
  ["🍰pre", "pre"],
  ["suf🍰", "suf"],
  ["🍰both😌", "both"],
  ["🍰a🍊ll🅰️", "all"],
])(
  `excludeEmoji("%s"))`,
  (
    text: Parameters<typeof excludeEmoji>[0],
    expected: ReturnType<typeof excludeEmoji>,
  ) => {
    expect(excludeEmoji(text)).toBe(expected);
  },
);

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
    expected: ReturnType<typeof doSinglePatternMatching>,
  ) => {
    expect(doSinglePatternMatching(text, pattern)).toEqual(expected);
  },
);

test.each([
  [
    "2023-10-12から2023-10-02",
    /\d{4}-\d{2}-\d{2}/g,
    [
      { text: "2023-10-12", range: { start: 0, end: 9 } },
      { text: "2023-10-02", range: { start: 12, end: 21 } },
    ],
  ],

  ["hoge", /h../g, [{ text: "hog", range: { start: 0, end: 2 } }]],
  [
    "hogehoge",
    /h../g,
    [
      { text: "hog", range: { start: 0, end: 2 } },
      { text: "hog", range: { start: 4, end: 6 } },
    ],
  ],
  ["aaaa", /h../g, []],
])(
  `getSinglePatternMatchingLocations("%s")`,
  (
    text: Parameters<typeof getSinglePatternMatchingLocations>[0],
    pattern: Parameters<typeof getSinglePatternMatchingLocations>[1],
    expected: ReturnType<typeof getSinglePatternMatchingLocations>,
  ) => {
    expect(getSinglePatternMatchingLocations(text, pattern)).toEqual(expected);
  },
);

test.each([["0123456789", { start: 3, end: 6 }, "---", "012---789"]])(
  `replaceAt("%s")`,
  (
    base: Parameters<typeof replaceAt>[0],
    range: Parameters<typeof replaceAt>[1],
    text: Parameters<typeof replaceAt>[2],
    expected: ReturnType<typeof replaceAt>,
  ) => {
    expect(replaceAt(base, range, text)).toBe(expected);
  },
);

test.each([
  ["abc", 3],
  ["あいう", 6],
  ["%.,●", 5],
])(
  `countCharsWidth("%s")`,
  (
    chars: Parameters<typeof countCharsWidth>[0],
    expected: ReturnType<typeof countCharsWidth>,
  ) => {
    expect(countCharsWidth(chars)).toBe(expected);
  },
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
    expected: ReturnType<typeof pad>,
  ) => {
    expect(pad(text, length, char)).toBe(expected);
  },
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
      text: "3 C",
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
    expected: ReturnType<typeof getParagraphAtLine>,
  ) => {
    expect(getParagraphAtLine(text, line)).toStrictEqual(expected);
  },
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
|-------------------------|------------------------------|
|長いline|??|
`.trim(),
    `
| id       | name |
| -------- | ---- |
| 長いline | ??   |
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
    expected: ReturnType<typeof formatTable>,
  ) => {
    expect(formatTable(tableText)).toBe(expected);
  },
);

test.each([
  ["abc [[def]] ghi", [{ title: "def", range: { start: 4, end: 10 } }]],
  [
    "abc [[def]] ghi [[jkl]] mno",
    [
      { title: "def", range: { start: 4, end: 10 } },
      { title: "jkl", range: { start: 16, end: 22 } },
    ],
  ],
  [
    "abc [[def|DEF]] ghi",
    [{ title: "def", alias: "DEF", range: { start: 4, end: 14 } }],
  ],
])(
  `getWikiLinks("%s")`,
  (
    text: Parameters<typeof getWikiLinks>[0],
    expected: ReturnType<typeof getWikiLinks>,
  ) => {
    expect(getWikiLinks(text)).toStrictEqual(expected);
  },
);

test.each<
  [
    Parameters<typeof microFuzzy>[0],
    Parameters<typeof microFuzzy>[1],
    ReturnType<typeof microFuzzy>,
  ]
>([
  ["abcde", "ab", { type: "starts-with", score: 0.8 }],
  ["abcde", "bc", { type: "includes", score: 0.8 }],
  ["abcde", "ace", { type: "fuzzy", score: 1.2 }],
  ["abcde", "abcde", { type: "starts-with", score: 6.4 }],
  ["abcde", "abcdf", { type: "none", score: 0 }],
  ["abcde", "abcdef", { type: "none", score: 0 }],
  ["abcde", "bd", { type: "fuzzy", score: 0.8 }],
  ["abcde", "ba", { type: "none", score: 0 }],
  ["fuzzy name match", "match", { type: "includes", score: 2 }],
  ["📝memo", "mem", { type: "starts-with", score: 1.3333333333333333 }],
  ["📝memo", "📝", { type: "starts-with", score: 0.6666666666666666 }],
])("microFuzzy(%s, %s)", (value, query, expected) => {
  expect(microFuzzy(value, query)).toStrictEqual(expected);
});
