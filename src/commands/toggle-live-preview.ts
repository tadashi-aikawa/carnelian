import {
  getActiveCMEditor,
  setLivePreview,
} from "src/lib/helpers/editors/basic";
import { getAllMarkdownLeaves } from "src/lib/helpers/leaves";
import { toggleDefaultEditingMode } from "src/lib/helpers/settings";

/**
 * LivePreviewモードを切り替えます
 */
export function toggleLivePreview() {
  const activeCM = getActiveCMEditor();

  const nextDefault = toggleDefaultEditingMode() === "livePreview";
  for (const l of getAllMarkdownLeaves()) {
    setLivePreview(l, nextDefault);
  }

  // 切り替え後にフォーカスが失われる場合の対応
  activeCM?.focus();
}
