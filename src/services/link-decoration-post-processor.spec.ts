import { beforeEach, describe, expect, mock, test } from "bun:test";
import { setupObsidianDom } from "src/lib/test-helpers/obsidian-dom";
import {
  obsidianMock,
  setupLinkResolutionApp,
} from "src/lib/test-helpers/obsidian-mock";

mock.module("obsidian", () => obsidianMock);

const { dom } = setupObsidianDom();

const { createLinkDecorationPostProcessor } = await import(
  "./link-decoration-post-processor"
);

function createContainer(html: string): HTMLElement {
  const el = dom.window.document.createElement("div");
  el.innerHTML = html;
  return el;
}

const ctx = { sourcePath: "Notes/source.md" } as any;
const options = { chipProperties: ["status"], highlightFixmeLinks: true };

describe("createLinkDecorationPostProcessor", () => {
  beforeEach(() => {
    setupLinkResolutionApp([
      { path: "Notes/source.md" },
      { path: "Notes/Done note.md", frontmatter: { status: "✅完了" } },
      { path: "Notes/Fixme note.md", frontmatter: { fixme: true } },
      { path: "Notes/Plain note.md", frontmatter: {} },
    ]);
  });

  test("statusを持つノートへのリンクにチップclass・data-status・tail要素が付く", () => {
    const el = createContainer(
      `<p><a class="internal-link" data-href="Done note" href="Done note">Done note</a></p>`,
    );
    createLinkDecorationPostProcessor(options)(el, ctx);

    const anchor = el.querySelector("a.internal-link")!;
    expect(anchor.classList.contains("carnelian-link-status-chip")).toBe(true);
    expect(anchor.getAttribute("data-status")).toBe("✅完了");

    const tail = anchor.nextElementSibling!;
    expect(tail.classList.contains("carnelian-link-status-chip-tail")).toBe(
      true,
    );
    expect(tail.getAttribute("data-status")).toBe("✅完了");
    const badge = tail.querySelector(".carnelian-link-status-badge")!;
    expect(badge.textContent).toBe("✅完了");
  });

  test("同じDOMに複数回適用しても装飾が重複しない(冪等性)", () => {
    const el = createContainer(
      `<p><a class="internal-link" data-href="Done note" href="Done note">Done note</a></p>`,
    );
    const processor = createLinkDecorationPostProcessor(options);
    processor(el, ctx);
    processor(el, ctx);
    processor(el, ctx);

    expect(
      el.querySelectorAll(".carnelian-link-status-chip-tail"),
    ).toHaveLength(1);
    const anchor = el.querySelector("a.internal-link")!;
    expect(anchor.className.split(" ")).toEqual([
      "internal-link",
      "carnelian-link-status-chip",
    ]);
  });

  test("再適用時にstatusが解決できなくなっていたら装飾が取り除かれる", () => {
    const el = createContainer(
      `<p><a class="internal-link" data-href="Done note" href="Done note">Done note</a></p>`,
    );
    const processor = createLinkDecorationPostProcessor(options);
    processor(el, ctx);

    // リンク先ノートからstatusが消えたケース
    setupLinkResolutionApp([
      { path: "Notes/source.md" },
      { path: "Notes/Done note.md", frontmatter: {} },
    ]);
    processor(el, ctx);

    const anchor = el.querySelector("a.internal-link")!;
    expect(anchor.classList.contains("carnelian-link-status-chip")).toBe(false);
    expect(anchor.getAttribute("data-status")).toBeNull();
    expect(
      el.querySelectorAll(".carnelian-link-status-chip-tail"),
    ).toHaveLength(0);
  });

  test("fixmeが有効なノートへのリンクにはfixme強調classが付く", () => {
    const el = createContainer(
      `<p><a class="internal-link" data-href="Fixme note" href="Fixme note">Fixme note</a></p>`,
    );
    createLinkDecorationPostProcessor(options)(el, ctx);

    const anchor = el.querySelector("a.internal-link")!;
    expect(anchor.classList.contains("carnelian-link-fixme")).toBe(true);
    // statusは無いためチップは付かない
    expect(anchor.classList.contains("carnelian-link-status-chip")).toBe(false);
  });

  test("埋め込みノート内のリンクは装飾されない", () => {
    const el = createContainer(
      `<div class="internal-embed"><a class="internal-link" data-href="Done note" href="Done note">Done note</a></div>`,
    );
    createLinkDecorationPostProcessor(options)(el, ctx);

    const anchor = el.querySelector("a.internal-link")!;
    expect(anchor.classList.contains("carnelian-link-status-chip")).toBe(false);
    expect(
      el.querySelectorAll(".carnelian-link-status-chip-tail"),
    ).toHaveLength(0);
  });

  test("hrefを持たないリンクはスキップされる", () => {
    const el = createContainer(`<p><a class="internal-link">Done note</a></p>`);
    createLinkDecorationPostProcessor(options)(el, ctx);

    const anchor = el.querySelector("a.internal-link")!;
    expect(anchor.classList.contains("carnelian-link-status-chip")).toBe(false);
  });

  test("エイリアス表示のリンクでもdata-hrefから装飾が解決される", () => {
    const el = createContainer(
      `<p><a class="internal-link" data-href="Done note" href="Done note">別名表示</a></p>`,
    );
    createLinkDecorationPostProcessor(options)(el, ctx);

    const anchor = el.querySelector("a.internal-link")!;
    expect(anchor.getAttribute("data-status")).toBe("✅完了");
  });
});
