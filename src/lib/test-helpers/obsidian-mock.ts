import { StateField } from "@codemirror/state";

/**
 * テスト用のobsidianモジュールモック。
 *
 * obsidianパッケージは型定義のみでランタイム実装を持たないため、
 * specでは `mock.module("obsidian", () => obsidianMock)` で差し替える。
 * bunは全specを同一プロセスで実行し、一度確定したモジュールのexport形状は
 * 後から変えられないため、**すべてのspecでこの共通モックを使うこと**
 * (specごとに異なる形のモックを定義すると "Export named ... not found" になる)。
 */

/** Live Previewかどうか(テスト側で `.init(() => false)` で上書き可能) */
export const editorLivePreviewField = StateField.define<boolean>({
  create: () => true,
  update: (v) => v,
});

/** エディタの表示ファイル情報 */
export const editorInfoField = StateField.define<{
  file: { path: string } | null;
}>({
  create: () => ({ file: { path: "Notes/source.md" } }),
  update: (v) => v,
});

export const obsidianMock = {
  normalizePath: (path: string) => path,
  Modal: class {},
  SuggestModal: class {},
  Notice: class {},
  editorLivePreviewField,
  editorInfoField,
};

type FakeNote = {
  path: string;
  frontmatter?: Record<string, unknown>;
};

/**
 * リンク解決(vault / metadataCache)に必要なグローバルappを
 * 指定ノート群で解決できるように差し替えます
 */
export function setupLinkResolutionApp(notes: FakeNote[]): void {
  const byPath = new Map(notes.map((n) => [n.path, n]));
  const byBasename = new Map(
    notes.map((n) => [n.path.split("/").pop()!.replace(/\.md$/, ""), n]),
  );

  (globalThis as any).app = {
    vault: {
      getAbstractFileByPath: (path: string) =>
        byPath.has(path) ? { path } : null,
    },
    metadataCache: {
      getFirstLinkpathDest: (linkText: string, _sourcePath: string) => {
        const note = byBasename.get(linkText);
        return note ? { path: note.path } : null;
      },
      getFileCache: (file: { path: string }) => {
        const note = byPath.get(file.path);
        return note ? { frontmatter: note.frontmatter } : null;
      },
    },
  };
}
