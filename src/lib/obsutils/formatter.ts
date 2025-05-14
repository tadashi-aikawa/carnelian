interface Position {
  line: number;
  ch: number;
}

interface TextReplacement {
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

    // コードブロック以外の空行はformat対象になる
    if (isEmptyLine(line) && !inCodeBlock) {
      if (firstEmptyI == null) {
        firstEmptyI = i;
      }
      continue;
    }

    if (firstEmptyI == null) {
      continue;
    }

    yield {
      from: { line: firstEmptyI, ch: 0 },
      to: { line: i - 1, ch: 0 },
      text: toText(line),
    };

    firstEmptyI = null;
  }
}
