import type { MarkdownPostProcessor } from "obsidian";
import {
  createStatusChipTail,
  type LinkDecorationOptions,
  resolveLinkDecoration,
} from "./link-decoration-common";

/**
 * Reading view向けに、レンダリング済みHTMLの内部リンクへ
 * Live Previewと同じ装飾(チップ/バッジ、fixme強調)を適用するpost processorを生成します
 */
export function createLinkDecorationPostProcessor(
  options: LinkDecorationOptions,
): MarkdownPostProcessor {
  return (el, ctx) => {
    for (const anchor of Array.from(
      el.querySelectorAll<HTMLAnchorElement>("a.internal-link"),
    )) {
      // el内に展開された埋め込みノートのリンクは、埋め込み側のrender context
      // (sourcePathが埋め込み先ノート)で処理されるため、装飾もクリーンアップもしない
      const embed = anchor.closest(".internal-embed");
      if (embed && el.contains(embed)) {
        continue;
      }

      // 同じDOMに複数回呼ばれても装飾が重複・残留しないよう、前回の装飾を取り除く
      anchor.removeClass("carnelian-link-status-chip", "carnelian-link-fixme");
      anchor.removeAttribute("data-status");
      const next = anchor.nextElementSibling;
      if (next?.classList.contains("carnelian-link-status-chip-tail")) {
        next.remove();
      }

      const linkText =
        anchor.getAttribute("data-href") ?? anchor.getAttribute("href");
      if (!linkText) {
        continue;
      }

      const { fixme, status } = resolveLinkDecoration(
        linkText,
        ctx.sourcePath,
        options,
      );

      if (fixme) {
        anchor.addClass("carnelian-link-fixme");
      }

      if (status != null) {
        anchor.addClass("carnelian-link-status-chip");
        anchor.setAttribute("data-status", status);
        anchor.insertAdjacentElement("afterend", createStatusChipTail(status));
      }
    }
  };
}
