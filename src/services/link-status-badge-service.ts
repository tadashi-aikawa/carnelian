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
  linkStatusBadgeExtension,
  statusBadgeRefresh,
} from "./link-status-badge-extension";

/**
 * Live Previewで内部リンクの直後にリンク先ノートのstatusプロパティをバッジ表示するサービスです
 */
export class LinkStatusBadgeService implements Service {
  name = "Link status badge";

  unsetHandlers: (() => void)[] = [];

  constructor(private plugin: Plugin) {}

  onload(): void {
    this.plugin.registerEditorExtension(linkStatusBadgeExtension);

    // リンク先のstatus変更やリンク解決の変化(リネーム/削除)をバッジに反映する
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
   * 開いているすべてのMarkdownエディタのバッジを再構築します
   */
  refreshAllEditors(): void {
    for (const leaf of getAllMarkdownLeaves()) {
      (leaf.view.editor as UCodeMirrorEditor | undefined)?.cm.dispatch({
        annotations: statusBadgeRefresh.of(true),
      });
    }
  }
}
