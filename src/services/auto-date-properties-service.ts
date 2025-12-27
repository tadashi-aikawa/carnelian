import { now } from "src/lib/helpers/datetimes";
import {
  appendTextToFile,
  getActiveFileBody,
  isMarkdownFile,
  loadFileBodyCache,
  loadFileContentCache,
} from "src/lib/helpers/entries";
import {
  setOnCreateFileEvent,
  setOnExWCommandEvent,
  setOnFileOpenEvent,
} from "src/lib/helpers/events";
import {
  getActiveFileProperties,
  updateActiveFileProperty,
} from "src/lib/helpers/properties";
import { notify } from "src/lib/helpers/ui";
import type { Service } from "src/services";
import { store } from "src/store";

/**
 * ファイル作成時やファイルに意味のある更新がされたときに
 * created, updated プロパティを自動で追加・更新するサービスです。
 *
 * テンプレートなどで作成したファイルに最初からテキストが存在する場合は何もしません
 * (処理が競合してバグるためなので、それが解消したらやってもよい)
 */
export class AutoDatePropertiesService implements Service {
  name = "Add date properties";
  unsetCreateFileEventHandler!: () => void;
  unsetFileOpenEventHandler!: () => void;
  unsetExWCommandEventHandler!: () => void;

  onLayoutReady(): void {
    const body = getActiveFileBody();
    if (body) {
      // 起動直後、既にファイルが開かれている場合はファイルの中身を保存する (setOnCreateFileEvent では取得できないため)
      store.setEssentialBody(body);
    }

    this.unsetCreateFileEventHandler = setOnCreateFileEvent(async (file) => {
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

  onload(): void {
    this.unsetFileOpenEventHandler = setOnFileOpenEvent(async (file) => {
      if (!file || !isMarkdownFile(file)) {
        return;
      }

      const body = await loadFileBodyCache(file.path);
      if (!body) {
        return;
      }

      store.setEssentialBody(body);
    });

    this.unsetExWCommandEventHandler = setOnExWCommandEvent(async (file) => {
      if (!file || !isMarkdownFile(file)) {
        return;
      }
      updateAutoDatePropertiesForActiveFile();
    }, this.name);
  }

  onunload(): void {
    this.unsetCreateFileEventHandler();
    this.unsetFileOpenEventHandler();
    this.unsetExWCommandEventHandler();
  }
}

export function updateAutoDatePropertiesForActiveFile(): void {
  const updated = getActiveFileProperties()?.updated;
  if (!updated || updated === now("YYYY-MM-DD")) {
    return;
  }

  const body = getActiveFileBody();
  if (!body) {
    return;
  }

  if (store.equals(body)) {
    // 実質的に内容が変わっていない場合は何もしない
    return;
  }

  store.setEssentialBody(body);
  updateActiveFileProperty("updated", now("YYYY-MM-DD"));
  notify("最終更新日を更新しました", 3000);
}
