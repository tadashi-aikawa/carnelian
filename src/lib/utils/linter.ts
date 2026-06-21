import type { PluginSettings } from "src/settings";
import type { Properties } from "./types";

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
  return linters.flatMap((ltr) => ltr.lint(args));
}
