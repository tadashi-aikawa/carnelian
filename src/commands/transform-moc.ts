import { getActiveParagraph } from "src/lib/helpers/editors/advanced";
import { setLinesInRange } from "src/lib/helpers/editors/basic";
import { match } from "src/lib/utils/strings";

/**
 * MOCを新しい形式に変換します
 */
export async function transformMOC() {
  const p = getActiveParagraph();
  if (!p) {
    return;
  }

  const lines = {
    related: [] as string[],
    activity: [] as string[],
    troubleshooting: [] as string[],
  };

  const targetLines = p.text.split("\n").filter((x) => !match(x, /^[-*] .+/g));
  for (const line of targetLines) {
    match;
    if (match(line, /^\s+[-*] \[\[📜.+$/u)) {
      lines.activity.push(line);
    } else if (match(line, /^\s+[-*] \[\[📝.+$/u)) {
      lines.troubleshooting.push(line);
    } else {
      lines.related.push(line);
    }
  }

  const text = `
- 📒**関連**${_toString(lines.related)}
- 📜**アクティビティ**${_toString(lines.activity)}
- 📝**トラブルシューティング**${_toString(lines.troubleshooting)}
`.trim();

  setLinesInRange(p.startLine, p.endLine, text);
}

function _toString(lines: string[]): string {
  return lines.length === 0
    ? ""
    : `
${lines.join("\n")}`;
}
