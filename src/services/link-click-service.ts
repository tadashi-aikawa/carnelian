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

  onload(): void {
    this.handler = async (ev: MouseEvent) => {
      if (!ev.metaKey || ev.button !== 0) {
        return;
      }

      const linkEl = (ev.target as HTMLElement).closest(
        ".cm-hmd-internal-link,.internal-link",
      );
      if (!linkEl) {
        return;
      }

      ev.stopPropagation();

      const linkText =
        linkEl.getAttribute("data-href") ??
        linkEl.getAttribute("href") ??
        map(
          getActiveEditor()?.cm,
          (cm) => getLinkTokenAtOffset(cm.posAtDOM(linkEl))?.text,
        );
      if (!linkText) {
        return;
      }

      const path = linkText2Path(linkText);
      if (!path) {
        const f = await createNewMarkdownFile(linkText);
        await openFile(f.path, { splitVertical: true });
        return;
      }

      await openFile(path, { splitVertical: true });
    };

    document.addEventListener("click", this.handler, true);
  }

  onunload(): void {
    if (this.handler) {
      document.removeEventListener("click", this.handler, true);
    }
  }
}
