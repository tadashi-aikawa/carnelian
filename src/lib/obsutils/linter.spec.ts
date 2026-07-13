import { beforeEach, describe, expect, mock, test } from "bun:test";
import { setupObsidianDom } from "src/lib/test-helpers/obsidian-dom";
import { obsidianMock } from "src/lib/test-helpers/obsidian-mock";
import type { Linter } from "src/lib/utils/linter";

mock.module("obsidian", () => obsidianMock);

const { dom } = setupObsidianDom();

const { lint, removeLinterInspectionElements } = await import("./linter");

// ---- View / app のモック ----

type FakeView = {
  file: { path: string; basename: string } | null;
  containerEl: HTMLElement;
};

function createView(path: string | null): FakeView {
  const containerEl = dom.window.document.createElement("div");
  containerEl.innerHTML = `<div class="view-header"></div><div class="view-content"></div>`;
  return {
    file: path
      ? { path, basename: path.split("/").pop()!.replace(/\.md$/, "") }
      : null,
    containerEl,
  };
}

function setupApp(option: {
  activeView: FakeView;
  allViews: FakeView[];
  contents: Record<string, string>;
}): void {
  (globalThis as any).app = {
    vault: {
      getAbstractFileByPath: (path: string) =>
        path in option.contents
          ? { path, basename: path.split("/").pop()!.replace(/\.md$/, "") }
          : null,
      cachedRead: (file: { path: string }) =>
        Promise.resolve(option.contents[file.path]),
    },
    metadataCache: {
      getFileCache: (file: { path: string }) =>
        file.path in option.contents ? {} : null,
    },
    workspace: {
      getActiveFileView: () => option.activeView,
      getLeavesOfType: (_type: string) =>
        option.allViews.map((view) => ({ view })),
    },
  };
}

/** contentに"NG"が含まれていたら指摘を返すLinter */
function createNgLinter(code: string): Linter {
  return {
    lint: ({ content }) =>
      content.includes("NG")
        ? [{ code, message: `${code}の説明`, level: "ERROR" as const }]
        : [],
  };
}

const settings = {} as any;
const fileA = { path: "Notes/A.md", basename: "A" } as any;

const inspectionsIn = (view: FakeView) =>
  view.containerEl.querySelectorAll(".linter-inspections");

describe("lint", () => {
  let viewA1: FakeView;
  let viewA2: FakeView;
  let viewB: FakeView;

  beforeEach(() => {
    viewA1 = createView("Notes/A.md");
    viewA2 = createView("Notes/A.md");
    viewB = createView("Notes/B.md");
    setupApp({
      activeView: viewA1,
      allViews: [viewA1, viewA2, viewB],
      contents: { "Notes/A.md": "NGを含む本文", "Notes/B.md": "本文" },
    });
  });

  test("指定した複数のViewすべてに検査結果が描画される", async () => {
    await lint(fileA, [createNgLinter("LNT001")], settings, false, [
      viewA1,
      viewA2,
    ] as any);

    expect(inspectionsIn(viewA1)).toHaveLength(1);
    expect(inspectionsIn(viewA2)).toHaveLength(1);
    expect(
      viewA1.containerEl.querySelector(".linter-inspection")?.textContent,
    ).toBe("LNT001");
    // 検査結果はヘッダ直後に挿入される
    expect(
      viewA1.containerEl.querySelector(".view-header")?.nextElementSibling
        ?.className,
    ).toBe("linter-inspections");
  });

  test("別ファイルを表示しているViewには描画されない", async () => {
    // 4228733の回帰テスト: 非同期処理中に表示ファイルが切り替わった
    // (またはそもそも別ファイルの)Viewに、他ファイルのLint結果が表示されてしまう
    await lint(fileA, [createNgLinter("LNT001")], settings, false, [
      viewA1,
      viewB,
    ] as any);

    expect(inspectionsIn(viewA1)).toHaveLength(1);
    expect(inspectionsIn(viewB)).toHaveLength(0);
  });

  test("同じViewに再度Lintしても結果は置き換わり重複しない", async () => {
    await lint(fileA, [createNgLinter("LNT001")], settings, false, [
      viewA1,
    ] as any);
    await lint(fileA, [createNgLinter("LNT002")], settings, false, [
      viewA1,
    ] as any);

    expect(inspectionsIn(viewA1)).toHaveLength(1);
    expect(
      viewA1.containerEl.querySelector(".linter-inspection")?.textContent,
    ).toBe("LNT002");
  });

  test("処理中に同じViewへ新しいLintが開始されたら、古いLintの結果は反映されない", async () => {
    // 4228733の回帰テスト: 古い(遅い)Lintの結果が、後から開始された
    // 新しいLintの結果を上書きしてしまう
    const oldLint = lint(fileA, [createNgLinter("OLD")], settings, false, [
      viewA1,
    ] as any);
    const newLint = lint(fileA, [createNgLinter("NEW")], settings, false, [
      viewA1,
    ] as any);
    await Promise.all([oldLint, newLint]);

    const elements = viewA1.containerEl.querySelectorAll(".linter-inspection");
    expect(elements).toHaveLength(1);
    expect(elements[0].textContent).toBe("NEW");
  });

  test("指摘0件でも検査結果要素(空)は描画される", async () => {
    await lint(
      { path: "Notes/B.md", basename: "B" } as any,
      [createNgLinter("LNT001")],
      settings,
      false,
      [viewB] as any,
    );

    expect(inspectionsIn(viewB)).toHaveLength(1);
    expect(
      viewB.containerEl.querySelectorAll(".linter-inspection"),
    ).toHaveLength(0);
  });
});

describe("removeLinterInspectionElements", () => {
  test("view未指定なら開いているすべてのMarkdown Viewから検査結果が削除される", async () => {
    const viewA1 = createView("Notes/A.md");
    const viewA2 = createView("Notes/A.md");
    setupApp({
      activeView: viewA1,
      allViews: [viewA1, viewA2],
      contents: { "Notes/A.md": "NGを含む本文" },
    });

    await lint(fileA, [createNgLinter("LNT001")], settings, false, [
      viewA1,
      viewA2,
    ] as any);
    expect(inspectionsIn(viewA1)).toHaveLength(1);
    expect(inspectionsIn(viewA2)).toHaveLength(1);

    removeLinterInspectionElements();

    expect(inspectionsIn(viewA1)).toHaveLength(0);
    expect(inspectionsIn(viewA2)).toHaveLength(0);
  });
});
