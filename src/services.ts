import { EventRef } from "obsidian";
import { getActiveFilePath } from "./lib/helpers/entries";
import {
  setOnFileOpenEvent,
  setOnPropertiesChangedEvent,
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
  return [new AddDatePropertiesToHeadService()];
}

export interface Service {
  name: string;
  onload(): void;
  onunload(): void;
}

class AddDatePropertiesToHeadService implements Service {
  name = "Add Date properties to head";
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
