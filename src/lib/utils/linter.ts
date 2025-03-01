import type { Properties } from "./types";

export interface LintInspection {
  code: string;
  message: string;
  level: "INFO" | "WARN" | "ERROR";
  lineNo?: number;
  offset?: number;
  fix?: () => Promise<void>;
}
type LintArgs = {
  title: string;
  content: string;
  /**
   * Vault rootからの相対パス (ex: Notes/hoge.md)
   */
  path: string;
  properties?: Properties;
};
type LintFunction = (args: LintArgs) => LintInspection[];

export interface Linter {
  lint: LintFunction;
}

export function lintAll(linters: Linter[], args: LintArgs): LintInspection[] {
  return linters.flatMap((ltr) => ltr.lint(args));
}
