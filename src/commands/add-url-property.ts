import { deleteActiveLine, getActiveLine } from "src/lib/helpers/editors/basic";
import {
  addActiveFileProperty,
  focusPropertyValue,
} from "src/lib/helpers/properties";
import { doSinglePatternMatching } from "src/lib/utils/strings";

/**
 * urlsプロパティを追加します
 * 現在行にURLがある場合は、それをプロパティに移動します
 */
export function addUrlProperty() {
  const line = getActiveLine()!;
  const [url] = doSinglePatternMatching(line, /https?:\/\/\S+$/g);

  addActiveFileProperty("url", url ?? "");
  if (url) {
    deleteActiveLine();
  } else {
    focusPropertyValue("url");
  }
}
