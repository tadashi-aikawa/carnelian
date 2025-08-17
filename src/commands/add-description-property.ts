import {
  getActiveLine,
  getSelectionLines,
} from "src/lib/helpers/editors/basic";
import { addActiveFileProperty } from "src/lib/helpers/properties";
import { stripDecoration, stripLinks } from "src/lib/obsutils/parser";

/**
 * descriptionプロパティを追加します
 *
 * 選択時: 選択した文字列からdecorationを解除したものを設定します
 * 非選択時: 現在行の値からdecorationを解除したものを設定します
 */
export function addDescriptionProperty() {
  const description = getSelectionLines()?.join("") ?? getActiveLine()!;
  addActiveFileProperty(
    "description",
    stripLinks(stripDecoration(description)),
  );
}
