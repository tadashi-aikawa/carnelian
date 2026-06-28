import { expect, test } from "bun:test";
import {
  type Linter,
  type LintInspection,
  lineNoFromOffset,
  lintAll,
} from "./linter";

const titleLinter: Linter = {
  lint: ({ title }) => {
    const inspections: LintInspection[] = [];
    if (title.trim() === "") {
      inspections.push({
        code: "TLL001",
        message: "タイトルが空白のみになっています",
        level: "ERROR",
      });
    }
    if (title.length < 5) {
      inspections.push({
        code: "TLL002",
        message: "タイトルが5文字未満になっています",
        level: "WARN",
      });
    }
    return inspections;
  },
};

const properiesLinter: Linter = {
  lint: ({ properties }) => {
    const inspections: LintInspection[] = [];
    if (properties?.tags?.length === 0) {
      inspections.push({
        code: "PL001",
        message: "tagsが空になっています",
        level: "WARN",
      });
    }
    if (properties?.aliases && properties.aliases.length > 0) {
      inspections.push({
        code: "PL002",
        message: "aliasesが設定されています",
        level: "INFO",
      });
    }
    return inspections;
  },
};

test("Lint検査なしだと空配列が返る(単一Linter))", () => {
  const linters = [titleLinter] as Linter[];
  const actual = lintAll(linters, {
    title: "123456",
    content: "",
    body: "",
    path: "",
    settings: {},
  });
  expect(actual).toStrictEqual([]);
});

test("Lint検査ありだと結果配列が返る(単一Linter/単一結果))", () => {
  const linters = [titleLinter] as Linter[];
  const actual = lintAll(linters, {
    title: "1234",
    content: "",
    body: "",
    path: "",
    settings: {},
  });
  expect(actual).toStrictEqual([
    {
      code: "TLL002",
      message: "タイトルが5文字未満になっています",
      level: "WARN",
    },
  ]);
});

test("Lint検査ありだと結果が返る(単一Linter/複数結果))", () => {
  const linters = [titleLinter] as Linter[];
  const actual = lintAll(linters, {
    title: " ",
    content: "",
    body: "",
    path: "",
    settings: {},
  });
  expect(actual).toStrictEqual([
    {
      code: "TLL001",
      message: "タイトルが空白のみになっています",
      level: "ERROR",
    },
    {
      code: "TLL002",
      message: "タイトルが5文字未満になっています",
      level: "WARN",
    },
  ]);
});

test("Lint検査ありだと結果が返る(複数Linter/複数結果))", () => {
  const linters = [titleLinter, properiesLinter] as Linter[];
  const actual = lintAll(linters, {
    title: "ab",
    content: "",
    body: "",
    path: "",
    properties: { aliases: ["hoge"], tags: [] },
    settings: {},
  });
  expect(actual).toStrictEqual([
    {
      code: "TLL002",
      message: "タイトルが5文字未満になっています",
      level: "WARN",
    },
    {
      code: "PL001",
      message: "tagsが空になっています",
      level: "WARN",
    },
    {
      code: "PL002",
      message: "aliasesが設定されています",
      level: "INFO",
    },
  ]);
});

test("Lint検査が重複していてもユニークにはならない", () => {
  const linters = [titleLinter, titleLinter] as Linter[];
  const actual = lintAll(linters, {
    title: "ab",
    content: "",
    body: "",
    path: "",
    settings: {},
  });
  expect(actual).toStrictEqual([
    {
      code: "TLL002",
      message: "タイトルが5文字未満になっています",
      level: "WARN",
    },
    {
      code: "TLL002",
      message: "タイトルが5文字未満になっています",
      level: "WARN",
    },
  ]);
});

test("offsetから1始まりの行番号を取得できる", () => {
  const content = "abc\ndef\n";

  expect(lineNoFromOffset(content, 0)).toBe(1);
  expect(lineNoFromOffset(content, 4)).toBe(2);
  expect(lineNoFromOffset(content, content.length)).toBe(3);
});

test("offsetが本文範囲外なら行番号を取得しない", () => {
  expect(lineNoFromOffset("abc", -1)).toBeNull();
  expect(lineNoFromOffset("abc", 4)).toBeNull();
  expect(lineNoFromOffset("abc", 1.5)).toBeNull();
});

test("ignoreLintでruleのみ指定すると該当codeの診断が除外される", () => {
  const linters = [titleLinter, properiesLinter] as Linter[];
  const actual = lintAll(linters, {
    title: "ab",
    content: "",
    body: "",
    path: "",
    properties: {
      aliases: ["hoge"],
      tags: [],
      ignoreLint: ["TLL002"],
    },
    settings: {},
  });
  expect(actual).toStrictEqual([
    {
      code: "PL001",
      message: "tagsが空になっています",
      level: "WARN",
    },
    {
      code: "PL002",
      message: "aliasesが設定されています",
      level: "INFO",
    },
  ]);
});

test("ignoreLintでrule+messageを指定するとglobマッチする診断のみ除外される", () => {
  const linters = [titleLinter] as Linter[];
  const actual = lintAll(linters, {
    title: " ",
    content: "",
    body: "",
    path: "",
    properties: {
      ignoreLint: ["TLL001:*空白*"],
    },
    settings: {},
  });
  expect(actual).toStrictEqual([
    {
      code: "TLL002",
      message: "タイトルが5文字未満になっています",
      level: "WARN",
    },
  ]);
});

test("ignoreLintのmessageがマッチしないと除外されない", () => {
  const linters = [titleLinter] as Linter[];
  const actual = lintAll(linters, {
    title: " ",
    content: "",
    body: "",
    path: "",
    properties: {
      ignoreLint: ["TLL001:*マッチしない*"],
    },
    settings: {},
  });
  expect(actual).toStrictEqual([
    {
      code: "TLL001",
      message: "タイトルが空白のみになっています",
      level: "ERROR",
    },
    {
      code: "TLL002",
      message: "タイトルが5文字未満になっています",
      level: "WARN",
    },
  ]);
});

test("ignoreLintで複数エントリを指定するとすべて処理される", () => {
  const linters = [titleLinter, properiesLinter] as Linter[];
  const actual = lintAll(linters, {
    title: "ab",
    content: "",
    body: "",
    path: "",
    properties: {
      aliases: ["hoge"],
      tags: [],
      ignoreLint: ["TLL002", "PL001"],
    },
    settings: {},
  });
  expect(actual).toStrictEqual([
    {
      code: "PL002",
      message: "aliasesが設定されています",
      level: "INFO",
    },
  ]);
});

test("ignoreLintが不正な形式(配列でない)の場合は無視される", () => {
  const linters = [titleLinter] as Linter[];
  const actual = lintAll(linters, {
    title: "1234",
    content: "",
    body: "",
    path: "",
    properties: {
      ignoreLint: "invalid",
    },
    settings: {},
  });
  expect(actual).toStrictEqual([
    {
      code: "TLL002",
      message: "タイトルが5文字未満になっています",
      level: "WARN",
    },
  ]);
});
