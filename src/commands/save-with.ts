import { runCommandById } from "src/lib/helpers/commands";
import { getActiveFile } from "src/lib/helpers/entries";
import { notifyValidationError } from "src/lib/helpers/ui";
import { formatFile } from "src/services/format-service";
import { lintFile } from "src/services/lint-service";

/**
 * LintやFormatなどを実行して保存します
 */
export function saveWith(options: { lint?: boolean; format?: boolean }) {
  const { lint, format } = options;
  const file = getActiveFile();
  if (!file) {
    return notifyValidationError("アクティブなファイルがありません");
  }

  if (lint) {
    lintFile(file);
  }
  if (format) {
    formatFile(file);
  }

  runCommandById("editor:save-file");
}
