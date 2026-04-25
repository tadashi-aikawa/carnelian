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
import type { LintInspection, Linter } from "src/lib/utils/linter";
import {
  isBlockquote,
  isCodeBlockStartOrEnd,
  isHeading,
  isHtmlTag,
  isMatchedGlobPatterns,
  isOnlyImageEmbedLink,
  match,
} from "src/lib/utils/strings";
import type { Properties } from "src/lib/utils/types";
import { P, match as tsmatch } from "ts-pattern";
import type { PropertyLinterConfig } from "../config";
import { findNoteTypeBy } from "../mkms";
import type { NoteType } from "../mkms";

type PropertyLintInspection = LintInspection & {
  propertyCommand?: { [key: string]: any | null };
};

export const propertyLinter: Linter = {
  lint: ({ title, properties, body, path, settings }) => {
    const noteType = findNoteTypeBy({ path });
    if (!noteType) {
      return [];
    }

    const rules = settings?.rules?.propery;

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
        ? vpUpdateWrapper(createInconsistentFixme(vp, body))
        : null,
      rules?.["No cover"]
        ? vpUpdateWrapper(createNoCover(noteType, path, vp))
        : null,
      rules?.["No status"]
        ? vpUpdateWrapper(createNoStatus(noteType, vp))
        : null,
      rules?.Tags ? vpUpdateWrapper(createTags(title, vp, path)) : null,
      rules?.["MkDocs title"]
        ? vpUpdateWrapper(createMkDocsTitle(title, vp))
        : null,

      rules?.["No description"] ? createNoDescription(noteType, vp) : null,
      rules?.["No url"] ? createNoUrl(noteType, vp) : null,
    ].filter(isPresent);
  },
};

function createNoDescription(
  noteType: NoteType,
  properties?: Properties,
): LintInspection | null {
  if (properties?.description) {
    return null;
  }

  const base = {
    code: "No description",
    message: "プロパティにdescriptionがありません",
  };

  return tsmatch(noteType.name)
    .returnType<LintInspection | null>()
    .with(
      P.union(
        "Glossary note",
        "Activity note",
        "Troubleshooting note",
        "Prime note",
        "Report note",
        "Article note",
        "Brain note",
        "Series note",
        "Rule note",
        "ADR note",
        "Weekly report",
      ),
      () => ({ ...base, level: "ERROR" }),
    )
    .with(P.union("Hub note", "Daily note"), () => null)
    .with(P.union("Procedure note", "My note"), () => ({
      ...base,
      level: "WARN",
    }))
    .exhaustive();
}

// PropertyLintInspectionは不要
function createNoCover(
  noteType: NoteType,
  path: string,
  properties?: Properties,
): LintInspection | null {
  if (properties?.cover) {
    return null;
  }

  const base = {
    code: "No cover",
    message: "coverを割り当てました",
    fix: noteType.coverImagePath
      ? async () => {
          updateActiveFileProperty("cover", noteType.coverImagePath);
        }
      : path.startsWith("📗Productivityを上げるために大切な100のこと/")
        ? async () => {
            updateActiveFileProperty(
              "cover",
              "📗Productivityを上げるために大切な100のこと/attachments/productivity100.webp",
            );
          }
        : undefined,
  };

  return tsmatch(noteType.name)
    .returnType<ReturnType<typeof createNoCover>>()
    .with(
      P.union(
        "Glossary note",
        "Hub note",
        "Procedure note",
        "Activity note",
        "Troubleshooting note",
        "Prime note",
        "Report note",
        "Article note",
        "Brain note",
        "My note",
        "Series note",
        "Rule note",
        "ADR note",
        "Weekly report",
      ),
      () => ({ ...base, level: "ERROR" }),
    )
    .with("Daily note", () => null)
    .exhaustive();
}

function createNoUrl(
  noteType: NoteType,
  properties?: Properties,
): LintInspection | null {
  if (properties?.url) {
    return null;
  }

  const base = {
    code: "No url",
    message: "プロパティにurlがありません",
  };

  return tsmatch(noteType.name)
    .returnType<LintInspection | null>()
    .with("Glossary note", () => ({ ...base, level: "WARN" }))
    .with("Procedure note", () => ({ ...base, level: "INFO" }))
    .with(
      P.union(
        "Hub note",
        "Activity note",
        "Troubleshooting note",
        "Prime note",
        "Report note",
        "Article note",
        "Brain note",
        "My note",
        "Series note",
        "Rule note",
        "ADR note",
        "Daily note",
        "Weekly report",
      ),
      () => null,
    )
    .exhaustive();
}

function createNoStatus(
  noteType: NoteType,
  properties?: Properties,
): PropertyLintInspection | null {
  if (properties?.status) {
    return null;
  }

  const base = {
    code: "No status",
    message: "statusに『✅解決済』を割り当てました",
    fix: async () => {
      updateActiveFileProperty("status", "✅解決済");
    },
    propertyCommand: { status: "✅解決済" },
  };

  return tsmatch(noteType.name)
    .returnType<ReturnType<typeof createNoStatus> | null>()
    .with("Troubleshooting note", () => ({ ...base, level: "ERROR" }))
    .with(
      P.union(
        "Glossary note",
        "Hub note",
        "Procedure note",
        "Activity note",
        "Prime note",
        "Report note",
        "Article note",
        "Brain note",
        "My note",
        "Series note",
        "Rule note",
        "ADR note",
        "Daily note",
        "Weekly report",
      ),
      () => null,
    )
    .exhaustive();
}

function createTags(
  title: string,
  properties?: Properties,
  path?: string,
): PropertyLintInspection | null {
  const tags = properties?.tags;

  if (title.endsWith("(JavaScript)")) {
    if (tags?.includes("TypeScript")) {
      return null;
    }
    return {
      code: "Tags",
      message: "tagsに『TypeScript』を設定しました",
      level: "ERROR" as LintInspection["level"],
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
      message: "tagsに『Neovim』を設定しました",
      level: "ERROR" as LintInspection["level"],
      fix: async () => {
        updateActiveFileProperty("tags", ["Neovim"]);
      },
      propertyCommand: { tags: ["Neovim"] },
    };
  }

  // 📗Obsidian逆引きレシピ ディレクトリ配下のSeries noteはObsidianタグを付与
  if (path?.startsWith("📗Obsidian逆引きレシピ/")) {
    const noteType = findNoteTypeBy({ path });
    if (noteType?.name === "Series note") {
      if (tags?.includes("Obsidian")) {
        return null;
      }
      return {
        code: "Tags",
        message: "tagsに『Obsidian』を設定しました",
        level: "ERROR" as LintInspection["level"],
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
    message: `tags『${tags.toString()}』を削除しました`,
    level: "ERROR" as LintInspection["level"],
    fix: async () => {
      removeActiveFileProperty("tags");
    },
    propertyCommand: { tags: null },
  };
}

function createMkDocsTitle(
  title: string,
  properties?: Properties,
): PropertyLintInspection | null {
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
        message: "titleを削除しました",
        level: "ERROR" as LintInspection["level"],
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
    message: "titleを修正しました",
    level: "ERROR" as LintInspection["level"],
    fix: async () => {
      updateActiveFileProperty("title", title);
    },
    propertyCommand: { title },
  };
}

function createInconsistentFixme(
  properties?: Properties,
  body?: string,
): PropertyLintInspection | null {
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
      message: "fixmeプロパティをtrueにしました",
      level: "ERROR" as LintInspection["level"],
      fix: async () => {
        updateActiveFileProperty("fixme", true);
      },
      propertyCommand: { fixme: true },
    }))
    .with([false, P.union(true, false)], () => ({
      code: "Inconsistent fixme",
      message: "fixmeプロパティを削除しました",
      level: "ERROR" as LintInspection["level"],
      fix: async () => {
        removeActiveFileProperty("fixme");
      },
      propertyCommand: { fixme: null },
    }))
    .exhaustive();
}

function createInconsistentDescription(
  noteType: NoteType,
  path: string,
  body: string,
  properties?: Properties,
  settings?: PropertyLinterConfig["Inconsistent description"],
): PropertyLintInspection | null {
  const shouldIgnored = isMatchedGlobPatterns(
    path,
    settings?.ignoreFiles ?? [],
  );
  if (shouldIgnored) {
    return null;
  }

  const supported = tsmatch(noteType.name)
    .with(
      P.union("Glossary note", "Procedure note", "My note", "Hub note"),
      () => true,
    )
    .with(
      P.union(
        "Activity note",
        "Troubleshooting note",
        "Prime note",
        "Report note",
        "Article note",
        "Brain note",
        "Series note",
        "Rule note",
        "ADR note",
        "Daily note",
        "Weekly report",
      ),
      () => false,
    )
    .exhaustive();
  if (!supported) {
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
      message: "descriptionプロパティを追加しました",
      level: "ERROR" as LintInspection["level"],
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
            message: "descriptionプロパティを更新しました",
            level: "ERROR" as LintInspection["level"],
            fix: async () => {
              updateActiveFileProperty("description", newDescription);
            },
            propertyCommand: { description: newDescription },
          },
    )
    .exhaustive();
}
