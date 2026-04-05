import { exec, execFile } from "child_process";
import { Modal, type TFile } from "obsidian";
import { ConfirmDialog } from "src/lib/helpers/components/ConfirmDialog";
import type { UApp } from "../types";
import { FileSearchDialog } from "./components/FileSearchDialog";
import { InputDialog, type InputDialogResult } from "./components/InputDialog";
import { SelectionDialog } from "./components/SelectionDialog";
import type { imageMimeTypesByExtension } from "./entries";

declare let app: UApp;

// HACK: ObsidianのNoticeはundefinedとnullで挙動が異なるが、型定義はそうなっていなかったので上書き定義
export declare class Notice {
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
 * エラーではないが条件を満たさず処理を中断した場合に通知します
 * タイムアウトはあります
 */
export function notifyWarning(text: string): Notice {
  return notify(`🚨 ${text}`, 5000);
}

/**
 * バリデーションエラーを通知します
 * タイムアウトはあります
 */
export function notifyValidationError(text: string): Notice {
  return notify(`🚫 ${text}`, 3000);
}

/**
 * ランタイムエラーを通知します
 * タイムアウトはありません
 */
export function notifyRuntimeError(text: string): Notice {
  return notify(`⛔ ${text}`);
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
 * クリップボードに画像を保存します
 *
 * ```ts
 * const imageBuffer = Buffer.from(imageData);
 * await copyImageToClipboard(imageBuffer, "image/png");
 * ```
 */
export async function copyImageToClipboard(
  imageBuffer: Buffer,
  mimeType: (typeof imageMimeTypesByExtension)[keyof typeof imageMimeTypesByExtension],
): Promise<void> {
  const imageBytes = Uint8Array.from(imageBuffer);
  const bitmap = await createImageBitmap(
    new Blob([imageBytes], { type: mimeType }),
  );

  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0);

  const pngBlob = await canvas.convertToBlob({ type: "image/png" });

  await navigator.clipboard.write([
    new ClipboardItem({ "image/png": pngBlob }),
  ]);
}

/**
 * クリップボードからテキストを取得します
 *
 * ```ts
 * await getClipboardText()
 * // クリップボードの中身
 *
 * // 改行や前後の空白を削除して貼り付け
 * await getClipboardText({trim: true})
 * ```
 */
export async function getClipboardText(option?: {
  trim?: boolean;
}): Promise<string> {
  const txt: string = await (navigator as any).clipboard.readText();
  return option?.trim ? txt.trim() : txt;
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
 * ターミナルで開きます
 * WARNING: 現在はGhostty限定
 */
export function openTerminal(fullFolderPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile("open", ["-a", "Ghostty", fullFolderPath], (error: any) =>
      error ? reject(error) : resolve(),
    );
  });
}

/**
 * yaziで対象パスを開きます
 * WARNING: yazi, Ghostty, zshが必要
 */
export function openYazi(path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(
      `open -na Ghostty --args -e zsh -lic 'yazi "${path}"'`,
      (error: any) => (error ? reject(error) : resolve()),
    );
  });
}

/**
 * Lazygitで対象パスを開きます
 * WARNING: Lazygit, Ghostty, zshが必要
 */
export function openLazygit(path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(
      `open -na Ghostty --args -e zsh -lic 'cd "${path}" && lazygit'`,
      (error: any) => (error ? reject(error) : resolve()),
    );
  });
}

export async function showInfoDialog(args: {
  title: string;
  content: string;
}) {
  new Modal(app).setTitle(args.title).setContent(args.content).open();
}

/**
 * 確認ダイアログを表示し、OKが押されたらtrue、キャンセルまたはそれ以外で閉じたらfalseを返却します。
 */
export async function showConfirmDialog(args: {
  title: string;
  message: string;
  okText?: string;
  cancelText?: string;
}): Promise<boolean> {
  return new ConfirmDialog(
    args.title,
    args.message,
    args.okText,
    args.cancelText,
  ).open();
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
  inputType?: "text" | "date" | "time";
}): Promise<string | null> {
  return new InputDialog(
    args.message,
    args.placeholder,
    args.defaultValue,
    args.inputType ?? "text",
  ).open();
}

export async function showInputDialogWithSubmitModifier(args: {
  message: string;
  placeholder?: string;
  defaultValue?: string;
  inputType?: "text" | "date" | "time";
}): Promise<InputDialogResult> {
  return new InputDialog(
    args.message,
    args.placeholder,
    args.defaultValue,
    args.inputType ?? "text",
  ).openWithSubmitModifier();
}

/**
 * 選択肢ダイアログを表示し、選択された値を返却します。
 * キャンセル時はnullを返却します。
 *
 * ```ts
 * await showSelectionDialog()
 * // "選択したファイル(TFile)"
 * ```
 */
export async function showSelectionDialog<T extends string[]>(args: {
  message: string;
  items: T;
  placeholder?: string;
  defaultValue?: T[number];
}): Promise<T[number] | null> {
  return new SelectionDialog(
    args.message,
    args.items,
    args.placeholder,
    args.defaultValue,
  ).open();
}

/**
 * ファイル選択ダイアログを表示し、選択されたファイルを返却します。
 * キャンセル時はnullを返却します。
 *
 * ```ts
 * await showFileSearchDialog()
 * // "選択したファイル(TFile)"
 * ```
 */
export async function showFileSearchDialog(): Promise<TFile | null> {
  return new FileSearchDialog().open();
}

/**
 * 現在ファイルViewのヘッダ後に要素を差し込みます
 */
export function insertElementAfterHeader(element: Element): void {
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
