import { deleteActiveFile as _deleteActiveFile } from "src/lib/helpers/entries";
import { getActiveFileBacklinkPaths } from "src/lib/helpers/links";
import { notifyRuntimeError } from "src/lib/helpers/ui";

/**
 * 現在ファイルを削除します
 *
 * - バックリンクが存在する場合はエラーになります
 * - 削除後にタブグループが空になった場合は、タブグループも閉じます
 */
export async function deleteActiveFile() {
  const backlinkPaths = getActiveFileBacklinkPaths();
  const num = backlinkPaths.length;
  const maxDisplay = 10;
  if (num > 0) {
    const list = backlinkPaths
      .slice(0, maxDisplay)
      .map((p) => `- ${p}`)
      .join("\n");

    const footer = num > maxDisplay ? `\n\n... 他 ${num - maxDisplay} 件` : "";

    return notifyRuntimeError(
      `ファイルへのバックリンクが ${num}つ 存在するため、削除できません。

📒 バックリンク元:
${list}${footer}`,
    );
  }
  await _deleteActiveFile();
}
