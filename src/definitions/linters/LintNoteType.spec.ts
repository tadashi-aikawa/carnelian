import { expect, test } from "bun:test";
import type { PluginSettings } from "src/settings";
import { findLintNoteTypeBy, resolveLintLevel } from "./LintNoteType";

test("findLintNoteTypeBy は最初にpathPatternへ一致したノート種別を返す", () => {
  const settings = {
    noteTypes: [
      {
        name: "Specific note",
        pathPattern: "^Notes/📘.+\\.md$",
        coverImagePath: "Notes/attachments/specific.webp",
      },
      {
        name: "Fallback note",
        pathPattern: "^Notes/.+\\.md$",
      },
    ],
  } satisfies PluginSettings["linter"];

  expect(findLintNoteTypeBy({ path: "Notes/📘Example.md", settings })).toEqual({
    name: "Specific note",
    coverImagePath: "Notes/attachments/specific.webp",
  });
});

test("findLintNoteTypeBy は不正な正規表現を無視する", () => {
  const settings = {
    noteTypes: [
      {
        name: "Invalid note",
        pathPattern: "[",
      },
      {
        name: "Valid note",
        pathPattern: "^Notes/.+\\.md$",
      },
    ],
  } satisfies PluginSettings["linter"];

  expect(findLintNoteTypeBy({ path: "Notes/Example.md", settings })).toEqual({
    name: "Valid note",
    coverImagePath: undefined,
  });
});

test("resolveLintLevel はlevelsにないノート種別でdefaultLevelにフォールバックする", () => {
  expect(
    resolveLintLevel(
      {
        defaultLevel: "WARN",
        levels: {
          "Daily note": null,
          "Article note": "ERROR",
        },
      },
      "Procedure note",
      "Notes/Procedure.md",
    ),
  ).toBe("WARN");
});

test("resolveLintLevel はlevelsの値をdefaultLevelより優先する", () => {
  expect(
    resolveLintLevel(
      {
        defaultLevel: "WARN",
        levels: {
          "Article note": "ERROR",
          "Daily note": null,
        },
      },
      "Daily note",
      "_Privates/Daily Notes/2026-06-24.md",
    ),
  ).toBeNull();
});

test("resolveLintLevel はignoreFilesに一致するpathでnullを返す", () => {
  expect(
    resolveLintLevel(
      {
        defaultLevel: "ERROR",
        ignoreFiles: ["Templates/**"],
      },
      "Article note",
      "Templates/Article.md",
    ),
  ).toBeNull();
});
