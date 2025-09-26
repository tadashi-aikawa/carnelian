import { stripLinksAndDecorationsFromSelection } from "src/lib/helpers/editors/advanced";
import { replaceSelection } from "src/lib/helpers/editors/basic";

/**
 * 選択範囲のリンクや装飾を無効化します
 * WARN: 1文字のリンクには対応していません
 * WARN: このメソッドはObsidian MobileのiPhone/iPadでは動作しない可能性があります
 */
export function stripLinksAndDecorations() {
  replaceSelection(stripLinksAndDecorationsFromSelection());
}
