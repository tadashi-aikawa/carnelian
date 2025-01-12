import { getUnresolvedLinkMap } from "src/lib/helpers/links";
import { duplicateObject } from "src/lib/utils/collections";
import { ExhaustiveError } from "src/lib/utils/errors";
import type { LintInspection, Linter } from "src/lib/utils/linter";
import {
  doSinglePatternCaptureMatching,
  getWikiLinks,
} from "src/lib/utils/strings";
import { findNoteTypeBy } from "../mkms";
import type { NoteType } from "../mkms";

export const contentLinter: Linter = {
  lint: ({ title, content, path }) => {
    const noteType = findNoteTypeBy({ name: title, path });
    if (!noteType) {
      return [];
    }

    return [
      ...createDisallowedLinkCard(noteType, content),
      ...createNoLinkComment(noteType, content),
      ...createV1LinkCard(noteType, content),
      ...createUnofficialMOCFormat(noteType, content),
      ...createV1DatesFormat(noteType, content),
      ...createUnresolvedInternalLink(noteType, path),
      ...createLinkEndsWithParenthesis(noteType, content),
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
const hasLinkCard = (content: string): boolean =>
  hasV1LinkCard(content) || content.includes('class="link-card-v2"');

const hasV1DatesFormat = (content: string): boolean =>
  content.includes('class="minerva-change-meta"');

const countV1LinkCard = (content: string): number =>
  doSinglePatternCaptureMatching(content, /class="link-card"/g).length;
const countV2LinkCard = (content: string): number =>
  doSinglePatternCaptureMatching(content, /class="link-card-v2"/g).length;

function createDisallowedLinkCard(
  noteType: NoteType,
  content: string,
): LintInspection[] {
  const base = {
    code: "Disallowed link card",
    message: "リンクカードは許可されていません",
  };

  const createInspections = (level: LintInspection["level"]) =>
    duplicateObject(
      { ...base, level },
      countV1LinkCard(content) + countV2LinkCard(content),
    );

  switch (noteType.name) {
    case "Glossary note":
      return createInspections("ERROR");
    case "Hub note":
      return [];
    case "Procedure note":
      return createInspections("ERROR");
    case "Activity note":
      return [];
    case "Troubleshooting note":
      return [];
    case "Prime note":
      return [];
    case "Report note":
      return [];
    case "Article note":
      return [];
    case "Daily note":
      return [];
    case "Weekly report":
      return [];
    default:
      throw new ExhaustiveError(noteType);
  }
}

function createNoLinkComment(
  noteType: NoteType,
  content: string,
): LintInspection[] {
  const base = {
    code: "No link comment",
    message: "内部リンクのリンクカードに対するリンクコメントがありません",
  };

  const createInspection = (level: LintInspection["level"]) => {
    if (!hasLinkCard(content)) {
      return [];
    }

    const linkNames = doSinglePatternCaptureMatching(
      content,
      /data-href="([^"]+)"/g,
    );
    const invalidLinkNames = linkNames.filter(
      (x) => !content.includes(`%[[${x}]]`),
    );

    return duplicateObject({ ...base, level }, invalidLinkNames.length);
  };

  switch (noteType.name) {
    case "Glossary note":
      return [];
    case "Hub note":
      return createInspection("ERROR");
    case "Procedure note":
      return [];
    case "Activity note":
      return createInspection("ERROR");
    case "Troubleshooting note":
      return createInspection("ERROR");
    case "Prime note":
      return createInspection("ERROR");
    case "Report note":
      return createInspection("ERROR");
    case "Article note":
      return createInspection("ERROR");
    case "Daily note":
      return [];
    case "Weekly report":
      return createInspection("ERROR");
    default:
      throw new ExhaustiveError(noteType);
  }
}

function createV1LinkCard(
  noteType: NoteType,
  content: string,
): LintInspection[] {
  const base = {
    code: "v1 link card",
    message: "非推奨のv1形式カードリンクがあります",
  };

  const createInspection = (level: LintInspection["level"]) =>
    duplicateObject({ ...base, level }, countV1LinkCard(content));

  switch (noteType.name) {
    case "Glossary note":
      return [];
    case "Hub note":
      return createInspection("WARN");
    case "Procedure note":
      return [];
    case "Activity note":
      return createInspection("WARN");
    case "Troubleshooting note":
      return createInspection("WARN");
    case "Prime note":
      return createInspection("WARN");
    case "Report note":
      return createInspection("WARN");
    case "Article note":
      return createInspection("WARN");
    case "Daily note":
      return [];
    case "Weekly report":
      return createInspection("WARN");
    default:
      throw new ExhaustiveError(noteType);
  }
}

function createUnofficialMOCFormat(
  noteType: NoteType,
  content: string,
): LintInspection[] {
  const base = {
    code: "Unofficial MOC format",
    message: "最新仕様に従っていないMOCがあります",
  };

  const createInspection = (level: LintInspection["level"]) => {
    if (!hasMOC(content) || hasOfficalMOCFormat(content)) {
      return [];
    }
    return [{ ...base, level }];
  };

  switch (noteType.name) {
    case "Glossary note":
      return createInspection("ERROR");
    case "Hub note":
      return [];
    case "Procedure note":
      return createInspection("ERROR");
    case "Activity note":
      return [];
    case "Troubleshooting note":
      return [];
    case "Prime note":
      return createInspection("ERROR");
    case "Report note":
      return [];
    case "Article note":
      return [];
    case "Daily note":
      return [];
    case "Weekly report":
      return [];
    default:
      throw new ExhaustiveError(noteType);
  }
}

function createV1DatesFormat(
  noteType: NoteType,
  content: string,
): LintInspection[] {
  const base = {
    code: "v1 Dates format",
    message: "ノートの作成日、最終更新日のフォーマットが古いです",
  };

  const createInspection = (level: LintInspection["level"]) =>
    hasV1DatesFormat(content) ? [{ ...base, level }] : [];

  switch (noteType.name) {
    case "Glossary note":
      return createInspection("ERROR");
    case "Hub note":
      return createInspection("ERROR");
    case "Procedure note":
      return createInspection("ERROR");
    case "Activity note":
      return createInspection("ERROR");
    case "Troubleshooting note":
      return createInspection("ERROR");
    case "Prime note":
      return createInspection("ERROR");
    case "Report note":
      return createInspection("ERROR");
    case "Article note":
      return [];
    case "Daily note":
      return [];
    case "Weekly report":
      return [];
    default:
      throw new ExhaustiveError(noteType);
  }
}

function createUnresolvedInternalLink(
  noteType: NoteType,
  path: string,
): LintInspection[] {
  const base = {
    code: "Unresolved internal link",
  };

  const createInspection = (level: LintInspection["level"]) =>
    Object.entries(getUnresolvedLinkMap(path)).map(([name]) => ({
      ...base,
      level,
      message: `[[${name}]] は未解決のリンクです`,
    }));

  switch (noteType.name) {
    case "Glossary note":
      return createInspection("INFO");
    case "Hub note":
      return createInspection("INFO");
    case "Procedure note":
      return createInspection("INFO");
    case "Activity note":
      return createInspection("INFO");
    case "Troubleshooting note":
      return createInspection("WARN");
    case "Prime note":
      return createInspection("WARN");
    case "Report note":
      return createInspection("WARN");
    case "Article note":
      return createInspection("ERROR");
    case "Daily note":
      return [];
    case "Weekly report":
      return createInspection("WARN");
    default:
      throw new ExhaustiveError(noteType);
  }
}

function createLinkEndsWithParenthesis(
  noteType: NoteType,
  content: string,
): LintInspection[] {
  const base = {
    code: "Link ends with parenthesis",
  };

  const createInspection = (level: LintInspection["level"]) =>
    getWikiLinks(content)
      .filter((x) => (x.alias ? x.alias.endsWith(")") : x.title.endsWith(")")))
      .map((x) => ({
        ...base,
        level,
        message: `括弧で終わるリンクです (${x.title})`,
      }));

  switch (noteType.name) {
    case "Glossary note":
      return createInspection("WARN");
    case "Hub note":
      return createInspection("WARN");
    case "Procedure note":
      return createInspection("WARN");
    case "Activity note":
      return createInspection("WARN");
    case "Troubleshooting note":
      return createInspection("WARN");
    case "Prime note":
      return createInspection("WARN");
    case "Report note":
      return createInspection("WARN");
    case "Article note":
      return createInspection("WARN");
    case "Daily note":
      return [];
    case "Weekly report":
      return createInspection("INFO");
    default:
      throw new ExhaustiveError(noteType);
  }
}
