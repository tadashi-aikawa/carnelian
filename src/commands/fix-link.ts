import {
  getActiveLine,
  getCursorOffsetAtActiveLine,
  setInActiveLineRange,
} from "src/lib/helpers/editors/basic";
import { getWikiLinks } from "src/lib/utils/strings";

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

  // INFO: 今は  [[title (alias)]] => [[title (alias)|title]] だけ
  //       今後拡張する可能性あり
  setInActiveLineRange(
    currentLink.range.start,
    currentLink.range.end,
    `[[${currentLink.title}|${currentLink.title.replace(/(.+) \(.+\)$/, "$1")}]]`,
  );
}
