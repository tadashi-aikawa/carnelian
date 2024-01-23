import { getActiveFileProperties } from "src/lib/helpers/properties";
import { copyToClipboard, notify } from "src/lib/helpers/ui";

/**
 * URLプロパティの値をクリップボードにコピーします
 */
export async function copyUrlProperty() {
  const url = getActiveFileProperties()?.url;
  if (!url) {
    return;
  }

  await copyToClipboard(url);
  notify("👍urlプロパティの値をコピーしました", 5000);
}
