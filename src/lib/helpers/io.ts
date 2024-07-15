import type { UApp } from "../types";
import { map } from "../utils/types";

declare let app: UApp;

/**
 * パス(ファイル/ディレクトリ)が存在するかどうかを確認します
 *
 * ```ts
 * await exists("Notes/hoge.md")
 * // true
 */
export function exists(path: string): Promise<boolean> {
  return app.vault.adapter.exists(path);
}

/**
 * ファイルの中身を取得します。存在しないパスを指定した場合はnullを返却します。
 *
 * ```ts
 * await loadFile("Notes/Obsidian.md")
 * //  "Obsidianは最高のマークダウンエディタである\n完"
 * ```
 */
export async function loadFile(path: string): Promise<string | null> {
  if (!(await exists(path))) {
    return null;
  }
  return app.vault.adapter.read(path);
}

/**
 * JSONファイルを読み込みます
 * ```ts
 * await loadJson("settings.json")
 * // { sync: true }
 * ```
 */
export async function loadJson<T>(path: string): Promise<T | null> {
  return map(await loadFile(path), (content) => JSON.parse(content) as T);
}

/**
 * ファイルにデータを書き込みます
 * ```ts
 * await saveFile("Notes/Obsidian.md", "素晴らしいエディタ")
 * await saveFile("Notes/Obsidian.md", "素晴らしいエディタ", { overwrite: true }) // ファイルの上書きを許容する
 * ```
 */
export async function saveFile(
  path: string,
  data: string,
  option?: { overwrite?: boolean },
): Promise<void> {
  if (!option?.overwrite && (await exists(path))) {
    throw new Error(`既にファイルが存在するため上書きできません: ${path}`);
  }
  app.vault.adapter.write(path, data);
}

/**
 * JSONファイルを書き込みます
 * ```ts
 * await saveJson("settings.json", { sync: true })
 * await saveJson("settings.json", { sync: true }, { overwrite: true }) // ファイルの上書きを許容する
 * ```
 */
export async function saveJson<T>(
  path: string,
  data: T,
  option?: { overwrite?: boolean },
): Promise<void> {
  await saveFile(path, JSON.stringify(data), option);
}
