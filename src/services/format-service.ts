import type { TFile } from "obsidian";
import { getActiveCursor, moveTo } from "src/lib/helpers/editors/basic";
import { replaceAllText } from "src/lib/helpers/editors/basic";
import { loadFileContentCache } from "src/lib/helpers/entries";
import { setOnExWCommandEvent } from "src/lib/helpers/events";
import type { Service } from "src/services";

/**
 * ファイルを保存にしたときに自動フォーマットするサービスです
 */
export class FormatService implements Service {
  name = "Format";
  unsetExWCommandHandler!: () => void;

  onload(): void {
    this.unsetExWCommandHandler = setOnExWCommandEvent(formatFile);
  }

  onunload(): void {
    this.unsetExWCommandHandler();
  }
}

/**
 * @param cursorLineNo カーソル行番号(1~)
 */
function formatLineBreaks(
  markdown: string,
  cursorLineNo: number,
): { markdown: string; lineOffset: number } {
  const isEmptyLine = (x: string) => x.trim() === "";

  let lineOffset = 0;
  let firstEmptyRowNo = null;
  const newLines = [];
  const lines = markdown.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const rowNo = i + 1;
    const line = lines[i];
    if (isEmptyLine(line)) {
      if (firstEmptyRowNo == null) {
        firstEmptyRowNo = rowNo;
      }
      continue;
    }

    const adjustHeaderLineBreaks = (
      lineBreaksNum: number,
      feRowNum: number,
    ) => {
      const maxOffset = cursorLineNo - feRowNum;
      newLines.push(...Array(lineBreaksNum).fill(""));
      if (maxOffset > 0) {
        lineOffset += Math.min(rowNo - feRowNum - lineBreaksNum, maxOffset);
      }
    };

    if (firstEmptyRowNo != null) {
      if (line.startsWith("# ")) {
        adjustHeaderLineBreaks(3, firstEmptyRowNo);
      } else if (line.startsWith("## ")) {
        adjustHeaderLineBreaks(2, firstEmptyRowNo);
      } else {
        adjustHeaderLineBreaks(1, firstEmptyRowNo);
      }
    }

    newLines.push(line);
    firstEmptyRowNo = null;
  }

  return { markdown: newLines.join("\n"), lineOffset };
}

export async function formatFile(file: TFile) {
  const content = await loadFileContentCache(file.path);
  if (!content) {
    return;
  }

  const cursor = getActiveCursor();
  if (!cursor) {
    return;
  }

  const { markdown, lineOffset } = formatLineBreaks(content, cursor.lineNo);
  replaceAllText(markdown);
  moveTo(cursor.lineNo - lineOffset, cursor.ch);
}
