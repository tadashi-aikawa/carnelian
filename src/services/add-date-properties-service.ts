import { now } from "src/lib/helpers/datetimes";
import {
  appendTextToFile,
  loadFileContentCache,
} from "src/lib/helpers/entries";
import { setOnCreateFileEvent } from "src/lib/helpers/events";
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
      const content = await loadFileContentCache(file.path);
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
`.trimStart(),
      );
    });
  }

  onunload(): void {
    this.unsetHandler();
  }
}
