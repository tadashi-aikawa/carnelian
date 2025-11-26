import { runCommandById } from "src/lib/helpers/commands";
import { getActiveFile } from "src/lib/helpers/entries";
import { notifyValidationError } from "src/lib/helpers/ui";
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

  if (lint) {
    await lintFile(file, options.lint);
  }
  if (format) {
    await formatActiveFile(format);
  }

  runCommandById("editor:save-file");
}
