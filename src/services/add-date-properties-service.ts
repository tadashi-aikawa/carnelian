import { now } from "src/lib/helpers/datetimes";
import {
  appendTextToFile,
  isMarkdownFile,
  loadFileContentCache,
} from "src/lib/helpers/entries";
import { setOnCreateFileEvent } from "src/lib/helpers/events";
import type { Service } from "src/services";

/**
 * 新しくファイルを作成したときにテンプレのテキストを差し込むサービスです
 * 既にテキストが存在する場合は何もしません
 */
export class AddDatePropertiesService implements Service {
  name = "Add date properties";
  unsetHandler!: () => void;

  onLayoutReady(): void {
    this.unsetHandler = setOnCreateFileEvent(async (file) => {
      if (!isMarkdownFile(file)) {
        // Markdownファイルでない場合は何もしない
        return;
      }

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
