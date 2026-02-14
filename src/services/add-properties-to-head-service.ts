import { now } from "src/lib/helpers/datetimes";
import { getActiveFilePath } from "src/lib/helpers/entries";
import {
  setOnActiveLeafChangeEvent,
  setOnPropertiesChangedEvent,
} from "src/lib/helpers/events";
import { getPropertiesByPath } from "src/lib/helpers/properties";
import {
  insertElementAfterHeader,
  removeElementsFromContainer,
} from "src/lib/helpers/ui";
import { ExhaustiveError } from "src/lib/utils/errors";
import type { Service } from "src/services";

/**
 * 日付の文字列を表示形式にします
 * @params date (ex: 2023-10-09 or 2023-10-09T12:00:00 or 2023-10-09 12:00:00)
 */
function toDisplay(datetime: string): string {
  const today = now("YYYY-MM-DD");
  const [date, _time] = datetime.split(/[ T]/);
  const time = _time.split(":").slice(0, 2).join(":");
  return `${date === today ? "✨Today" : date} ${time ? ` ${time}` : ""}`;
}

/**
 * ファイルをアクティブにしたときに特定プロパティをヘッダーエレメントとしてを差し込むサービスです
 */
export class AddPropertiesToHeadService implements Service {
  name = "Add properties to head";
  className = "additional-properties";

  unsetActiveLeafChangeHandler!: () => void;
  unsetPropertiesChangedEventRef!: () => void;

  onLayoutReady(): void {
    // reload時は初回はイベントが発生しないので
    // WARN: 冪等性担保の実装が必要
    const path = getActiveFilePath();
    if (path != null) {
      this.removePropertiesElements();
      this.addPropertiesElement(path);
    }
  }

  onload() {
    this.unsetActiveLeafChangeHandler = setOnActiveLeafChangeEvent((leaf) => {
      const file = leaf?.view.file;
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
  }

  onunload() {
    this.unsetActiveLeafChangeHandler();
    this.unsetPropertiesChangedEventRef();
    this.removePropertiesElements();
  }

  /**
   * ヘッダコンテナの要素を作成します
   * @param title (ex: 作成: 2023-10-09)
   */
  createHeaderContainer(title: string, type: "date" | "status"): HTMLElement {
    switch (type) {
      case "date":
        return createDiv({
          text: title,
          cls: "additional-properties__date-container",
        });
      case "status":
        return createDiv({
          text: title,
          cls: "additional-properties__status-container",
        });
      default:
        throw new ExhaustiveError(type);
    }
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
      propertiesEl.appendChild(
        this.createHeaderContainer(`作成日: ${toDisplay(created)}`, "date"),
      );
    }
    if (updated) {
      propertiesEl.appendChild(
        this.createHeaderContainer(`更新日: ${toDisplay(updated)}`, "date"),
      );
    }
    if (status) {
      propertiesEl.appendChild(this.createHeaderContainer(status, "status"));
    }
    insertElementAfterHeader(propertiesEl);
  }

  /**
   * ファイルが表示されているViewからプロパティ要素を削除します
   */
  removePropertiesElements(): void {
    removeElementsFromContainer(`.${this.className}`);
  }
}
