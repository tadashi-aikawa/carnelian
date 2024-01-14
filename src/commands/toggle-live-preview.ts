import { setLivePreview } from "src/lib/helpers/editors/basic";
import { getAllMarkdownLeaves } from "src/lib/helpers/leaves";
import { toggleDefaultEditingMode } from "src/lib/helpers/settings";

/**
 * LivePreviewモードを切り替えます
 */
export function toggleLivePreview() {
  const nextDefault = toggleDefaultEditingMode() === "livePreview";
  for (const l of getAllMarkdownLeaves()) {
    setLivePreview(l, nextDefault);
  }
}
