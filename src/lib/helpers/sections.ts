import { SectionCache } from "obsidian";
import { CodeBlock } from "../types";
import { map } from "../utils/types";
import { getActiveFile, loadFileContentCache } from "./entries";
import { getFileCacheByPath } from "./metadata";

/**
 * ファイルパスからコードセクションを取得します
 */
export function getCodeBlockSectionsByPath(
  path: string,
): SectionCache[] | null {
  return (
    getFileCacheByPath(path)?.sections?.filter((x) => x.type === "code") ?? null
  );
}

/**
 * 現在ファイルのコードブロックを取得します
 *
 * ```ts
 * await loadActiveFileCodeBlocks()
 * // [
 * //   {language: "typescript", content: "const hoge = 'huga'", pos: ...},
 * //   {language: "javascript", content: "var hoge = 'huga'", pos: ...},
 * // ]
 * ```
 */
export async function loadActiveFileCodeBlocks(): Promise<CodeBlock[] | null> {
  return map(getActiveFile()?.path, (p) => loadCodeBlocks(p));
}

/**
 * ファイルパスからコードブロックを取得します
 *
 * ```ts
 * await loadCodeBlocks("Notes/sample-code.md")
 * // [
 * //   {language: "typescript", content: "const hoge = 'huga'", pos: ...},
 * //   {language: "javascript", content: "var hoge = 'huga'", pos: ...},
 * // ]
 * ```
 */
export async function loadCodeBlocks(
  path: string,
): Promise<CodeBlock[] | null> {
  const sections = getCodeBlockSectionsByPath(path);
  if (!sections) {
    return null;
  }

  const blocks = [];
  for (const section of sections) {
    const blockStr = (await loadFileContentCache(path, section.position))!;
    const language =
      blockStr.match(/[`~]{3,}(?<language>[^ \n]*)/)?.groups?.language || null;
    blocks.push({
      language,
      content: blockStr.split("\n").slice(1).slice(0, -1).join("\n"),
      position: section.position,
    });
  }

  return blocks;
}
