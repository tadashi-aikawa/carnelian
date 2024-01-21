import { getActiveFileProperties } from "src/lib/helpers/properties";
import { openUrl } from "src/lib/helpers/ui";

/**
 * 現在ファイルのurlプロパティに記載されたURLを開きます
 */
export async function openPropertyUrl() {
  const url = getActiveFileProperties()?.url;
  if (!url) {
    return;
  }

  openUrl(url);
}
