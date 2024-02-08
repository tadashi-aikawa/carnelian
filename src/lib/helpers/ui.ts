import { UApp } from "../types";
import { InputDialog } from "./components/InputDialog";

declare let app: UApp;

// HACK: ObsidianのNoticeはundefinedとnullで挙動が異なるが、型定義はそうなっていなかったので上書き定義
declare class Notice {
  // undefinedは5000ms、nullはタイムアウトなし となっている
  constructor(message: string | DocumentFragment, duration?: number | null);

  // オリジナルと同じ
  setMessage(message: string | DocumentFragment): this;
  hide(): void;
}

/**
 * テキストで通知します
 *
 * @param timeoutMs - 未指定(undefined)の場合はタイムアウトなし
 */
export function notify(
  text: string | DocumentFragment,
  timeoutMs?: number,
): Notice {
  return new Notice(text, timeoutMs ?? null);
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

/**
 * クリップボードからテキストを取得します
 *
 * ```ts
 * await getClipboardText()
 * // クリップボードの中身
 * ```
 */
export async function getClipboardText(): Promise<string> {
  return await (navigator as any).clipboard.readText();
}

/**
 * URLを開きます
 *
 * ```ts
 * // (通常は)ブラウザでURLを開く
 * openUrl("https://minerva.mamansoft.net")
 * ```
 */
export function openUrl(url: string): void {
  activeWindow.open(url);
}

/**
 * 入力ダイアログを表示し、入力された値を返却します。
 * キャンセル時はnullを返却します。(入力なしで決定した場合は空文字)
 *
 * ```ts
 * await showInputDialog({ message: "名前を入力してください" })
 * // "入力した名前"
 * ```
 */
export async function showInputDialog(args: {
  message: string;
  placeholder?: string;
  defaultValue?: string;
}): Promise<string | null> {
  return new InputDialog(
    args.message,
    args.placeholder,
    args.defaultValue,
  ).open();
}

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

/**
 * 現在ファイルViewのヘッダ前に要素を差し込みます
 */
export function insertElementBeforeHeader(element: Element): void {
  app.workspace
    .getActiveFileView()
    .containerEl.find(".view-header")
    .insertAdjacentElement("afterend", element);
}

/**
 * 現在ファイルViewから要素を削除します
 */
export function removeElementsFromContainer(selector: string): void {
  const elements = app.workspace
    .getActiveFileView()
    .containerEl.querySelectorAll(selector);

  for (const el of elements) {
    el.remove();
  }
}
