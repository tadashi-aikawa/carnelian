import { ExhaustiveError } from "src/lib/utils/errors";
import { isPresent } from "src/lib/utils/guard";
import type { LintInspection, Linter } from "src/lib/utils/linter";
import { doSinglePatternCaptureMatching } from "src/lib/utils/strings";
import { findNoteTypeBy } from "../mkms";
import type { NoteType } from "../mkms";

export const contentLinter: Linter = {
  lint: ({ title, content, path }) => {
    const noteType = findNoteTypeBy({ name: title, path });
    if (!noteType) {
      return [];
    }

    return [
      createDisallowedLinkCard(noteType, content),
      createNoLinkComment(noteType, content),
      createV1LinkCard(noteType, content),
    ].filter(isPresent);
  },
};

const hasV1LinkCard = (content: string): boolean =>
  content.includes('class="link-card"');
const hasLinkCard = (content: string): boolean =>
  hasV1LinkCard(content) || content.includes('class="link-card-v2"');

function createDisallowedLinkCard(
  noteType: NoteType,
  content: string,
): LintInspection | null {
  const base = {
    code: "Disallowed link card",
    message: "リンクカードは許可されていません",
  };

  const createInspection = (level: LintInspection["level"]) => {
    // TODO: 複数返却する場合はcreateDisallowedLinkCardの戻り値と共に実装を変更
    return hasLinkCard(content) ? { ...base, level } : null;
  };

  switch (noteType.name) {
    case "Glossary note":
      return createInspection("ERROR");
    case "Hub note":
      return null;
    case "Procedure note":
      return createInspection("ERROR");
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

function createNoLinkComment(
  noteType: NoteType,
  content: string,
): LintInspection | null {
  const base = {
    code: "No link comment",
    message: "内部リンクのリンクカードに対するリンクコメントがありません",
  };

  const createInspection = (level: LintInspection["level"]) => {
    if (!hasLinkCard(content)) {
      return null;
    }

    const linkNames = doSinglePatternCaptureMatching(
      content,
      /data-href="([^"]+)"/g,
    );
    const invalidLinkNames = linkNames.filter(
      (x) => !content.includes(`%[[${x}]]`),
    );
    // TODO: 複数返却する場合はcreateDisallowedLinkCardの戻り値と共に実装を変更
    return invalidLinkNames.length > 0 ? { ...base, level } : null;
  };

  switch (noteType.name) {
    case "Glossary note":
      return null;
    case "Hub note":
      return createInspection("ERROR");
    case "Procedure note":
      return null;
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
      return null;
    case "Weekly report":
      return createInspection("ERROR");
    default:
      throw new ExhaustiveError(noteType);
  }
}

function createV1LinkCard(
  noteType: NoteType,
  content: string,
): LintInspection | null {
  const base = {
    code: "V1 link card",
    message: "非推奨のv1形式カードリンクがあります",
  };

  const createInspection = (level: LintInspection["level"]) => {
    // TODO: 複数返却する場合はcreateV1LinkCardの戻り値と共に実装を変更
    return hasV1LinkCard(content) ? { ...base, level } : null;
  };

  switch (noteType.name) {
    case "Glossary note":
      return null;
    case "Hub note":
      return createInspection("WARN");
    case "Procedure note":
      return null;
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
      return null;
    case "Weekly report":
      return createInspection("WARN");
    default:
      throw new ExhaustiveError(noteType);
  }
}
