import { formatProperties } from "src/definitions/formatter";
import {
  getActiveCursor,
  getActiveEditor,
} from "src/lib/helpers/editors/basic";
import { getActiveFile, getActiveFileContent } from "src/lib/helpers/entries";
import { setOnExWCommandEvent } from "src/lib/helpers/events";
import { formatLineBreaks } from "src/lib/obsutils/formatter";
import { isMatchedGlobPatterns } from "src/lib/utils/strings";
import type { Service } from "src/services";
import type { PluginSettings } from "src/settings";

/**
 * ファイルを保存にしたときに自動フォーマットするサービスです
 */
export class FormatService implements Service {
  name = "Format";
  unsetExWCommandHandler!: () => void;

  constructor(public settings: PluginSettings["formatter"]) {}

  onload(): void {
    this.unsetExWCommandHandler = setOnExWCommandEvent(async (file) => {
      await formatActiveFile(this.settings);
    }, this.name);
  }

  onunload(): void {
    this.unsetExWCommandHandler();
  }
}

/**
 * 現在ファイルをフォーマットします
 */
export async function formatActiveFile(settings: PluginSettings["formatter"]) {
  const activeFile = getActiveFile();
  if (!activeFile) {
    return;
  }

  const shouldIgnored = isMatchedGlobPatterns(
    activeFile.path,
    settings?.ignoreFiles ?? [],
  );
  if (shouldIgnored) {
    return;
  }

  // lintのfixでプロパティが変わった場合にcacheが更新されるまでの猶予が必要なため
  await sleep(10);

  formatProperties(settings);

  const content = getActiveFileContent();
  if (!content) {
    return;
  }

  const cursor = getActiveCursor();
  if (!cursor) {
    return;
  }

  const changes = formatLineBreaks(content);

  const editor = getActiveEditor()!;
  editor.transaction({
    changes: Array.from(changes),
  });
}
