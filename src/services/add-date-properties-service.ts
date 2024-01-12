import { now } from "src/lib/helpers/datetimes";
import {
  appendLine,
  getActiveEditor,
  moveToLastLine,
} from "src/lib/helpers/editors/basic";
import { appendTextToFile, loadFileContent } from "src/lib/helpers/entries";
import {
  setOnCreateFileEvent,
  setOnFileOpenEvent,
} from "src/lib/helpers/events";
import { notify } from "src/lib/helpers/ui";
import { Service } from "src/services";

/**
 * 新しくファイルを開いたときにテンプレのテキストを差し込むサービスです
 * 既にテキストが存在する場合は何もしません
 */
export class AddDatePropertiesService implements Service {
  name = "Add date properties";
  unsetHandler!: () => void;

  onLayoutReady(): void {
    this.unsetHandler = setOnCreateFileEvent(async (file) => {
      const content = await loadFileContent(file.path);
      if (content) {
        // テンプレ付きのコンテンツの場合は何もしない
        return;
      }

      const today = now("YYYY-MM-DD");
      await appendTextToFile(
        file.path,
        `
---
created: ${today}
updated: ${today}
---
`.trimStart()
      );
    });
  }

  onunload(): void {
    this.unsetHandler();
  }
}
