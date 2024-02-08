import { getActiveLine, insertToCursor } from "src/lib/helpers/editors/basic";
import { addUrlProperty } from "./add-url-property";
import { addTagsProperty } from "./add-tags-property";
import { addDescriptionProperty } from "./add-description-property";
import { getClipboardText } from "src/lib/helpers/ui";

const isUrl = (text: string) =>
  text.startsWith("http://") || text.startsWith("https://");

/**
 * カーソル行の内容からよしなにプロパティを追加します
 */
export async function addPropertySuitably() {
  const line = getActiveLine()!;

  if (isUrl(line)) {
    addUrlProperty();
    return;
  }

  if (line.startsWith("#")) {
    addTagsProperty();
    return;
  }

  if (line) {
    addDescriptionProperty();
    return;
  }

  const text = await getClipboardText();
  if (isUrl(text)) {
    insertToCursor(text);
    addUrlProperty();
    return;
  }

  addTagsProperty();
}
