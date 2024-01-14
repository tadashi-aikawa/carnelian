import { Modal } from "obsidian";
import { UApp } from "src/lib/types";

declare let app: UApp;

export class InputDialog extends Modal {
  inputEl!: HTMLInputElement;
  promise!: Promise<string | null>;
  submitted: boolean = false;

  constructor(
    public title: string,
    public placeholder?: string,
    public defaultValue?: string,
  ) {
    super(app);
  }

  onOpen(): void {
    this.titleEl.setText(this.title);

    this.inputEl = this.contentEl.createEl("input", {
      type: "text",
      placeholder: this.placeholder ?? "",
      cls: "carnelian-input-dialog-input",
      value: this.defaultValue,
    });
  }

  /**
   * ダイアログを開き、Promiseを返却します。
   *   - Enterが押されたらPromiseをresolve(入力文字列)します
   *     - 入力がない場合は空文字
   *   - それ以外の方法でダイアログを閉じたらPromiseをresolve(null)します
   */
  open(): Promise<string | null> {
    super.open();

    this.promise = new Promise<string | null>((resolve) => {
      const listener = (ev: KeyboardEvent) => {
        if (ev.isComposing) {
          return;
        }
        if (ev.code === "Enter") {
          ev.preventDefault();
          resolve(this.inputEl.value);
          this.submitted = true;
          this.close();
        }
      };

      this.inputEl.addEventListener("keydown", listener);

      // クローズ時にsubmitされていないときはPromiseをnullで解決させ、Listnerも解除
      this.onClose = () => {
        super.onClose();
        this.inputEl.removeEventListener("keydown", listener);
        if (!this.submitted) {
          resolve(null);
        }
      };
    });

    return this.promise;
  }
}
