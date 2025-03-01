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

/**
 * @param cursorLineNo カーソル行番号(1~)
 */
export function* formatLineBreaks(markdown: string): Iterable<TextReplacement> {
  let firstEmptyI = null;
  const lines = markdown.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (isEmptyLine(line)) {
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
      text: line.startsWith("# ") ? "\n\n" : line.startsWith("## ") ? "\n" : "",
    };
    firstEmptyI = null;
  }
}
