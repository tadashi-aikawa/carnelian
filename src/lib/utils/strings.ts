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

/**
 * 文字幅をカウントします
 * アルファベットや記号は1、それ以外のマルチバイト文字は2の単純計算
 */
export function countCharsWidth(chars: string): number {
  return chars
    .split("")
    .reduce((acc, _, i) => acc + (chars.charCodeAt(i) > 0x7f ? 2 : 1), 0);
}
