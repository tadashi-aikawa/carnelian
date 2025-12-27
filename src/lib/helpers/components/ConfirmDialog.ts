import { Modal } from "obsidian";
import type { UApp } from "src/lib/types";

declare let app: UApp;

export class ConfirmDialog extends Modal {
  okButtonEl!: HTMLButtonElement;
  cancelButtonEl!: HTMLButtonElement;
  promise!: Promise<boolean>;

  constructor(
    public title: string,
    public message: string,
    public okText = "OK",
    public cancelText = "キャンセル",
  ) {
    super(app);
  }

  onOpen(): void {
    this.titleEl.setText(this.title);
    this.contentEl.createEl("p", {
      text: this.message,
      cls: "carnelian-confirm-dialog-message",
    });

    const buttonContainer = this.contentEl.createDiv({
      cls: "carnelian-confirm-dialog-button-container",
    });
    this.cancelButtonEl = buttonContainer.createEl("button", {
      text: this.cancelText,
      cls: "mod-cancel",
    });
    this.okButtonEl = buttonContainer.createEl("button", {
      text: this.okText,
      cls: "mod-warning",
    });
    this.contentEl.appendChild(buttonContainer);
  }

  /**
   * ダイアログを開き、Promiseを返却します。
   *   - OKならtrue
   *   - それ以外はfalse
   */
  open(): Promise<boolean> {
    super.open();

    this.promise = new Promise<boolean>((resolve) => {
      const okEventListener = (ev: Event) => {
        resolve(true);
        this.close();
      };
      const cancelEventListener = (ev: Event) => {
        resolve(false);
        this.close();
      };
      this.okButtonEl.addEventListener("click", okEventListener);
      this.cancelButtonEl.addEventListener("click", cancelEventListener);

      this.onClose = () => {
        super.onClose();
        this.okButtonEl.removeEventListener("click", okEventListener);
        this.cancelButtonEl.removeEventListener("click", cancelEventListener);
      };
    });

    return this.promise;
  }
}
