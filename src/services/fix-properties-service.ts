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

      // publishプロパティがある場合はWeekly Reportなので変更しない
      if (noteType.name === "Report note" && props?.publish != null) {
        return;
      }

      if (noteType.coverImagePath && noteType.coverImagePath !== props?.cover) {
        updateActiveFileProperty("cover", noteType.coverImagePath);
        notify("coverを更新しました", 3000);
      }

      if (noteType.name === "Troubleshooting note" && !props?.status) {
        // 大抵解決しているので決め打ち
        updateActiveFileProperty("status", "✅解決済");
        notify("statusを更新しました", 3000);
      }
    });
  }

  onunload(): void {
    this.unsetHandler();
  }
}
