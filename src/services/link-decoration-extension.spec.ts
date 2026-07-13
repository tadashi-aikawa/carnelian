import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { EditorState } from "@codemirror/state";
import type { DecorationSet } from "@codemirror/view";
import {
  editorInfoField,
  editorLivePreviewField,
  obsidianMock,
  setupLinkResolutionApp,
} from "src/lib/test-helpers/obsidian-mock";

mock.module("obsidian", () => obsidianMock);

// ---- syntaxTreeモック ----
// ObsidianのLive Previewが生成するHyperMDのsyntax tree(hmd-internal-link /
// formatting-link-end ノード)はテスト環境で再現できないため、
// ドキュメント文字列から [[...]] を検出して同等のノード列を発行する
mock.module("@codemirror/language", () => ({
  syntaxTree: (state: EditorState) => ({
    iterate({
      enter,
    }: {
      from: number;
      to: number;
      enter: (node: {
        type: { name: string };
        from: number;
        to: number;
      }) => void;
    }) {
      const text = state.doc.sliceString(0, state.doc.length);
      const linkPattern = /\[\[([^\]]*)\]\]/g;
      let m = linkPattern.exec(text);
      while (m) {
        const inner = m[1];
        const innerFrom = m.index + 2;
        // Obsidianの実際のトークン分割を模倣:
        // リンクテキストはパイプで区切られた複数のhmd-internal-linkノードになる
        let offset = 0;
        for (const part of inner.split("|")) {
          const from = innerFrom + offset;
          enter({
            type: { name: "hmd-internal-link" },
            from,
            to: from + part.length,
          });
          offset += part.length + 1;
        }
        const endFrom = m.index + m[0].length - 2;
        enter({
          type: { name: "formatting-link-end" },
          from: endFrom,
          to: endFrom + 2,
        });
        m = linkPattern.exec(text);
      }
    },
  }),
}));

const { EditorState: State } = await import("@codemirror/state");
const { createLinkDecorationExtension } = await import(
  "./link-decoration-extension"
);

/**
 * EditorView実体なしでViewPluginのdecoration構築処理を実行します
 * (buildDecorationsはstateとvisibleRangesのみ参照するため)
 */
function buildDecorations(
  doc: string,
  option?: {
    selectionAnchor?: number;
    livePreview?: boolean;
    chipProperties?: string[];
  },
): { from: number; to: number; spec: any }[] {
  const state = State.create({
    doc,
    selection: { anchor: option?.selectionAnchor ?? 0 },
    extensions: [
      option?.livePreview === false
        ? editorLivePreviewField.init(() => false)
        : editorLivePreviewField,
      editorInfoField,
    ],
  });
  const fakeView = {
    state,
    visibleRanges: [{ from: 0, to: state.doc.length }],
  };

  const plugin: any = createLinkDecorationExtension({
    chipProperties: option?.chipProperties ?? ["status"],
    highlightFixmeLinks: true,
  });
  const value = plugin.create(fakeView);

  const result: { from: number; to: number; spec: any }[] = [];
  const cursor = (value.decorations as DecorationSet).iter();
  while (cursor.value) {
    result.push({ from: cursor.from, to: cursor.to, spec: cursor.value.spec });
    cursor.next();
  }
  return result;
}

const chipsOf = (decorations: { from: number; to: number; spec: any }[]) =>
  decorations.filter((d) => d.spec.class === "carnelian-link-status-chip");
const badgesOf = (decorations: { from: number; to: number; spec: any }[]) =>
  decorations.filter((d) => d.spec.widget != null);

describe("createLinkDecorationExtension", () => {
  beforeEach(() => {
    setupLinkResolutionApp([
      { path: "Notes/source.md" },
      { path: "Notes/Note.md", frontmatter: { status: "✅完了" } },
      { path: "Notes/Fixme.md", frontmatter: { fixme: true } },
      { path: "Notes/Plain.md", frontmatter: {} },
    ]);
  });

  test("エイリアスなしリンクはリンクテキスト全体にチップ枠が付く", () => {
    // "x [[Note]] y" -> リンクテキスト "Note" は offset 4-8
    const decorations = buildDecorations("x [[Note]] y");

    const chips = chipsOf(decorations);
    expect(chips).toHaveLength(1);
    expect(chips[0].from).toBe(4);
    expect(chips[0].to).toBe(8);
    expect(chips[0].spec.attributes["data-status"]).toBe("✅完了");

    // バッジは閉じ括弧 ]] の直後
    const badges = badgesOf(decorations);
    expect(badges).toHaveLength(1);
    expect(badges[0].from).toBe(10);
  });

  test("エイリアス付きリンクはチップ枠が表示されるエイリアス部分だけに付く", () => {
    // 58016a1の回帰テスト:
    // Live Previewで非表示になるタイトル部とパイプにmarkを貼ると、
    // 分割されたスパンのCSS padding/borderが空のチップ枠として残ってしまう
    // "x [[Note|alias]] y" -> タイトル部 "Note" は 4-8、エイリアス "alias" は 9-14
    const decorations = buildDecorations("x [[Note|alias]] y");

    const chips = chipsOf(decorations);
    expect(chips).toHaveLength(1);
    expect(chips[0].from).toBe(9); // タイトル部(4)ではなくエイリアスの先頭
    expect(chips[0].to).toBe(14);
    expect(chips[0].spec.attributes["data-status"]).toBe("✅完了");

    const badges = badgesOf(decorations);
    expect(badges).toHaveLength(1);
    expect(badges[0].from).toBe(16);
  });

  test("エイリアスが空(末尾パイプ)ならチップ枠はリンクテキスト全体に付く", () => {
    // "x [[Note|]] y" -> リンクテキスト "Note|" は 4-9
    const decorations = buildDecorations("x [[Note|]] y");

    const chips = chipsOf(decorations);
    expect(chips).toHaveLength(1);
    expect(chips[0].from).toBe(4);
    expect(chips[0].to).toBe(9);
  });

  test("選択範囲がリンクに重なる場合は装飾されない(ソース表示になるため)", () => {
    const decorations = buildDecorations("x [[Note|alias]] y", {
      selectionAnchor: 5,
    });
    expect(decorations).toHaveLength(0);
  });

  test("fixmeが有効なノートへのリンクはリンクテキスト全体が強調される", () => {
    // "x [[Fixme]] y" -> リンクテキスト "Fixme" は 4-9
    const decorations = buildDecorations("x [[Fixme]] y");

    const fixmes = decorations.filter(
      (d) => d.spec.class === "carnelian-link-fixme",
    );
    expect(fixmes).toHaveLength(1);
    expect(fixmes[0].from).toBe(4);
    expect(fixmes[0].to).toBe(9);
    // statusは無いためチップ・バッジは付かない
    expect(chipsOf(decorations)).toHaveLength(0);
    expect(badgesOf(decorations)).toHaveLength(0);
  });

  test("chipプロパティを持たないノートへのリンクは装飾されない", () => {
    const decorations = buildDecorations("x [[Plain]] y");
    expect(decorations).toHaveLength(0);
  });

  test("Live Previewでない(ソースモード)場合は装飾されない", () => {
    const decorations = buildDecorations("x [[Note]] y", {
      livePreview: false,
    });
    expect(decorations).toHaveLength(0);
  });

  test("複数リンクはそれぞれ独立して装飾される", () => {
    // "x [[Note]] and [[Note|a]] y" -> 1つ目の "Note" は 4-8、2つ目の "a" は 22-23
    const decorations = buildDecorations("x [[Note]] and [[Note|a]] y", {
      selectionAnchor: 27,
    });

    const chips = chipsOf(decorations);
    expect(chips).toHaveLength(2);
    expect(chips[0].from).toBe(4);
    expect(chips[0].to).toBe(8);
    expect(chips[1].from).toBe(22);
    expect(chips[1].to).toBe(23);
  });
});
