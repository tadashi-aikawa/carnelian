import { linkText2PathFrom } from "src/lib/helpers/links";
import { getPropertiesByPath } from "src/lib/helpers/properties";
import { parseInternalLinkText } from "src/lib/obsutils/parser";

export interface LinkDecorationOptions {
  /**
   * リンクをチップ(枠)で囲み、右端にリンク先ノートのプロパティ値をバッジ表示する
   * (配列の先に見つかったプロパティの値を表示。空配列なら表示しない)
   */
  chipProperties: string[];
  /** リンク先ノートのfixmeプロパティが有効なリンクを強調表示する */
  highlightFixmeLinks: boolean;
}

/**
 * リンクテキストからリンク先ノートのプロパティを引き、装飾内容を決定します
 */
export function resolveLinkDecoration(
  linkText: string,
  sourcePath: string,
  options: LinkDecorationOptions,
): { fixme: boolean; status: string | null } {
  const path = linkText2PathFrom(parseInternalLinkText(linkText), sourcePath);
  if (!path) {
    return { fixme: false, status: null };
  }

  const properties = getPropertiesByPath(path);

  const fixme = options.highlightFixmeLinks && properties?.fixme === true;

  const status =
    options.chipProperties
      .map((key) => properties?.[key])
      .find(
        (value): value is string => typeof value === "string" && value !== "",
      ) ?? null;

  return { fixme, status };
}

/**
 * リンク直後に表示する、縦線区切り + statusテキストの要素を生成します
 * (リンクテキスト側がチップ枠を担い、その外側に続けて表示する)
 */
export function createStatusChipTail(status: string): HTMLElement {
  // 色などの見た目はCSSの属性セレクタ([data-status^="✅"]など)で制御する
  const tail = createSpan({
    cls: "carnelian-link-status-chip-tail",
    attr: { "data-status": status },
  });
  tail.createSpan({
    cls: "carnelian-link-status-badge",
    text: status,
    attr: { "data-status": status },
  });
  return tail;
}
