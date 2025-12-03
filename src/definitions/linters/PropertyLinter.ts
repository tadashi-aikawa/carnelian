import {
  removeActiveFileProperty,
  updateActiveFileProperty,
} from "src/lib/helpers/properties";
import {
  stripCodeAndHtmlBlocks,
  stripDecoration,
  stripLinks,
} from "src/lib/obsutils/parser";
import { ExhaustiveError } from "src/lib/utils/errors";
import { isPresent } from "src/lib/utils/guard";
import type { LintInspection, Linter } from "src/lib/utils/linter";
import { isMatchedGlobPatterns, match } from "src/lib/utils/strings";
import type { Properties } from "src/lib/utils/types";
import { P, match as tsmatch } from "ts-pattern";
import type { PropertyLinterConfig } from "../config";
import { findNoteTypeBy } from "../mkms";
import type { NoteType } from "../mkms";

export const propertyLinter: Linter = {
  lint: ({ title, properties, body, path, settings }) => {
    const noteType = findNoteTypeBy({ path });
    if (!noteType) {
      return [];
    }

    const rules = settings?.rules?.propery;
    return [
      rules?.["No description"]
        ? createNoDescription(noteType, properties)
        : null,
      rules?.["No cover"] ? createNoCover(noteType, path, properties) : null,
      rules?.["No url"] ? createNoUrl(noteType, properties) : null,
      rules?.["No status"] ? createNoStatus(noteType, properties) : null,
      rules?.Tags ? createTags(title, properties, path) : null,
      rules?.["MkDocs title"] ? createMkDocsTitle(title, properties) : null,
      rules?.["Inconsistent fixme"]
        ? createInconsistentFixme(properties, body)
        : null,
      rules?.["Inconsistent description"]
        ? createInconsistentDescription(
            noteType,
            path,
            body,
            properties,
            rules["Inconsistent description"],
          )
        : null,
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

  switch (noteType.name) {
    case "Glossary note":
      return { ...base, level: "ERROR" };
    case "Hub note":
      return null;
    case "Procedure note":
      return { ...base, level: "WARN" };
    case "Activity note":
      return { ...base, level: "ERROR" };
    case "Troubleshooting note":
      return { ...base, level: "ERROR" };
    case "Prime note":
      return { ...base, level: "ERROR" };
    case "Report note":
      return { ...base, level: "ERROR" };
    case "Article note":
      return { ...base, level: "ERROR" };
    case "Brain note":
      return { ...base, level: "ERROR" };
    case "My note":
      return { ...base, level: "WARN" };
    case "Series note":
      return { ...base, level: "ERROR" };
    case "Rule note":
      return { ...base, level: "ERROR" };
    case "ADR note":
      return { ...base, level: "ERROR" };
    case "Daily note":
      return null;
    case "Weekly report":
      return { ...base, level: "ERROR" };
    default:
      throw new ExhaustiveError(noteType);
  }
}

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

  switch (noteType.name) {
    case "Glossary note":
      return null;
    case "Hub note":
      return { ...base, level: "ERROR" };
    case "Procedure note":
      return null;
    case "Activity note":
      return { ...base, level: "ERROR" };
    case "Troubleshooting note":
      return { ...base, level: "ERROR" };
    case "Prime note":
      return { ...base, level: "ERROR" };
    case "Report note":
      return { ...base, level: "ERROR" };
    case "Article note":
      return { ...base, level: "ERROR" };
    case "Brain note":
      return { ...base, level: "ERROR" };
    case "My note":
      return { ...base, level: "ERROR" };
    case "Series note":
      return { ...base, level: "ERROR" };
    case "Rule note":
      return { ...base, level: "ERROR" };
    case "ADR note":
      return { ...base, level: "ERROR" };
    case "Daily note":
      return null;
    case "Weekly report":
      return { ...base, level: "ERROR" };
    default:
      throw new ExhaustiveError(noteType);
  }
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

  switch (noteType.name) {
    case "Glossary note":
      return { ...base, level: "WARN" };
    case "Hub note":
      return null;
    case "Procedure note":
      return { ...base, level: "INFO" };
    case "Activity note":
      return null;
    case "Troubleshooting note":
      return null;
    case "Prime note":
      return null;
    case "Report note":
      return null;
    case "Article note":
      return null;
    case "Brain note":
      return null;
    case "My note":
      return null;
    case "Series note":
      return null;
    case "Rule note":
      return null;
    case "ADR note":
      return null;
    case "Daily note":
      return null;
    case "Weekly report":
      return null;
    default:
      throw new ExhaustiveError(noteType);
  }
}

function createNoStatus(
  noteType: NoteType,
  properties?: Properties,
): LintInspection | null {
  if (properties?.status) {
    return null;
  }

  const base = {
    code: "No status",
    message: "statusに『✅解決済』を割り当てました",
    fix: async () => {
      updateActiveFileProperty("status", "✅解決済");
    },
  };

  switch (noteType.name) {
    case "Glossary note":
      return null;
    case "Hub note":
      return null;
    case "Procedure note":
      return null;
    case "Activity note":
      return null;
    case "Troubleshooting note":
      return { ...base, level: "ERROR" };
    case "Prime note":
      return null;
    case "Report note":
      return null;
    case "Article note":
      return null;
    case "Brain note":
      return null;
    case "My note":
      return null;
    case "Series note":
      return null;
    case "Rule note":
      return null;
    case "ADR note":
      return {
        code: "No status",
        message: "プロパティにstatusがありません",
        level: "ERROR",
      };
    case "Daily note":
      return null;
    case "Weekly report":
      return null;
    default:
      throw new ExhaustiveError(noteType);
  }
}

function createTags(
  title: string,
  properties?: Properties,
  path?: string,
): LintInspection | null {
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
  };
}

function createMkDocsTitle(
  title: string,
  properties?: Properties,
): LintInspection | null {
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
  };
}

function createInconsistentFixme(
  properties?: Properties,
  body?: string,
): LintInspection | null {
  const normalizedContent = body ? stripCodeAndHtmlBlocks(body) : body;
  const fixmeInContent = !normalizedContent
    ? false
    : normalizedContent.includes("!FIXME") ||
      normalizedContent.includes("!fixme") ||
      match(normalizedContent, /==.+?==/);
  const fixmeInProperties = properties?.fixme as boolean | undefined;

  return tsmatch([fixmeInContent, fixmeInProperties])
    .with([true, true], () => null)
    .with([false, undefined], () => null)
    .with([true, P.union(false, undefined)], () => {
      return {
        code: "Inconsistent fixme",
        message: "fixmeプロパティをtrueにしました",
        level: "ERROR" as LintInspection["level"],
        fix: async () => {
          updateActiveFileProperty("fixme", true);
        },
      };
    })
    .with([false, P.union(true, false)], () => {
      return {
        code: "Inconsistent fixme",
        message: "fixmeプロパティを削除しました",
        level: "ERROR" as LintInspection["level"],
        fix: async () => {
          removeActiveFileProperty("fixme");
        },
      };
    })
    .exhaustive();
}

function createInconsistentDescription(
  noteType: NoteType,
  path: string,
  body: string,
  properties?: Properties,
  settings?: NonNullable<PropertyLinterConfig>["Inconsistent description"],
): LintInspection | null {
  const shouldIgnored = isMatchedGlobPatterns(
    path,
    settings?.ignoreFiles ?? [],
  );
  if (shouldIgnored) {
    return null;
  }

  const supported = tsmatch(noteType.name)
    .with(P.union("Glossary note", "My note"), () => true)
    .with(
      P.union(
        "Hub note",
        "Procedure note",
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

  const firstLine = body.split("\n").at(0) || undefined;
  const strippedFirstLine = firstLine
    ? stripLinks(stripDecoration(firstLine))
    : firstLine;

  const description = properties?.description as string | undefined;

  return tsmatch([strippedFirstLine, description])
    .with([undefined, undefined], () => null)
    .with([P.string, undefined], () => ({
      code: "Inconsistent description",
      message: "descriptionプロパティを追加しました",
      level: "ERROR" as LintInspection["level"],
      fix: async () => {
        updateActiveFileProperty("description", strippedFirstLine);
      },
    }))
    .with([undefined, P.string], () => ({
      code: "Inconsistent description",
      message: "descriptionプロパティを削除しました",
      level: "ERROR" as LintInspection["level"],
      fix: async () => {
        removeActiveFileProperty("description");
      },
    }))
    .with([P.string, P.string], ([first, desc]) =>
      first === desc
        ? null
        : {
            code: "Inconsistent description",
            message: "descriptionプロパティを更新しました",
            level: "ERROR" as LintInspection["level"],
            fix: async () => {
              updateActiveFileProperty("description", strippedFirstLine);
            },
          },
    )
    .exhaustive();
}
