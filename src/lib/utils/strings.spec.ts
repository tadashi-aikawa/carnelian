import { expect, test } from "bun:test";
import { countCharsWidth, doSinglePatternMatching } from "./strings";

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
