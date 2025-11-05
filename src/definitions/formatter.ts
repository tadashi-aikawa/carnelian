import { sortActiveFileProperties } from "src/lib/helpers/properties";

/**
 * Carnelianのフォーマットルールに沿ってフォーマットする
 * TODO: 設定で変更できてもいいかも?
 */
export function formatProperties() {
  sortActiveFileProperties(["title", "created", "updated"], {
    removeIfEmpty: true,
  });
}
