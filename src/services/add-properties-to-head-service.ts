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

      this.removePropertiesElements();
      this.addPropertiesElement(file.path);
    });

    this.unsetPropertiesChangedEventRef = setOnPropertiesChangedEvent(
      (file, _, cache) => {
        this.removePropertiesElements();
        if (cache.frontmatter?.created && cache.frontmatter?.updated) {
          this.addPropertiesElement(file.path);
        }
      },
    );

    // 初回はイベントが発生しないので
    const path = getActiveFilePath();
    if (path != null) {
      this.addPropertiesElement(path);
    }
  }

  onunload() {
    this.unsetFileOpenHandler();
    this.unsetPropertiesChangedEventRef();
    this.removePropertiesElements();
  }

  /**
   * ボタンの要素を作成します
   * @param title (ex: 作成: 2023-10-09)
   */
  createButton(title: string, type: "date" | "status"): HTMLElement {
    return createDiv({
      text: title,
      cls:
        type === "date"
          ? "additional-properties__date-button"
          : type === "status"
            ? "additional-properties__status-button"
            : "",
    });
  }

  /**
   * ファイルが表示されているViewにプロパティ要素を追加します
   * @param path 追加するViewに表示されているファイルのpath
   */
  addPropertiesElement(path: string): void {
    const properties = getPropertiesByPath(path);
    if (!properties) {
      return;
    }

    const { created, updated, status } = properties;
    if (!(created || updated || status)) {
      return;
    }

    const propertiesEl = createDiv({ cls: this.className });
    if (created) {
      propertiesEl.appendChild(this.createButton(`作成日: ${created}`, "date"));
    }
    if (updated) {
      propertiesEl.appendChild(this.createButton(`更新日: ${updated}`, "date"));
    }
    if (status) {
      propertiesEl.appendChild(this.createButton(status, "status"));
    }
    insertElementBeforeHeader(propertiesEl);
  }

  /**
   * ファイルが表示されているViewからプロパティ要素を削除します
   * @param path 削除するViewに表示されているファイルのpath
   */
  removePropertiesElements(): void {
    removeElementsFromContainer(`.${this.className}`);
  }
}
