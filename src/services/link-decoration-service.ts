import type { Plugin } from "obsidian";
import {
  setOnDeleteFileEvent,
  setOnPropertiesChangedEvent,
  setOnRenameFileEvent,
} from "src/lib/helpers/events";
import { getAllMarkdownLeaves } from "src/lib/helpers/leaves";
import { getResolvedLinkMap, hasLinkFromTo } from "src/lib/helpers/links";
import type { UCodeMirrorEditor } from "src/lib/types";
import type { Service } from "src/services";
import type { LinkDecorationOptions } from "./link-decoration-common";
import {
  createLinkDecorationExtension,
  linkDecorationRefresh,
} from "./link-decoration-extension";
import { createLinkDecorationPostProcessor } from "./link-decoration-post-processor";

/**
 * ビューのファイルがtargetPathへのリンクを持つかどうかを返します
 * 埋め込みノート内に装飾済みリンクがあるケースを拾うため、リンクグラフを1段だけ
 * 経由した間接リンク(ビュー→埋め込みノート→targetPath)も対象にする
 * (2段以上の埋め込みネストは追わない割り切り)
 */
function linksToDirectlyOrViaEmbed(
  viewPath: string,
  targetPath: string,
): boolean {
  if (hasLinkFromTo(viewPath, targetPath)) {
    return true;
  }
  return Object.keys(getResolvedLinkMap(viewPath) ?? {}).some((middlePath) =>
    hasLinkFromTo(middlePath, targetPath),
  );
}

/**
 * Live Preview / Reading viewで内部リンクをリンク先ノートのプロパティに応じて装飾するサービスです
 * - 指定プロパティの値をリンク直後にバッジ表示
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
    this.plugin.registerMarkdownPostProcessor(
      createLinkDecorationPostProcessor(this.options),
    );

    // リンク先のプロパティ変更やリンク解決の変化(リネーム/削除)を装飾に反映する
    // 頻発するプロパティ変更は変更ファイルを渡し、Reading viewの再レンダリング対象を絞る
    this.unsetHandlers = [
      setOnPropertiesChangedEvent((file) => this.refreshAllEditors(file.path)),
      setOnRenameFileEvent(() => this.refreshAllEditors()),
      setOnDeleteFileEvent(() => this.refreshAllEditors()),
    ];
  }

  onunload(): void {
    for (const unset of this.unsetHandlers) {
      unset();
    }
    // registerEditorExtensionはプラグインのunload時に自動で解除される
  }

  /**
   * 開いているすべてのMarkdownビューの装飾を再構築します
   * (Live Previewはエディタ拡張の再評価、Reading viewは再レンダリング)
   *
   * @param changedPath 指定した場合、Reading viewはこのファイルへリンクを持つビューだけ再レンダリングする
   * (full rerenderは埋め込みや他プラグインの描画も破棄するため重く、無関係なビューには走らせない)
   */
  refreshAllEditors(changedPath?: string): void {
    for (const leaf of getAllMarkdownLeaves()) {
      if (leaf.view.getMode() === "preview") {
        const viewPath = leaf.view.file?.path;
        if (
          changedPath !== undefined &&
          (!viewPath || !linksToDirectlyOrViaEmbed(viewPath, changedPath))
        ) {
          continue;
        }
        leaf.view.previewMode.rerender(true);
      } else {
        (leaf.view.editor as UCodeMirrorEditor | undefined)?.cm.dispatch({
          annotations: linkDecorationRefresh.of(true),
        });
      }
    }
  }
}
