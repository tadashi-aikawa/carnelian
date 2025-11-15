import { getActiveEditor } from "src/lib/helpers/editors/basic";
import { openFile } from "src/lib/helpers/entries";
import { getLinkFileAtOffset, linkText2Path } from "src/lib/helpers/links";
import { map } from "src/lib/utils/guard";
import type { Service } from "src/services";
import { P, match } from "ts-pattern";

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

      const rawLink = linkEl.getAttribute("data-href");
      const path = match(rawLink)
        .with(P.string, linkText2Path)
        .with(null, () =>
          map(
            getActiveEditor()?.cm,
            (cm) => getLinkFileAtOffset(cm.posAtDOM(linkEl))?.path ?? null,
          ),
        )
        .exhaustive();
      if (!path) {
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
