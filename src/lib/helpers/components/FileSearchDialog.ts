import { SuggestModal, TFile } from "obsidian";
import { UApp } from "src/lib/types";
import { sorter } from "src/lib/utils/collections";
import { microFuzzy } from "src/lib/utils/strings";
import { getMarkdownFilesWithRecentAccessIndex } from "../entries";

declare let app: UApp;

export type Order = "lastAccessed" | "alphabetical ";

export class FileSearchDialog extends SuggestModal<TFile> {
  selected: TFile | null = null;

  constructor() {
    super(app);
  }

  getSuggestions(query: string): TFile[] {
    return getMarkdownFilesWithRecentAccessIndex()
      .map(({ file, lastAccessIndex }) => ({
        file,
        lastAccessIndex,
        result: microFuzzy(file.name.toLowerCase(), query.toLowerCase()),
      }))
      .filter(({ result }) => result.type !== "none")
      .toSorted(sorter(({ result }) => result.score, "desc"))
      .toSorted(sorter(({ result }) => result.type === "starts-with", "desc"))
      .toSorted(
        sorter(
          ({ lastAccessIndex }) => lastAccessIndex ?? Number.MAX_SAFE_INTEGER,
        ),
      )
      .map(({ file }) => file);
  }

  renderSuggestion(item: TFile, el: HTMLElement): void {
    const recordEl = createDiv({
      text: item.basename,
    });

    el.appendChild(recordEl);
  }

  onChooseSuggestion(item: TFile) {
    this.selected = item;
  }

  /**
   * ダイアログを開き、Promiseを返却します。
   *   - 候補が選択されたらPromiseをresolve(TFile)します
   *   - それ以外の方法でダイアログを閉じたらPromiseをresolve(null)します
   */
  open(): Promise<TFile | null> {
    super.open();

    return new Promise<TFile | null>((resolve) => {
      this.onClose = async () => {
        await sleep(0); // onChooseItemを先に発動させるため
        super.onClose();
        resolve(this.selected);
      };
    });
  }
}
