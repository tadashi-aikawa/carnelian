import { updateChangeLog } from "src/commands/update-change-log";
import { getUnresolvedLinkMap, hasBacklink } from "src/lib/helpers/links";
import { stripCodeAndHtmlBlocks } from "src/lib/obsutils/parser";
import {
  type Linter,
  type LintInspection,
  lineNoFromOffset,
} from "src/lib/utils/linter";
import {
  getSinglePatternCaptureMatchingLocations,
  getSinglePatternMatchingLocations,
  getWikiLinks,
  hasRedundantWikiLinkAlias,
  match,
} from "src/lib/utils/strings";
import type { LinterRuleConfig } from "../config";
import {
  findLintNoteTypeBy,
  type LintNoteType,
  resolveLintLevel,
} from "./LintNoteType";

export const contentLinter: Linter = {
  lint: ({ content, path, settings }) => {
    const noteType = findLintNoteTypeBy({ path, settings });
    if (!noteType) {
      return [];
    }

    const rules = settings?.rules?.content;
    return [
      ...(rules?.["Disallowed link card"]
        ? createDisallowedLinkCard(
            noteType,
            content,
            path,
            rules["Disallowed link card"],
          )
        : []),
      ...(rules?.["No link comment"]
        ? createNoLinkComment(noteType, content, path, rules["No link comment"])
        : []),
      ...(rules?.["v1 link card"]
        ? createV1LinkCard(noteType, content, path, rules["v1 link card"])
        : []),
      ...(rules?.["Unofficial MOC format"]
        ? createUnofficialMOCFormat(
            noteType,
            content,
            path,
            rules["Unofficial MOC format"],
          )
        : []),
      ...(rules?.["v1 dates format"]
        ? createV1DatesFormat(noteType, content, path, rules["v1 dates format"])
        : []),
      ...(rules?.["Unresolved internal link"]
        ? createUnresolvedInternalLink(
            noteType,
            path,
            content,
            rules["Unresolved internal link"],
          )
        : []),
      ...(rules?.["Link ends with parenthesis"]
        ? createLinkEndsWithParenthesis(
            noteType,
            content,
            path,
            rules["Link ends with parenthesis"],
          )
        : []),
      ...(rules?.["Redundant link alias"]
        ? createRedundantLinkAlias(
            noteType,
            content,
            path,
            rules["Redundant link alias"],
          )
        : []),
      ...(rules?.["Disallow fixme"]
        ? createDisallowFixme(noteType, content, path, rules["Disallow fixme"])
        : []),
      ...(rules?.["No backlinks"]
        ? createNoBacklinks(noteType, path, rules["No backlinks"])
        : []),
    ];
  },
};

const hasMOC = (content: string): boolean => content.includes("## MOC");
const hasOfficalMOCFormat = (content: string): boolean =>
  content.includes("- 📒**関連**") &&
  content.includes("- 📜**アクティビティ**") &&
  content.includes("- 📝**トラブルシューティング**");

const hasV1LinkCard = (content: string): boolean =>
  content.includes('class="link-card"');
const hasV2LinkCard = (content: string): boolean =>
  content.includes('class="link-card-v2"');
const hasLinkCard = (content: string): boolean =>
  hasV1LinkCard(content) || hasV2LinkCard(content);

const hasV1DatesFormat = (content: string): boolean =>
  content.includes('class="minerva-change-meta"');

function createDisallowedLinkCard(
  noteType: LintNoteType,
  content: string,
  path: string,
  rule?: LinterRuleConfig,
): LintInspection[] {
  const level = resolveLintLevel(rule, noteType.name, path);
  if (!level || !hasLinkCard(content)) {
    return [];
  }
  return [
    {
      code: "Disallowed link card",
      message: "許可されていないカード型リンクがあります",
      level,
    },
  ];
}

function createNoLinkComment(
  noteType: LintNoteType,
  content: string,
  path: string,
  rule?: LinterRuleConfig,
): LintInspection[] {
  const level = resolveLintLevel(rule, noteType.name, path);
  if (!level) {
    return [];
  }

  const base = {
    code: "No link comment",
    message: "内部リンクのリンクカードに対するリンクコメントがありません",
  };

  if (!hasLinkCard(content)) {
    return [];
  }

  const linkNames = getSinglePatternCaptureMatchingLocations(
    content,
    /<a data-href="([^"]+)"/g,
  );
  if (linkNames.length === 0) {
    return [];
  }

  return linkNames
    .filter((x) => !content.includes(`%%[[${x.captured}]]%%`))
    .map((x) => ({
      ...base,
      level,
      lineNo: lineNoFromOffset(content, x.range.start) ?? undefined,
      offset: x.range.start,
    }));
}

function createV1LinkCard(
  noteType: LintNoteType,
  content: string,
  path: string,
  rule?: LinterRuleConfig,
): LintInspection[] {
  const level = resolveLintLevel(rule, noteType.name, path);
  if (!level) {
    return [];
  }

  const base = {
    code: "v1 link card",
    message: "非推奨のv1形式カードリンクがあります",
  };

  return getSinglePatternMatchingLocations(content, /class="link-card"/g).map(
    (x) => ({
      ...base,
      level,
      offset: x.range.start - 6, // Live Previewの表示を確認するため1行前にする
    }),
  );
}

function createUnofficialMOCFormat(
  noteType: LintNoteType,
  content: string,
  path: string,
  rule?: LinterRuleConfig,
): LintInspection[] {
  const level = resolveLintLevel(rule, noteType.name, path);
  if (!level) {
    return [];
  }

  const base = {
    code: "Unofficial MOC format",
    message: "最新仕様に従っていないMOCがあります",
  };

  if (!hasMOC(content) || hasOfficalMOCFormat(content)) {
    return [];
  }
  return [{ ...base, level }];
}

function createV1DatesFormat(
  noteType: LintNoteType,
  content: string,
  path: string,
  rule?: LinterRuleConfig,
): LintInspection[] {
  const level = resolveLintLevel(rule, noteType.name, path);
  if (!level) {
    return [];
  }

  const base = {
    code: "v1 Dates format",
    message: "非推奨のv1形式の日付メタがあります",
    fixedMessage: "createdとupdatedプロパティを追加しました",
    fix: async () => {
      updateChangeLog();
    },
  };

  return hasV1DatesFormat(content) ? [{ ...base, level }] : [];
}

function createUnresolvedInternalLink(
  noteType: LintNoteType,
  path: string,
  content: string,
  rule?: LinterRuleConfig,
): LintInspection[] {
  const level = resolveLintLevel(rule, noteType.name, path);
  if (!level) {
    return [];
  }

  const base = {
    code: "Unresolved internal link",
  };

  const unresolvedLinkMap = getUnresolvedLinkMap(path);
  // 新規ファイル作成時はタイミングによってキャッシュが間に合わずnullになることがある
  if (!unresolvedLinkMap) {
    return [];
  }

  return Object.keys(unresolvedLinkMap)
    .flatMap((linkName) =>
      getSinglePatternMatchingLocations(
        content,
        new RegExp(`\\[\\[${linkName}(|\\|[^\\]]*)\\]\\]`, "g"),
      ),
    )
    .map((x) => ({
      ...base,
      level,
      lineNo: lineNoFromOffset(content, x.range.start) ?? undefined,
      offset: x.range.start,
      message: `[[${x.text}]] は未解決のリンクです`,
    }));
}

function createLinkEndsWithParenthesis(
  noteType: LintNoteType,
  content: string,
  path: string,
  rule?: LinterRuleConfig,
): LintInspection[] {
  const level = resolveLintLevel(rule, noteType.name, path);
  if (!level) {
    return [];
  }

  const base = {
    code: "Link ends with parenthesis",
  };

  return getWikiLinks(
    content
      .split("\n")
      // コメント内のinternal linkは検査対象外のため
      .map((l) => (l.startsWith("%%") ? "x".repeat(l.length) : l))
      .join("\n"),
  )
    .map((x) => ({ ...x, title: x.title.split("#")[0] })) // ヘッダは除外
    .filter((x) => {
      const target = x.alias ?? x.title;
      return match(target, / \(.+\)$/);
    })
    .map((x) => {
      const lineNo = lineNoFromOffset(content, x.range.start) ?? undefined;
      return {
        ...base,
        level,
        lineNo,
        offset: x.range.start,
        message: x.title,
      };
    });
}

function createRedundantLinkAlias(
  noteType: LintNoteType,
  content: string,
  path: string,
  rule?: LinterRuleConfig,
): LintInspection[] {
  const level = resolveLintLevel(rule, noteType.name, path);
  if (!level) {
    return [];
  }

  return getWikiLinks(
    content
      .split("\n")
      .map((line) => (line.startsWith("%%") ? "x".repeat(line.length) : line))
      .join("\n"),
  )
    .filter(hasRedundantWikiLinkAlias)
    .map((link) => {
      const lineNo = lineNoFromOffset(content, link.range.start) ?? undefined;
      return {
        code: "Redundant link alias",
        level,
        lineNo,
        offset: link.range.start,
        message: `[[${link.title}|${link.alias}]]`,
      };
    });
}

function createDisallowFixme(
  noteType: LintNoteType,
  content: string | undefined,
  path: string,
  rule?: LinterRuleConfig,
): LintInspection[] {
  const level = resolveLintLevel(rule, noteType.name, path);
  if (!level) {
    return [];
  }

  const normalizedContent = content ? stripCodeAndHtmlBlocks(content) : content;
  if (!normalizedContent) {
    return [];
  }

  const patterns = getSinglePatternMatchingLocations(
    normalizedContent,
    /(==.+?==|!fixme)/gi,
  );
  if (patterns.length === 0) {
    return [];
  }

  // normalizedContentでは元の位置が特定できないので位置情報は入れない
  return patterns.map(() => ({
    code: "Disallow fixme",
    message: "本文にFIXME相当の記述が残っています",
    level,
  }));
}

function createNoBacklinks(
  noteType: LintNoteType,
  path: string,
  config: LinterRuleConfig,
): LintInspection[] {
  const level = resolveLintLevel(config, noteType.name, path);
  if (!level) {
    return [];
  }

  const base = {
    code: "No backlinks",
    message: "バックリンクが存在しません",
  };

  return hasBacklink(path) ? [] : [{ ...base, level }];
}
