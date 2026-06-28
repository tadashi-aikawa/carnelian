import type { PluginSettings } from "src/settings";
import { isMatchedGlobPattern } from "./strings";
import type { Properties } from "./types";

type IgnoreLintEntry = {
  rule: string;
  message?: string;
};

export interface LintInspection {
  code: string;
  /** エラー内容の説明(常に設定) */
  message: string;
  /** fix実行後に表示する通知文言(fixableなルールのみ設定) */
  fixedMessage?: string;
  level: "INFO" | "WARN" | "ERROR";
  lineNo?: number;
  offset?: number;
  fix?: () => Promise<void>;
}
type LintArgs = {
  title: string;
  /** プロパティ含む全文 */
  content: string;
  /** プロパティ除く本文 */
  body: string;
  /** Vault rootからの相対パス (ex: Notes/hoge.md) */
  path: string;
  properties?: Properties;
  settings: PluginSettings["linter"];
};
type LintFunction = (args: LintArgs) => LintInspection[];

export interface Linter {
  lint: LintFunction;
}

export function lintAll(linters: Linter[], args: LintArgs): LintInspection[] {
  const inspections = linters.flatMap((ltr) => ltr.lint(args));

  const raw = args.properties?.ignoreLint;
  const ignoreLintEntries: IgnoreLintEntry[] = Array.isArray(raw)
    ? raw
        .filter((x): x is string => typeof x === "string")
        .map(parseIgnoreLintEntry)
    : [];
  if (ignoreLintEntries.length === 0) {
    return inspections;
  }

  return inspections.filter(
    (ins) => !shouldIgnoreInspection(ins, ignoreLintEntries),
  );
}

function parseIgnoreLintEntry(entry: string): IgnoreLintEntry {
  const colonIndex = entry.indexOf(":");
  if (colonIndex === -1) {
    return { rule: entry };
  }
  return {
    rule: entry.slice(0, colonIndex),
    message: entry.slice(colonIndex + 1),
  };
}

function shouldIgnoreInspection(
  inspection: LintInspection,
  entries: IgnoreLintEntry[],
): boolean {
  return entries.some((entry) => {
    if (entry.rule !== inspection.code) {
      return false;
    }
    if (entry.message) {
      return isMatchedGlobPattern(inspection.message, entry.message);
    }
    return true;
  });
}

export function lineNoFromOffset(
  content: string,
  offset: number,
): number | null {
  if (!Number.isInteger(offset) || offset < 0 || offset > content.length) {
    return null;
  }
  return content.slice(0, offset).split("\n").length;
}
