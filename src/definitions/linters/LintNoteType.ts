import type { LinterRuleConfig } from "src/definitions/config";
import { isMatchedGlobPatterns } from "src/lib/utils/strings";
import type { PluginSettings } from "src/settings";

export type LintNoteType = {
  name: string;
  coverImagePath?: string | null;
};

const pathPatternCache = new Map<string, RegExp | null>();

export function findLintNoteTypeBy(args: {
  path: string;
  settings: PluginSettings["linter"];
}): LintNoteType | null {
  for (const noteType of args.settings?.noteTypes ?? []) {
    if (!matchesPathPattern(args.path, noteType.pathPattern)) {
      continue;
    }
    return {
      name: noteType.name,
      coverImagePath: noteType.coverImagePath,
    };
  }
  return null;
}

export function resolveLintLevel(
  rule: LinterRuleConfig | undefined,
  noteTypeName: string,
  path: string,
): NonNullable<LinterRuleConfig["defaultLevel"]> | null {
  if (!rule) {
    return null;
  }
  if (isMatchedGlobPatterns(path, rule.ignoreFiles ?? [])) {
    return null;
  }
  const level = rule.levels?.[noteTypeName];
  return level !== undefined ? level : (rule.defaultLevel ?? null);
}

function matchesPathPattern(path: string, pattern: string): boolean {
  const regexp = getPathPatternRegExp(pattern);
  return regexp?.test(path) ?? false;
}

function getPathPatternRegExp(pattern: string): RegExp | null {
  if (pathPatternCache.has(pattern)) {
    return pathPatternCache.get(pattern) ?? null;
  }
  try {
    const regexp = new RegExp(pattern);
    pathPatternCache.set(pattern, regexp);
    return regexp;
  } catch {
    pathPatternCache.set(pattern, null);
    return null;
  }
}
