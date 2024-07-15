import { SuggestModal } from "obsidian";
import type { UApp } from "src/lib/types";
import { sorter } from "src/lib/utils/collections";
import { microFuzzy } from "src/lib/utils/strings";

declare let app: UApp;

export class SelectionDialog<T extends string[]> extends SuggestModal<
  T[number]
> {
  selected: T[number] | null = null;

  constructor(
    public title: string,
    public items: T,
    public placeholder?: string,
    public defaultValue?: T[number],
  ) {
    super(app);
  }

  getSuggestions(query: string): T {
    const lq = query.toLowerCase();
    return this.items.toSorted(
      sorter((x) => microFuzzy(x.toLowerCase(), lq).score, "desc"),
    ) as T;
  }

  renderSuggestion(item: T[number], el: HTMLElement): void {
    el.appendChild(
      createDiv({
        text: item,
      }),
    );
  }

  onChooseSuggestion(item: T[number]) {
    this.selected = item;
  }

  /**
   * ダイアログを開き、Promiseを返却します。
   *   - 候補が選択されたらPromiseをresolve(T)します
   *   - それ以外の方法でダイアログを閉じたらPromiseをresolve(null)します
   */
  open(): Promise<T[number] | null> {
    super.open();

    return new Promise<T[number] | null>((resolve) => {
      this.onClose = async () => {
        await sleep(0); // onChooseItemを先に発動させるため
        super.onClose();
        resolve(this.selected);
      };
    });
  }
}
