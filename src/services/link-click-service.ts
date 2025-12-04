import { getActiveEditor } from "src/lib/helpers/editors/basic";
import { createNewMarkdownFile, openFile } from "src/lib/helpers/entries";
import { getLinkTokenAtOffset, linkText2Path } from "src/lib/helpers/links";
import { map } from "src/lib/utils/guard";
import type { Service } from "src/services";

/**
 * エディタの内部リンクをクリックしたときに処理を行うサービスです
 */
export class LinkClickService implements Service {
  name = "LinkClick";
  handler?: (ev: MouseEvent) => void;

  async createDstPath(ev: MouseEvent): Promise<string | null> {
    const linkEl = (ev.target as HTMLElement).closest(
      ".cm-hmd-internal-link,.internal-link",
    );
    if (!linkEl) {
      return null;
    }

    const linkText =
      linkEl.getAttribute("data-href") ??
      linkEl.getAttribute("href") ??
      map(
        getActiveEditor()?.cm,
        (cm) => getLinkTokenAtOffset(cm.posAtDOM(linkEl))?.text,
      );
    if (!linkText) {
      return null;
    }

    const path = linkText2Path(linkText);
    if (path) {
      return path;
    }

    const f = await createNewMarkdownFile(linkText);
    return f.path;
  }

  onload(): void {
    this.handler = async (ev: MouseEvent) => {
      const { metaKey, shiftKey, button } = ev;
      if (button !== 0) {
        return;
      }
      if (!metaKey && !shiftKey) {
        return;
      }

      const path = await this.createDstPath(ev);
      if (!path) {
        return;
      }

      ev.stopPropagation();
      if (metaKey) {
        await openFile(path, { splitVertical: true });
      } else if (shiftKey) {
        await openFile(path, { newLeaf: true });
      }
    };

    document.addEventListener("click", this.handler, true);
  }

  onunload(): void {
    if (this.handler) {
      document.removeEventListener("click", this.handler, true);
    }
  }
}
