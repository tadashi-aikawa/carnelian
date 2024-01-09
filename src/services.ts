import { EventRef } from "obsidian";
import { now } from "./lib/helpers/datetimes";
import {
  appendTextToFile,
  getActiveFilePath,
  loadFileContent,
} from "./lib/helpers/entries";
import {
  setOnCreateFileEvent as setOnFileCreatedEvent,
  setOnFileOpenEvent,
  setOnPropertiesChangedEvent,
  unsetOnCreateFileEvent as unsetOnFileCreatedEvent,
  unsetOnFileOpenEvent,
  unsetOnPropertiesChangedEvent,
} from "./lib/helpers/events";
import { getPropertiesByPath } from "./lib/helpers/properties";
import {
  insertElementBeforeHeader,
  removeElementsFromContainer,
} from "./lib/helpers/ui";
import { PluginSettings } from "./settings";

export function createServices(settings: PluginSettings): Service[] {
  return [new AddDatePropertiesToHeadService(), new AddDatePropertiesService()];
}

export interface Service {
  name: string;
  onload?(): void;
  onLayoutReady?(): void;
  onunload?(): void;
}

/**
 * 新しくファイルを開いたときにテンプレのテキストを差し込むサービスです
 * 既にテキストが存在する場合は何もしません
 */
class AddDatePropertiesService implements Service {
  name = "Add date properties";
  fileCreatedEventRef!: EventRef;

  onLayoutReady(): void {
    this.fileCreatedEventRef = setOnFileCreatedEvent(async (file) => {
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
      `.trim()
      );
    });
  }

  onunload(): void {
    unsetOnFileCreatedEvent(this.fileCreatedEventRef);
  }
}

/**
 * 新しくファイルを開いたときにcreated/updatesプロパティを差し込むサービスです
 * 既にテキストが存在する場合は何もしません
 */
class AddDatePropertiesToHeadService implements Service {
  name = "Add date properties to head";
  className = "additional-date-properties";
  fileOpenEventRef!: EventRef;
  propertiesChangedEventRef!: EventRef;

  constructor() {}

  onload() {
    this.fileOpenEventRef = setOnFileOpenEvent((file) => {
      if (!file) {
        return;
      }

      this.removeDatePropertiesElements();
      this.addDatePropertiesElement(file.path);
    });

    this.propertiesChangedEventRef = setOnPropertiesChangedEvent(
      (file, _, cache) => {
        this.removeDatePropertiesElements();
        if (cache.frontmatter?.created && cache.frontmatter?.updated) {
          this.addDatePropertiesElement(file.path);
        }
      }
    );

    // 初回はイベントが発生しないので
    const path = getActiveFilePath();
    if (path != null) {
      this.addDatePropertiesElement(path);
    }
  }

  onunload() {
    unsetOnFileOpenEvent(this.fileOpenEventRef);
    unsetOnPropertiesChangedEvent(this.propertiesChangedEventRef);
    this.removeDatePropertiesElements();
  }

  /**
   * 日付ボタンの要素を作成します
   * @param title (ex: 作成: 2023-10-09)
   */
  createDateButton(title: string): HTMLElement {
    return createDiv({
      text: title,
      cls: "additional-date-properties__date-button",
    });
  }

  /**
   * ファイルが表示されているViewに日付プロパティ要素を追加します
   * @param path 追加するViewに表示されているファイルのpath
   */
  addDatePropertiesElement(path: string): void {
    const properties = getPropertiesByPath(path);
    if (!properties) {
      return;
    }

    const { created, updated } = properties;
    if (!(created && updated)) {
      return;
    }

    const datePropertiesEl = createDiv({ cls: this.className });
    datePropertiesEl.appendChild(this.createDateButton(`作成日: ${created}`));
    datePropertiesEl.appendChild(this.createDateButton(`更新日: ${updated}`));
    insertElementBeforeHeader(datePropertiesEl);
  }

  /**
   * ファイルが表示されているViewから日付プロパティ要素を削除します
   * @param path 削除するViewに表示されているファイルのpath
   */
  removeDatePropertiesElements(): void {
    removeElementsFromContainer(`.${this.className}`);
  }
}
