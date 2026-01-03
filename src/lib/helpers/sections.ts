import type { HeadingCache, SectionCache } from "obsidian";
import type { CodeBlock } from "../types";
import { map } from "../utils/guard";
import { getActiveFile, loadFileContentCache } from "./entries";
import { getFileCacheByPath } from "./metadata";

export type SectionType =
  | "yaml"
  | "paragraph"
  | "code"
  | "heading"
  | "list"
  | "html"
  | "table";
type Section = SectionCache & { type: SectionType };

/**
 * 現在ファイルの特定セクションを除いた内容を取得します
 * WARNING: 改行数は忠実に再現されません
 */
export async function getActiveFileSectionContents(option?: {
  excludeSectionTypes?: SectionType[];
}): Promise<string | null> {
  const path = getActiveFile()?.path;
  if (!path) {
    return null;
  }

  const excludeSectionTypes = option?.excludeSectionTypes ?? [];
  const sections = getFileCacheByPath(path)?.sections?.filter(
    (x) => !excludeSectionTypes.includes(x.type as SectionType),
  ) as Section[] | null;
  if (!sections) {
    return null;
  }

  const sectionContents = await Promise.all(
    sections.map((section) => loadFileContentCache(path, section.position)!),
  );
  return sectionContents.join("\n\n");
}

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
 * ファイルパスから指定見出しのセクション内容を取得します
 */
export async function loadHeadingSectionContentByPath(
  path: string,
  heading: string,
  level: number,
): Promise<string | null> {
  const headings = getFileCacheByPath(path)?.headings as HeadingCache[] | null;
  if (!headings) {
    return null;
  }

  const target = headings.find(
    (x) => x.level === level && x.heading === heading,
  );
  if (!target) {
    return null;
  }

  const next = headings
    .filter(
      (x) =>
        x.position.start.offset > target.position.start.offset &&
        x.level <= level,
    )
    .sort((a, b) => a.position.start.offset - b.position.start.offset)[0];

  const startOffset = target.position.end.offset;
  if (next) {
    return loadFileContentCache(path, {
      start: { offset: startOffset },
      end: { offset: next.position.start.offset },
    });
  }

  const fullContent = await loadFileContentCache(path);
  return fullContent ? fullContent.slice(startOffset) : null;
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
