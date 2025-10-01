import { deleteActiveFile as _deleteActiveFile } from "src/lib/helpers/entries";

/**
 * 現在ファイルを削除します
 * 削除後にタブグループが空になった場合は、タブグループも閉じます。
 */
export async function deleteActiveFile() {
  await _deleteActiveFile();
}
