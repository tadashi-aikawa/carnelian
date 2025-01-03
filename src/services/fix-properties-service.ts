import { findNoteType } from "src/definitions/mkms";
import { setOnFileOpenEvent } from "src/lib/helpers/events";
import {
  getPropertiesByPath,
  updateActiveFileProperty,
} from "src/lib/helpers/properties";
import { notify } from "src/lib/helpers/ui";
import type { Service } from "src/services";

/**
 * ファイルをアクティブにしたときにプロパティを自動修正するサービスです
 */
export class FixPropertiesService implements Service {
  name = "Fix properties";
  unsetHandler!: () => void;

  onLayoutReady(): void {
    this.unsetHandler = setOnFileOpenEvent(async (file) => {
      if (!file) {
        return;
      }

      const noteType = findNoteType(file);
      if (!noteType) {
        return;
      }

      const props = getPropertiesByPath(file.path);
      if (props?.ignoreAutoFix) {
        return;
      }
      if (!noteType.coverImagePath) {
        return;
      }
      if (props?.cover === noteType.coverImagePath) {
        // 既に設定済
        return;
      }

      updateActiveFileProperty("cover", noteType.coverImagePath);
      return notify("coverを更新しました", 3000);
    });
  }

  onunload(): void {
    this.unsetHandler();
  }
}
