import { beforeEach, describe, expect, mock, test } from "bun:test";
import {
  obsidianMock,
  setupLinkResolutionApp,
} from "src/lib/test-helpers/obsidian-mock";

mock.module("obsidian", () => obsidianMock);

const { resolveLinkDecoration } = await import("./link-decoration-common");

const sourcePath = "Notes/source.md";

describe("resolveLinkDecoration", () => {
  beforeEach(() => {
    setupLinkResolutionApp([
      { path: "Notes/source.md" },
      { path: "Notes/Done note.md", frontmatter: { status: "✅完了" } },
      {
        path: "Notes/Fixme note.md",
        frontmatter: { status: "🚧作業中", fixme: true },
      },
      {
        path: "Notes/Confidence note.md",
        frontmatter: { status: "", confidence: "確実", priority: 3 },
      },
      { path: "Notes/Plain note.md", frontmatter: {} },
    ]);
  });

  test("リンク先ノートのchipプロパティ値がstatusとして解決される", () => {
    const actual = resolveLinkDecoration("Done note", sourcePath, {
      chipProperties: ["status"],
      highlightFixmeLinks: false,
    });
    expect(actual).toEqual({ fixme: false, status: "✅完了" });
  });

  test("エイリアス・見出し付きのリンクテキストでもリンク先ノートに解決される", () => {
    const actual = resolveLinkDecoration(
      "Done note#見出し|エイリアス",
      sourcePath,
      { chipProperties: ["status"], highlightFixmeLinks: false },
    );
    expect(actual.status).toBe("✅完了");
  });

  test("chipPropertiesは配列の先に見つかった文字列値が優先される", () => {
    const actual = resolveLinkDecoration("Fixme note", sourcePath, {
      chipProperties: ["confidence", "status"],
      highlightFixmeLinks: false,
    });
    // Fixme noteにconfidenceは無いため、次のstatusが採用される
    expect(actual.status).toBe("🚧作業中");
  });

  test("空文字や文字列以外のプロパティ値はスキップして次の候補が採用される", () => {
    const actual = resolveLinkDecoration("Confidence note", sourcePath, {
      // status: "" と priority: 3 はスキップされ confidence が採用される
      chipProperties: ["status", "priority", "confidence"],
      highlightFixmeLinks: false,
    });
    expect(actual.status).toBe("確実");
  });

  test("chipPropertiesが空配列ならstatusはnull", () => {
    const actual = resolveLinkDecoration("Done note", sourcePath, {
      chipProperties: [],
      highlightFixmeLinks: false,
    });
    expect(actual.status).toBeNull();
  });

  test("該当プロパティを持たないノートはstatusがnull", () => {
    const actual = resolveLinkDecoration("Plain note", sourcePath, {
      chipProperties: ["status"],
      highlightFixmeLinks: false,
    });
    expect(actual).toEqual({ fixme: false, status: null });
  });

  test("リンクが未解決(存在しないノート)なら装飾なし", () => {
    const actual = resolveLinkDecoration("Missing note", sourcePath, {
      chipProperties: ["status"],
      highlightFixmeLinks: true,
    });
    expect(actual).toEqual({ fixme: false, status: null });
  });

  test("highlightFixmeLinksが有効ならfixme: trueのノートでfixmeが立つ", () => {
    const actual = resolveLinkDecoration("Fixme note", sourcePath, {
      chipProperties: ["status"],
      highlightFixmeLinks: true,
    });
    expect(actual).toEqual({ fixme: true, status: "🚧作業中" });
  });

  test("highlightFixmeLinksが無効ならfixme: trueのノートでもfixmeは立たない", () => {
    const actual = resolveLinkDecoration("Fixme note", sourcePath, {
      chipProperties: ["status"],
      highlightFixmeLinks: false,
    });
    expect(actual.fixme).toBe(false);
  });
});
