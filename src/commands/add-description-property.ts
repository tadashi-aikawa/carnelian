import {
  getActiveLine,
  getSelectionLines,
} from "src/lib/helpers/editors/basic";
import {
  addActiveFileProperty,
  focusPropertyValue,
} from "src/lib/helpers/properties";
import { stripDecoration, stripLinks } from "src/lib/obsutils/parser";

/**
 * descriptionプロパティを追加します
 *
 * 選択時: 選択した文字列からdecorationを解除したものを初期値に設定します
 * 非選択時: 現在行の値からdecorationを解除したものを初期値に設定します
 */
export function addDescriptionProperty() {
  const description = getSelectionLines()?.join("") ?? getActiveLine()!;
  addActiveFileProperty(
    "description",
    stripLinks(stripDecoration(description)),
  );
  focusPropertyValue("description");
}
