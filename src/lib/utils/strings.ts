/**
 * 1種類のパターンでパターンマッチした結果を文字列のリストで取得します
 */
export function doSinglePatternMatching(
  text: string,
  pattern: RegExp
): string[] {
  return Array.from(text.matchAll(pattern)).map((x) => x[0]);
}
