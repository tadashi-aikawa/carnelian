import { getActiveLine } from "src/lib/helpers/editors/basic";
import { addActiveFileProperty } from "src/lib/helpers/properties";
import { getClipboardText } from "src/lib/helpers/ui";
import { isUrl } from "src/lib/utils/strings";
import { addDescriptionProperty } from "./add-description-property";
import { addUrlProperty } from "./add-url-property";

/**
 * カーソル行の内容からよしなにプロパティを追加します
 */
export async function addPropertySuitably() {
  const line = getActiveLine()!;

  if (isUrl(line)) {
    addUrlProperty();
    return;
  }

  if (line) {
    addDescriptionProperty();
    return;
  }

  const text = await getClipboardText({ trim: true });
  if (isUrl(text)) {
    addActiveFileProperty("url", text);
    return;
  }
}
