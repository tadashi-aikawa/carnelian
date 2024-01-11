import { getActiveFilePath } from "src/lib/helpers/entries";
import {
  setOnFileOpenEvent,
  setOnPropertiesChangedEvent,
} from "src/lib/helpers/events";
import { getPropertiesByPath } from "src/lib/helpers/properties";
import {
  insertElementBeforeHeader,
  removeElementsFromContainer,
} from "src/lib/helpers/ui";
import { Service } from "src/services";

/**
 * 新しくファイルを開いたときに特定プロパティを差し込むサービスです
 */
export class AddPropertiesToHeadService implements Service {
  name = "Add properties to head";
  className = "additional-properties";

  unsetFileOpenHandler!: () => void;
  unsetPropertiesChangedEventRef!: () => void;

  onload() {
    this.unsetFileOpenHandler = setOnFileOpenEvent((file) => {
      if (!file) {
        return;
      }

      this.removeDatePropertiesElements();
      this.addDatePropertiesElement(file.path);
    });

    this.unsetPropertiesChangedEventRef = setOnPropertiesChangedEvent(
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
    this.unsetFileOpenHandler();
    this.unsetPropertiesChangedEventRef();
    this.removeDatePropertiesElements();
  }

  /**
   * 日付ボタンの要素を作成します
   * @param title (ex: 作成: 2023-10-09)
   */
  createDateButton(title: string): HTMLElement {
    return createDiv({
      text: title,
      cls: "additional-properties__button",
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
