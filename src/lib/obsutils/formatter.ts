import { isHeading } from "../utils/strings";

export interface Position {
  line: number;
  ch: number;
}

export interface TextReplacement {
  from: Position;
  to: Position;
  text: string;
}

const isEmptyLine = (x: string) => x.trim() === "";

function toText(line: string): string {
  if (line.startsWith("# ")) {
    return "\n\n";
  }
  if (line.startsWith("## ")) {
    return "\n";
  }
  return "";
}

/**
 * @param cursorLineNo カーソル行番号(1~)
 */
export function* formatLineBreaks(markdown: string): Iterable<TextReplacement> {
  let firstEmptyI = null;
  let inCodeBlock = false;
  const lines = markdown.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
    }

    // 見出し直後の空行チェック（見出し直前に空行があるかどうかに関係なく実行）
    if (!inCodeBlock && isHeading(line)) {
      const nextLineIndex = i + 1;
      // 次の行が存在し、かつ空行でない場合に空行を挿入
      if (nextLineIndex < lines.length && !isEmptyLine(lines[nextLineIndex])) {
        yield {
          from: { line: nextLineIndex, ch: 0 },
          to: { line: nextLineIndex, ch: 0 },
          text: "\n",
        };
      }
    }

    if (isEmptyLine(line) && !inCodeBlock) {
      if (i === lines.length - 1) {
        // 最終行の場合は次行で処理を実行するというシミュレーションで最後の改行を処理
        i++;
      } else {
        if (firstEmptyI == null) {
          firstEmptyI = i;
        }
        continue;
      }
    }

    // 空行の後の処理
    if (firstEmptyI != null) {
      // 見出し直後の空行の場合、1つの空行のみ保持
      const prevLineIndex = firstEmptyI - 1;
      const isAfterHeading =
        prevLineIndex >= 0 && !inCodeBlock && isHeading(lines[prevLineIndex]);

      if (isAfterHeading) {
        // 見出し直後の複数空行は1つに統一
        const emptyLineCount = i - firstEmptyI;
        if (emptyLineCount > 1) {
          yield {
            from: { line: firstEmptyI, ch: 0 },
            to: { line: i - 1, ch: 0 },
            text: "",
          };
        }
      } else {
        // 通常の空行処理
        yield {
          from: { line: firstEmptyI, ch: 0 },
          to: { line: i - 1, ch: 0 },
          text: toText(line),
        };
      }

      firstEmptyI = null;
    }
  }
}
