import { now } from "src/lib/helpers/datetimes";
import {
  appendTextToFile,
  getActiveFile,
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
  getPropertiesByPath,
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
    const file = getActiveFile();
    const body = getActiveFileBody();
    const updated = getActiveFileProperties()?.updated;
    if (file && body && updated) {
      // 起動直後、既にファイルが開かれている場合はファイルの中身を保存する (setOnCreateFileEvent では取得できないため)
      store.setEssentialBody({
        path: file.path,
        date: updated,
        body,
      });
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
      const updated = getPropertiesByPath(file.path)?.updated;
      if (!updated) {
        return;
      }

      store.setEssentialBody({
        path: file.path,
        date: updated,
        body,
        noOverwrite: true, // ファイルを開いて編集したあと、エディタを切り替えたときの問題に対応
      });
    });

    this.unsetExWCommandEventHandler = setOnExWCommandEvent(async (file) => {
      if (!file || !isMarkdownFile(file)) {
        return;
      }
      updateAutoDatePropertiesForActiveFile(file.path);
    }, this.name);
  }

  onunload(): void {
    this.unsetCreateFileEventHandler();
    this.unsetFileOpenEventHandler();
    this.unsetExWCommandEventHandler();
  }
}

export function updateAutoDatePropertiesForActiveFile(path: string): void {
  const updated = getActiveFileProperties()?.updated;
  const today = now("YYYY-MM-DD");
  if (!updated) {
    return;
  }

  const body = getActiveFileBody();
  if (!body) {
    return;
  }

  // 変更後の内容が特定日付時点の本質ハッシュと同一なら、updatedを戻して終了
  const hashDate = store.findDateByHash(path, body);
  if (hashDate && hashDate !== today) {
    if (hashDate !== updated) {
      updateActiveFileProperty("updated", hashDate);
      notify(`↩ updatedプロパティを『${hashDate}』に巻き戻しました`, 3000);
    }
  } else {
    store.setEssentialBody({ path, date: today, body });
    if (updated !== today) {
      updateActiveFileProperty("updated", today);
      notify(`🔄 updatedプロパティを『${today}』に更新しました`, 3000);
    }
  }
}
