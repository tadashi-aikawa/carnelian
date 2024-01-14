import {
  deleteActiveLine,
  getActiveLineTags,
} from "src/lib/helpers/editors/basic";
import {
  addActiveFileProperty,
  focusPropertyValue,
} from "src/lib/helpers/properties";

/**
 * tagsプロパティを追加します
 * 現在行に#tag形式のタグがある場合は、それをプロパティに移動します
 */
export function addTagsProperty() {
  const addedTags = getActiveLineTags()!;
  addActiveFileProperty("tags", addedTags);
  if (addedTags.length > 0) {
    // XXX: タグ以外のものも削除してしまうが、Minervaではそのようなケースで利用しないので一旦捨ておく
    deleteActiveLine();
  } else {
    focusPropertyValue("tags");
  }
}
