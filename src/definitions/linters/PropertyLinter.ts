import {
  removeActiveFileProperty,
  updateActiveFileProperty,
} from "src/lib/helpers/properties";
import { ExhaustiveError } from "src/lib/utils/errors";
import { isPresent } from "src/lib/utils/guard";
import type { LintInspection, Linter } from "src/lib/utils/linter";
import type { Properties } from "src/lib/utils/types";
import { findNoteTypeBy } from "../mkms";
import type { NoteType } from "../mkms";

export const propertyLinter: Linter = {
  lint: ({ title, properties, path }) => {
    const noteType = findNoteTypeBy({ path });
    if (!noteType) {
      return [];
    }

    return [
      createNoDescription(noteType, properties),
      createNoCover(noteType, properties),
      createNoUrl(noteType, properties),
      createNoStatus(noteType, properties),
      createTags(title, properties, path),
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
