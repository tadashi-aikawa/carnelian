import { now } from "src/lib/helpers/datetimes";

import {
  getActiveFileContent,
  getCreationDate,
  getUpdateDate,
} from "src/lib/helpers/entries";
import { notify } from "src/lib/helpers/ui";
import { doSinglePatternMatching } from "src/lib/utils/strings";
import {
  addActiveFileProperties,
  getActiveFileProperties,
  updateActiveFileProperty,
} from "../lib/helpers/properties";

/**
 * createdとupdatedのプロパティを更新します
 */
export function updateChangeLog() {
  const properties = getActiveFileProperties();
  if (properties?.updated) {
    updateActiveFileProperty("updated", now("YYYY-MM-DD"));
    return notify("最終更新日を更新しました", 3000);
  }

  // フッタにHTML形式の記録があるなら、その日付を使う
  const created = doSinglePatternMatching(
    getActiveFileContent()!,
    /<div class="minerva-created-meta">(20[0-9]{2}\/[0-9]{2}\/[0-9]{2})<\/div>/g,
  )
    ?.first()
    ?.replace(/\//g, "-");
  const updated = doSinglePatternMatching(
    getActiveFileContent()!,
    /<div class="minerva-updated-meta">(20[0-9]{2}\/[0-9]{2}\/[0-9]{2})<\/div>/g,
  )
    ?.first()
    ?.replace(/\//g, "-");

  if (created != null) {
    // FIXME: "----" から最後までを削除する
    addActiveFileProperties({ created, updated });
    return notify("フッターからchange logを更新しました", 3000);
  }

  // 他に情報がなければファイルのメタデータを使う
  // バックアップの復元や、本質的な変更以外でも日付がセットされてしまうのであまり信用できない
  addActiveFileProperties({
    created: getCreationDate("YYYY-MM-DD"),
    updated: getUpdateDate("YYYY-MM-DD"),
  });
  notify("ファイルのメタデータからchange logを更新しました", 3000);
}
