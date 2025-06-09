import { getActiveFile } from "src/lib/helpers/entries";
import { addActiveFileProperty } from "src/lib/helpers/properties";
import { notifyValidationError } from "src/lib/helpers/ui";

/**
 * パーマネントリンクプロパティを追加します (ADRのみ)
 */
export function addPermalinkProperty() {
  const file = getActiveFile();
  if (!file) {
    return notifyValidationError("No active file found");
  }

  const permalink = file.basename.toLowerCase().split(" ")[0].slice(2);
  addActiveFileProperty("permalink", permalink);
}
