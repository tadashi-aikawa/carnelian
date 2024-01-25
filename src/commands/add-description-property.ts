import { getActiveLine } from "src/lib/helpers/editors/basic";
import {
  addActiveFileProperty,
  focusPropertyValue,
} from "src/lib/helpers/properties";
import { stripDecoration, stripLinks } from "src/lib/obsutils/parser";

/**
 * descriptionプロパティを追加します
 * 現在行の値からdecorationを解除したものを初期値に設定します。
 */
export function addDescriptionProperty() {
  const line = getActiveLine()!;
  addActiveFileProperty("description", stripLinks(stripDecoration(line)));
  focusPropertyValue("description");
}
