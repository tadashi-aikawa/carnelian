import { expect, test } from "bun:test";
import { type LintInspection, type Linter, lintAll } from "./linter";

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
