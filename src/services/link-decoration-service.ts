import type { Plugin } from "obsidian";
import {
  setOnDeleteFileEvent,
  setOnPropertiesChangedEvent,
  setOnRenameFileEvent,
} from "src/lib/helpers/events";
import { getAllMarkdownLeaves } from "src/lib/helpers/leaves";
import type { UCodeMirrorEditor } from "src/lib/types";
import type { Service } from "src/services";
import {
  createLinkDecorationExtension,
  type LinkDecorationOptions,
  linkDecorationRefresh,
} from "./link-decoration-extension";

/**
 * Live Previewで内部リンクをリンク先ノートのプロパティに応じて装飾するサービスです
 * - statusプロパティをリンク直後にバッジ表示
 * - fixmeプロパティが有効なリンクを強調表示
 */
export class LinkDecorationService implements Service {
  name = "Link decoration";

  unsetHandlers: (() => void)[] = [];

  constructor(
    private plugin: Plugin,
    private options: LinkDecorationOptions,
  ) {}

  onload(): void {
    this.plugin.registerEditorExtension(
      createLinkDecorationExtension(this.options),
    );

    // リンク先のプロパティ変更やリンク解決の変化(リネーム/削除)を装飾に反映する
    const refresh = () => this.refreshAllEditors();
    this.unsetHandlers = [
      setOnPropertiesChangedEvent(refresh),
      setOnRenameFileEvent(refresh),
      setOnDeleteFileEvent(refresh),
    ];
  }

  onunload(): void {
    for (const unset of this.unsetHandlers) {
      unset();
    }
    // registerEditorExtensionはプラグインのunload時に自動で解除される
  }

  /**
   * 開いているすべてのMarkdownエディタの装飾を再構築します
   */
  refreshAllEditors(): void {
    for (const leaf of getAllMarkdownLeaves()) {
      (leaf.view.editor as UCodeMirrorEditor | undefined)?.cm.dispatch({
        annotations: linkDecorationRefresh.of(true),
      });
    }
  }
}
