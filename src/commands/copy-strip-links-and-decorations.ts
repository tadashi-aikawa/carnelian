import { stripLinksAndDecorationsFromSelection } from "src/lib/helpers/editors/advanced";
import { copyToClipboard, notify } from "src/lib/helpers/ui";

/**
 * 選択範囲のリンクや装飾を無効化してコピーします
 * WARN: 1文字のリンクには対応していません
 * WARN: このメソッドはObsidian MobileのiPhone/iPadでは動作しない可能性があります
 */
export async function copyStripLinksAndDecorations() {
  await copyToClipboard(stripLinksAndDecorationsFromSelection());
  notify("👍選択範囲のリンクや装飾を無効化してコピーしました", 5000);
}
