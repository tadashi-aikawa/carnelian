import { getActiveParagraph } from "src/lib/helpers/editors/advanced";
import { setLinesInRange } from "src/lib/helpers/editors/basic";
import * as strings from "../lib/utils/strings";

/**
 * Markdownテーブルをフォーマットします
 * WARN: このメソッドはObsidian MobileのiPhone/iPadでは動作しない可能性があります
 */
export function formatTable() {
  const p = getActiveParagraph();
  if (!p) {
    return;
  }

  const formattedTableText = strings.formatTable(p.text);
  if (!formattedTableText) {
    return;
  }

  setLinesInRange(p.startLine, p.endLine, formattedTableText);
}
