import { runCommandById } from "src/lib/helpers/commands";
import {
  getActiveFile,
  isMarkdownFile,
  waitUntilSaved,
} from "src/lib/helpers/entries";
import { notifyValidationError } from "src/lib/helpers/ui";
import { updateAutoDatePropertiesForActiveFile } from "src/services/auto-date-properties-service";
import { formatActiveFile } from "src/services/format-service";
import { lintFile } from "src/services/lint-service";
import type { PluginSettings } from "src/settings";

/**
 * LintやFormatなどを実行して保存します
 */
export async function saveWith(options: {
  lint?: PluginSettings["linter"];
  format?: PluginSettings["formatter"];
}) {
  const { lint, format } = options;
  const file = getActiveFile();
  if (!file) {
    return notifyValidationError("アクティブなファイルがありません");
  }

  // 最新のキャッシュを利用して処理を行うため
  runCommandById("editor:save-file");
  // 保存後すぐにファイルの内容を取得しても、保存前の内容が返されることがあるため
  await waitUntilSaved(file);

  if (lint) {
    await lintFile(file, lint, true);
  }
  if (format) {
    await formatActiveFile(format);
  }
  if (file && isMarkdownFile(file)) {
    updateAutoDatePropertiesForActiveFile(file.path);
  }

  // lintやformatで変更された結果を保存するため
  runCommandById("editor:save-file");
}
