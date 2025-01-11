import { updateActiveFileProperty } from "src/lib/helpers/properties";
import { ExhaustiveError } from "src/lib/utils/errors";
import { isPresent } from "src/lib/utils/guard";
import type { LintInspection, Linter } from "src/lib/utils/linter";
import type { Properties } from "src/lib/utils/types";
import { findNoteTypeBy } from "../mkms";
import type { NoteType } from "../mkms";

export const propertyLinter: Linter = {
  lint: ({ title, properties, path }) => {
    const noteType = findNoteTypeBy({ name: title, path });
    if (!noteType) {
      return [];
    }

    return [
      createNoDescription(noteType, properties),
      createNoCover(noteType, properties),
      createNoUrl(noteType, properties),
      createNoStatus(noteType, properties),
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
    message: "プロパティにcoverがありません",
    fix: async () => {
      updateActiveFileProperty("cover", noteType.coverImagePath);
    },
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
    message: "プロパティにstatusがありません",
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
    case "Daily note":
      return null;
    case "Weekly report":
      return null;
    default:
      throw new ExhaustiveError(noteType);
  }
}
