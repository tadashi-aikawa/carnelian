import {
  removeActiveFileProperty,
  updateActiveFileProperty,
} from "src/lib/helpers/properties";
import {
  stripCodeAndHtmlBlocks,
  stripDecoration,
  stripLinks,
} from "src/lib/obsutils/parser";
import { isPresent } from "src/lib/utils/guard";
import type { Linter, LintInspection } from "src/lib/utils/linter";
import {
  isBlockquote,
  isCodeBlockStartOrEnd,
  isHeading,
  isHtmlTag,
  isOnlyImageEmbedLink,
  match,
} from "src/lib/utils/strings";
import type { Properties } from "src/lib/utils/types";
import { P, match as tsmatch } from "ts-pattern";
import type { LinterRuleConfig } from "../config";
import {
  findLintNoteTypeBy,
  type LintNoteType,
  resolveLintLevel,
} from "./LintNoteType";

type PropertyLintInspection = LintInspection & {
  propertyCommand?: { [key: string]: any | null };
};

export const propertyLinter: Linter = {
  lint: ({ title, properties, body, path, settings }) => {
    const noteType = findLintNoteTypeBy({ path, settings });
    if (!noteType) {
      return [];
    }

    const rules = settings?.rules?.property;

    // autofixでプロパティに修正が加わるものは、vpに反映させてから他のルールを評価する
    let vp = properties || {};
    const vpUpdateWrapper = (
      mutableLintInspection: PropertyLintInspection | null,
    ): LintInspection | null => {
      if (!mutableLintInspection) {
        return null;
      }

      if (mutableLintInspection.propertyCommand) {
        vp = { ...vp, ...mutableLintInspection.propertyCommand };
      }
      return mutableLintInspection;
    };

    return [
      rules?.["Inconsistent description"]
        ? vpUpdateWrapper(
            createInconsistentDescription(
              noteType,
              path,
              body,
              vp,
              rules["Inconsistent description"],
            ),
          )
        : null,
      rules?.["Inconsistent fixme"]
        ? vpUpdateWrapper(
            createInconsistentFixme(
              noteType,
              path,
              vp,
              body,
              rules["Inconsistent fixme"],
            ),
          )
        : null,
      rules?.["No cover"]
        ? vpUpdateWrapper(createNoCover(noteType, path, vp, rules["No cover"]))
        : null,
      rules?.["No status"]
        ? vpUpdateWrapper(
            createNoStatus(noteType, path, vp, rules["No status"]),
          )
        : null,
      rules?.Tags
        ? vpUpdateWrapper(createTags(noteType, title, vp, path, rules.Tags))
        : null,
      rules?.["MkDocs title"]
        ? vpUpdateWrapper(
            createMkDocsTitle(noteType, path, title, vp, rules["MkDocs title"]),
          )
        : null,

      rules?.["No description"]
        ? createNoDescription(noteType, path, vp, rules["No description"])
        : null,
      rules?.["No url"]
        ? createNoUrl(noteType, path, vp, rules["No url"])
        : null,
    ].filter(isPresent);
  },
};

function createNoDescription(
  noteType: LintNoteType,
  path: string,
  properties?: Properties,
  rule?: LinterRuleConfig,
): LintInspection | null {
  if (properties?.description) {
    return null;
  }
  const level = resolveLintLevel(rule, noteType.name, path);
  if (!level) {
    return null;
  }

  return {
    code: "No description",
    message: "プロパティにdescriptionがありません",
    level,
  };
}

function createNoCover(
  noteType: LintNoteType,
  path: string,
  properties?: Properties,
  rule?: LinterRuleConfig,
): LintInspection | null {
  if (properties?.cover) {
    return null;
  }
  const level = resolveLintLevel(rule, noteType.name, path);
  if (!level) {
    return null;
  }

  return {
    code: "No cover",
    message: "coverプロパティがありません",
    fixedMessage: "coverを割り当てました",
    level,
    fix: noteType.coverImagePath
      ? async () => {
          updateActiveFileProperty("cover", noteType.coverImagePath);
        }
      : undefined,
  };
}

function createNoUrl(
  noteType: LintNoteType,
  path: string,
  properties?: Properties,
  rule?: LinterRuleConfig,
): LintInspection | null {
  if (properties?.url) {
    return null;
  }
  const level = resolveLintLevel(rule, noteType.name, path);
  if (!level) {
    return null;
  }

  return {
    code: "No url",
    message: "プロパティにurlがありません",
    level,
  };
}

function createNoStatus(
  noteType: LintNoteType,
  path: string,
  properties?: Properties,
  rule?: LinterRuleConfig,
): PropertyLintInspection | null {
  if (properties?.status) {
    return null;
  }
  const level = resolveLintLevel(rule, noteType.name, path);
  if (!level) {
    return null;
  }

  return {
    code: "No status",
    message: "statusプロパティがありません",
    fixedMessage: "statusに『✅解決済』を割り当てました",
    level,
    fix: async () => {
      updateActiveFileProperty("status", "✅解決済");
    },
    propertyCommand: { status: "✅解決済" },
  };
}

function createTags(
  noteType: LintNoteType,
  title: string,
  properties: Properties | undefined,
  path: string,
  rule?: LinterRuleConfig,
): PropertyLintInspection | null {
  const tags = properties?.tags;
  const level = resolveLintLevel(rule, noteType.name, path);
  if (!level) {
    return null;
  }

  if (title.endsWith("(JavaScript)")) {
    if (tags?.includes("TypeScript")) {
      return null;
    }
    return {
      code: "Tags",
      message: "tagsに『TypeScript』が設定されていません",
      fixedMessage: "tagsに『TypeScript』を設定しました",
      level,
      fix: async () => {
        updateActiveFileProperty("tags", ["TypeScript"]);
      },
      propertyCommand: { tags: ["TypeScript"] },
    };
  }

  if (title.endsWith("(Vim)")) {
    if (tags?.includes("Neovim")) {
      return null;
    }
    return {
      code: "Tags",
      message: "tagsに『Neovim』が設定されていません",
      fixedMessage: "tagsに『Neovim』を設定しました",
      level,
      fix: async () => {
        updateActiveFileProperty("tags", ["Neovim"]);
      },
      propertyCommand: { tags: ["Neovim"] },
    };
  }

  // 📗Obsidian逆引きレシピ ディレクトリ配下のSeries noteはObsidianタグを付与
  if (path?.startsWith("📗Obsidian逆引きレシピ/")) {
    if (noteType?.name === "Series note") {
      if (tags?.includes("Obsidian")) {
        return null;
      }
      return {
        code: "Tags",
        message: "tagsに『Obsidian』が設定されていません",
        fixedMessage: "tagsに『Obsidian』を設定しました",
        level,
        fix: async () => {
          updateActiveFileProperty("tags", ["Obsidian"]);
        },
        propertyCommand: { tags: ["Obsidian"] },
      };
    }
  }

  if (!tags) {
    return null;
  }

  return {
    code: "Tags",
    message: `不要なtags『${tags.toString()}』が設定されています`,
    fixedMessage: `tags『${tags.toString()}』を削除しました`,
    level,
    fix: async () => {
      removeActiveFileProperty("tags");
    },
    propertyCommand: { tags: null },
  };
}

function createMkDocsTitle(
  noteType: LintNoteType,
  path: string,
  title: string,
  properties?: Properties,
  rule?: LinterRuleConfig,
): PropertyLintInspection | null {
  const level = resolveLintLevel(rule, noteType.name, path);
  if (!level) {
    return null;
  }

  // TODO: 設定を反映させるようにしたい
  if (title === "nav" || title === "index") {
    return null;
  }

  const propsTitle = properties?.title;
  if (title === propsTitle) {
    return null;
  }

  const needTitle =
    title.includes("_") || title.includes("-") || match(title, /^[a-z]/);
  if (!needTitle) {
    if (propsTitle) {
      return {
        code: "MkDocs Title",
        message: "不要なtitleプロパティがあります",
        fixedMessage: "titleを削除しました",
        level,
        fix: async () => {
          removeActiveFileProperty("title");
        },
        propertyCommand: { title: null },
      };
    }
    return null;
  }

  return {
    code: "MkDocs Title",
    message: "titleプロパティが正しくありません",
    fixedMessage: "titleを修正しました",
    level,
    fix: async () => {
      updateActiveFileProperty("title", title);
    },
    propertyCommand: { title },
  };
}

function createInconsistentFixme(
  noteType: LintNoteType,
  path: string,
  properties?: Properties,
  body?: string,
  rule?: LinterRuleConfig,
): PropertyLintInspection | null {
  const level = resolveLintLevel(rule, noteType.name, path);
  if (!level) {
    return null;
  }

  const normalizedContent = body ? stripCodeAndHtmlBlocks(body) : body;
  const fixmeInContent = !normalizedContent
    ? false
    : normalizedContent.includes("!FIXME") ||
      normalizedContent.includes("!fixme") ||
      match(normalizedContent, /==.+?==/);
  const fixmeInProperties = properties?.fixme as boolean | undefined;

  return tsmatch([fixmeInContent, fixmeInProperties])
    .returnType<ReturnType<typeof createInconsistentFixme> | null>()
    .with([true, true], () => null)
    .with([false, undefined], () => null)
    .with([true, P.union(false, undefined)], () => ({
      code: "Inconsistent fixme",
      message: "本文にFIXMEがあるのにfixmeプロパティがありません",
      fixedMessage: "fixmeプロパティをtrueにしました",
      level,
      fix: async () => {
        updateActiveFileProperty("fixme", true);
      },
      propertyCommand: { fixme: true },
    }))
    .with([false, P.union(true, false)], () => ({
      code: "Inconsistent fixme",
      message: "本文にFIXMEが無いのにfixmeプロパティがあります",
      fixedMessage: "fixmeプロパティを削除しました",
      level,
      fix: async () => {
        removeActiveFileProperty("fixme");
      },
      propertyCommand: { fixme: null },
    }))
    .exhaustive();
}

function createInconsistentDescription(
  noteType: LintNoteType,
  path: string,
  body: string,
  properties?: Properties,
  settings?: LinterRuleConfig,
): PropertyLintInspection | null {
  const level = resolveLintLevel(settings, noteType.name, path);
  if (!level) {
    return null;
  }

  const createNewDescription = () => {
    const line = body.split("\n").at(0)?.trim();
    if (!line) {
      return null;
    }
    if (isOnlyImageEmbedLink(line)) {
      return null;
    }

    const strippedLine = stripLinks(stripDecoration(line));
    if (!strippedLine) {
      return null;
    }

    if (isHeading(strippedLine)) {
      return null;
    }
    if (isCodeBlockStartOrEnd(strippedLine)) {
      return null;
    }
    if (isBlockquote(strippedLine)) {
      return null;
    }
    if (isHtmlTag(strippedLine)) {
      return null;
    }

    return strippedLine;
  };

  const description = properties?.description as string | undefined;

  return tsmatch([createNewDescription(), description])
    .returnType<ReturnType<typeof createInconsistentDescription> | null>()
    .with([null, P._], () => null)
    .with([P.string, undefined], ([newDescription]) => ({
      code: "Inconsistent description",
      message: "descriptionプロパティがありません",
      fixedMessage: "descriptionプロパティを追加しました",
      level,
      fix: async () => {
        updateActiveFileProperty("description", newDescription);
      },
      propertyCommand: { description: newDescription },
    }))
    .with([P.string, P.string], ([newDescription, description]) =>
      newDescription === description
        ? null
        : {
            code: "Inconsistent description",
            message: "descriptionプロパティが本文と一致していません",
            fixedMessage: "descriptionプロパティを更新しました",
            level,
            fix: async () => {
              updateActiveFileProperty("description", newDescription);
            },
            propertyCommand: { description: newDescription },
          },
    )
    .exhaustive();
}
