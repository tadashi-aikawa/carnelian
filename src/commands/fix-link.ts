import { getActiveParagraph } from "src/lib/helpers/editors/advanced";
import {
  getActiveLine,
  getCursorOffsetAtActiveLine,
  setInActiveLineRange,
  setLinesInRange,
} from "src/lib/helpers/editors/basic";
import {
  formatTable,
  getWikiLinks,
  hasRedundantWikiLinkAlias,
} from "src/lib/utils/strings";

function formatActiveTableIfNeeded(line: string) {
  if (!line.startsWith("|")) {
    return;
  }

  const p = getActiveParagraph();
  if (!p) {
    return;
  }

  const formattedTableText = formatTable(p.text);
  if (!formattedTableText) {
    return;
  }

  setLinesInRange(p.startLine, p.endLine, formattedTableText);
}

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
    formatActiveTableIfNeeded(line);
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
  formatActiveTableIfNeeded(line);
}
