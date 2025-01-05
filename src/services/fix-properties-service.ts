import type { TFile } from "obsidian";
import { type NoteType, findNoteType } from "src/definitions/mkms";
import { setOnFileOpenEvent } from "src/lib/helpers/events";
import {
  getPropertiesByPath,
  updateActiveFileProperty,
} from "src/lib/helpers/properties";
import { notify } from "src/lib/helpers/ui";
import type { Properties } from "src/lib/types";
import { match } from "src/lib/utils/strings";
import type { Service } from "src/services";

function shouldNotFix(
  file: TFile,
  noteType: NoteType,
  props: Properties | null,
): boolean {
  if (props?.ignoreAutoFix) {
    return true;
  }

  if (
    noteType.name === "Report note" &&
    match(file.basename, /\d{4}年\d{1,2}週 Weekly Report/)
  ) {
    return true;
  }

  return false;
}

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

      if (shouldNotFix(file, noteType, props)) {
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
