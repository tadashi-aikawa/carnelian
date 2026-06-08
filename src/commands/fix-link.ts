import {
  getActiveLine,
  getCursorOffsetAtActiveLine,
  setInActiveLineRange,
} from "src/lib/helpers/editors/basic";
import { getWikiLinks, hasRedundantWikiLinkAlias } from "src/lib/utils/strings";

/**
 * リンクを正します
 */
export function fixLink() {
  const line = getActiveLine();
  if (!line) {
    return;
  }

  const currentLink = getWikiLinks(line).find((x) => {
    const offsetAtLine = getCursorOffsetAtActiveLine()!;
    return x.range.start <= offsetAtLine && offsetAtLine <= x.range.end;
  });
  if (!currentLink) {
    return;
  }

  if (hasRedundantWikiLinkAlias(currentLink)) {
    setInActiveLineRange(
      currentLink.range.start,
      currentLink.range.end,
      `[[${currentLink.title}]]`,
    );
    return;
  }

  const alias = currentLink.title.replace(/(.+) \(.+\)$/, "$1");
  if (alias === currentLink.title) {
    return;
  }

  setInActiveLineRange(
    currentLink.range.start,
    currentLink.range.end,
    `[[${currentLink.title}|${alias}]]`,
  );
}
