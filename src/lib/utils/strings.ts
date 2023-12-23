import * as Encoding from "encoding-japanese";

/**
 * 1種類のパターンでパターンマッチした結果を文字列のリストで取得します
 */
export function doSinglePatternMatching(
  text: string,
  pattern: RegExp
): string[] {
  return Array.from(text.matchAll(pattern)).map((x) => x[0]);
}

/**
 * SJISのbufferをstringに変換します
 */
export function sjis2String(sjisBuffer: ArrayBuffer): string {
  const unicodeArray = Encoding.convert(new Uint8Array(sjisBuffer), {
    from: "SJIS",
    to: "UNICODE",
  });
  return Encoding.codeToString(unicodeArray);
}
