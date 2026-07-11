import { syntaxTree } from "@codemirror/language";
import { Annotation, type EditorState, type Range } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  type EditorView,
  type PluginValue,
  ViewPlugin,
  type ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { editorInfoField, editorLivePreviewField } from "obsidian";
import { linkText2PathFrom } from "src/lib/helpers/links";
import { getPropertiesByPath } from "src/lib/helpers/properties";
import { parseInternalLinkText } from "src/lib/obsutils/parser";

/**
 * バッジの再構築を強制するためのAnnotation
 * (metadataCacheの変更など、ドキュメント外の理由で再描画したいときに使う)
 */
export const statusBadgeRefresh = Annotation.define<boolean>();

/**
 * リンク直後にリンク先ノートのstatusプロパティを表示するバッジ
 */
class StatusBadgeWidget extends WidgetType {
  constructor(private readonly status: string) {
    super();
  }

  override eq(other: StatusBadgeWidget): boolean {
    return this.status === other.status;
  }

  override toDOM(): HTMLElement {
    // 色などの見た目はCSSの属性セレクタ([data-status^="✅"]など)で制御する
    return createSpan({
      cls: "carnelian-link-status-badge",
      text: this.status,
      attr: { "data-status": this.status },
    });
  }

  override ignoreEvent(): boolean {
    return true;
  }
}

function selectionOverlaps(
  state: EditorState,
  from: number,
  to: number,
): boolean {
  return state.selection.ranges.some((r) => r.from <= to && r.to >= from);
}

function buildDecorations(view: EditorView): DecorationSet {
  if (!view.state.field(editorLivePreviewField)) {
    return Decoration.none;
  }

  const sourcePath = view.state.field(editorInfoField)?.file?.path;
  if (!sourcePath) {
    return Decoration.none;
  }

  const { state } = view;
  const decorations: Range<Decoration>[] = [];

  // 連続するhmd-internal-linkノードを1つのリンクとしてマージするためのバッファ
  let link: { from: number; to: number } | null = null;

  const addBadge = (linkFrom: number, linkTo: number, badgePos: number) => {
    // リンク範囲(先頭の [[ を含む)に選択範囲が重なる場合はソース表示になるため出さない
    const outerFrom =
      state.doc.sliceString(Math.max(linkFrom - 2, 0), linkFrom) === "[["
        ? linkFrom - 2
        : linkFrom;
    if (selectionOverlaps(state, outerFrom, badgePos)) {
      return;
    }

    const linkText = parseInternalLinkText(
      state.doc.sliceString(linkFrom, linkTo),
    );
    const path = linkText2PathFrom(linkText, sourcePath);
    if (!path) {
      return;
    }

    const status = getPropertiesByPath(path)?.status;
    if (typeof status !== "string" || status === "") {
      return;
    }

    decorations.push(
      Decoration.widget({
        widget: new StatusBadgeWidget(status),
        side: 1,
      }).range(badgePos),
    );
  };

  for (const { from, to } of view.visibleRanges) {
    syntaxTree(state).iterate({
      from,
      to,
      enter(node) {
        const name = node.type.name;
        if (name.includes("hmd-internal-link")) {
          if (link && node.from <= link.to + 2) {
            link.to = node.to;
          } else {
            link = { from: node.from, to: node.to };
          }
          return;
        }

        // 閉じ括弧 ]] のノードでリンクを確定し、その直後にバッジを置く
        if (name.includes("formatting-link-end")) {
          if (link && node.from <= link.to + 2) {
            addBadge(link.from, link.to, node.to);
          }
          link = null;
        }
      },
    });
    link = null;
  }

  return Decoration.set(decorations, true);
}

class LinkStatusBadgePlugin implements PluginValue {
  decorations: DecorationSet;

  constructor(view: EditorView) {
    this.decorations = buildDecorations(view);
  }

  update(update: ViewUpdate): void {
    if (
      update.docChanged ||
      update.viewportChanged ||
      update.selectionSet ||
      update.startState.field(editorLivePreviewField) !==
        update.state.field(editorLivePreviewField) ||
      update.transactions.some((tr) => tr.annotation(statusBadgeRefresh))
    ) {
      this.decorations = buildDecorations(update.view);
    }
  }
}

export const linkStatusBadgeExtension = ViewPlugin.fromClass(
  LinkStatusBadgePlugin,
  {
    decorations: (v) => v.decorations,
  },
);
