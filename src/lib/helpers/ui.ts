// HACK: ObsidianのNoticeはundefinedとnullで挙動が異なるが、型定義はそうなっていなかったので上書き定義
declare class Notice {
  // undefinedは5000ms、nullはタイムアウトなし となっている
  constructor(message: string | DocumentFragment, duration?: number | null);
}

/**
 * テキストで通知します
 *
 * @param timeoutMs - 未指定(undefined)の場合はタイムアウトなし
 */
export function notify(text: string | DocumentFragment, timeoutMs?: number) {
  new Notice(text, timeoutMs ?? null);
}

/**
 * クリップボードにテキストをコピーします
 *
 * ```ts
 * await copyToClipboard("コピーしたいテキスト")
 * ```
 */
export async function copyToClipboard(text: string): Promise<void> {
  await (navigator as any).clipboard.writeText(text);
}

// TODO:
//
///**
// * 入力ダイアログを表示します
// *
// * ```ts
// * await showInputDialog("名前を入力してください")
// * // "入力した名前"
// * ```
// */
//export function showInputDialog(message: string): Promise<string | null> {
//  const tp = useTemplaterInternalFunction();
//  return tp.system.prompt(message);
//}

///**
// * 候補選択ダイアログを表示します
// *
// * ```ts
// * await showSelectionDialog(["item1", "item2"], [item1, item2])
// * // 選択した結果 or null (キャンセル時)
// * ```
// */
//export function showSelectionDialog<T>(
//  texts: string[],
//  items: T[]
//): Promise<T | null> {
//  const tp = useTemplaterInternalFunction();
//  return tp.system.suggester(texts, items);
//}
