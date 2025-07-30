import { expect, test } from "bun:test";
import { type TextReplacement, formatLineBreaks } from "./formatter";

test.each([
  // 基本的な空行の削除・整理
  [
    "line1\n\n\nline2",
    [{ from: { line: 1, ch: 0 }, to: { line: 2, ch: 0 }, text: "" }],
  ],
  [
    "line1\n\n\n\nline2",
    [{ from: { line: 1, ch: 0 }, to: { line: 3, ch: 0 }, text: "" }],
  ],

  // 見出し前の空行整理
  [
    "text\n\n# Heading",
    [{ from: { line: 1, ch: 0 }, to: { line: 1, ch: 0 }, text: "\n\n" }],
  ],
  [
    "text\n\n\n# Heading",
    [{ from: { line: 1, ch: 0 }, to: { line: 2, ch: 0 }, text: "\n\n" }],
  ],
  [
    "text\n\n## SubHeading",
    [{ from: { line: 1, ch: 0 }, to: { line: 1, ch: 0 }, text: "\n" }],
  ],
  [
    "text\n\n\n## SubHeading",
    [{ from: { line: 1, ch: 0 }, to: { line: 2, ch: 0 }, text: "\n" }],
  ],

  // 空のマークダウン
  ["", []],

  // 空行がない場合
  ["line1\nline2\nline3", []],

  // 末尾の空行は処理されない
  ["line1\n\n", []],
])(
  `formatLineBreaks("%s")`,
  (markdown: string, expected: TextReplacement[]) => {
    expect(Array.from(formatLineBreaks(markdown))).toEqual(expected);
  },
);

// コードブロック内の空行は処理されない
test.each([
  ["```\ncode\n\n\nmore code\n```", []],
  ["```js\nconst a = 1;\n\n\nconst b = 2;\n```", []],
  [
    "text\n\n```\ncode\n\n\nmore code\n```\n\ntext2",
    [
      { from: { line: 1, ch: 0 }, to: { line: 1, ch: 0 }, text: "" },
      { from: { line: 8, ch: 0 }, to: { line: 8, ch: 0 }, text: "" },
    ],
  ],
  [
    "text\n\n```\ncode\n```\n\n# Heading",
    [
      { from: { line: 1, ch: 0 }, to: { line: 1, ch: 0 }, text: "" },
      { from: { line: 5, ch: 0 }, to: { line: 5, ch: 0 }, text: "\n\n" },
    ],
  ],
])(
  `formatLineBreaks with code blocks("%s")`,
  (markdown: string, expected: TextReplacement[]) => {
    expect(Array.from(formatLineBreaks(markdown))).toEqual(expected);
  },
);

// 見出し処理の詳細テスト
test.each([
  // H1見出し前は2つの改行が挿入される
  ["text\n# Heading", []],
  [
    "text\n\n# Heading",
    [{ from: { line: 1, ch: 0 }, to: { line: 1, ch: 0 }, text: "\n\n" }],
  ],
  [
    "text\n\n\n\n# Heading",
    [{ from: { line: 1, ch: 0 }, to: { line: 3, ch: 0 }, text: "\n\n" }],
  ],

  // H2見出し前は1つの改行が挿入される
  ["text\n## SubHeading", []],
  [
    "text\n\n## SubHeading",
    [{ from: { line: 1, ch: 0 }, to: { line: 1, ch: 0 }, text: "\n" }],
  ],
  [
    "text\n\n\n\n## SubHeading",
    [{ from: { line: 1, ch: 0 }, to: { line: 3, ch: 0 }, text: "\n" }],
  ],

  // H1とH2の組み合わせ
  [
    "text\n\n# Heading1\n\n## Heading2",
    [{ from: { line: 1, ch: 0 }, to: { line: 1, ch: 0 }, text: "\n\n" }],
  ],

  // H3以降は通常の空行処理
  [
    "text\n\n\n### Heading3",
    [{ from: { line: 1, ch: 0 }, to: { line: 2, ch: 0 }, text: "" }],
  ],

  // 先頭の見出しは処理されない（但し見出し直後の空行チェックは実行される）
  [
    "# Heading\ntext",
    [{ from: { line: 1, ch: 0 }, to: { line: 1, ch: 0 }, text: "\n" }],
  ],
  [
    "## Heading\ntext",
    [{ from: { line: 1, ch: 0 }, to: { line: 1, ch: 0 }, text: "\n" }],
  ],
  [
    "### Heading\ntext",
    [{ from: { line: 1, ch: 0 }, to: { line: 1, ch: 0 }, text: "\n" }],
  ],
  [
    "#### Heading\ntext",
    [{ from: { line: 1, ch: 0 }, to: { line: 1, ch: 0 }, text: "\n" }],
  ],
  [
    "##### Heading\ntext",
    [{ from: { line: 1, ch: 0 }, to: { line: 1, ch: 0 }, text: "\n" }],
  ],
  [
    "###### Heading\ntext",
    [{ from: { line: 1, ch: 0 }, to: { line: 1, ch: 0 }, text: "\n" }],
  ],

  // 見出し直後に空行がない場合の処理
  [
    "text\n# Heading\ntext",
    [{ from: { line: 2, ch: 0 }, to: { line: 2, ch: 0 }, text: "\n" }],
  ],
  [
    "text\n## SubHeading\ntext",
    [{ from: { line: 2, ch: 0 }, to: { line: 2, ch: 0 }, text: "\n" }],
  ],
  [
    "text\n### Heading3\ntext",
    [{ from: { line: 2, ch: 0 }, to: { line: 2, ch: 0 }, text: "\n" }],
  ],
  [
    "text\n#### Heading4\ntext",
    [{ from: { line: 2, ch: 0 }, to: { line: 2, ch: 0 }, text: "\n" }],
  ],
  [
    "text\n##### Heading5\ntext",
    [{ from: { line: 2, ch: 0 }, to: { line: 2, ch: 0 }, text: "\n" }],
  ],
  [
    "text\n###### Heading6\ntext",
    [{ from: { line: 2, ch: 0 }, to: { line: 2, ch: 0 }, text: "\n" }],
  ],

  // 見出し直後に既に空行がある場合は処理しない
  ["# Heading\n\ntext", []],
  ["## SubHeading\n\ntext", []],
  ["### Heading3\n\ntext", []],
  ["#### Heading4\n\ntext", []],
  ["##### Heading5\n\ntext", []],
  ["###### Heading6\n\ntext", []],
])(
  `formatLineBreaks with headings("%s")`,
  (markdown: string, expected: TextReplacement[]) => {
    expect(Array.from(formatLineBreaks(markdown))).toEqual(expected);
  },
);

// エッジケースのテスト
test.each([
  // 複数のコードブロック
  [
    "```\ncode1\n```\n\n\n```\ncode2\n```",
    [{ from: { line: 3, ch: 0 }, to: { line: 4, ch: 0 }, text: "" }],
  ],

  // ネストしたコードブロック（実際にはマークダウンでは無効だが、コードとして扱われる）
  ["```\ncode\n```\nmore code\n```\n```", []],

  // 複雑な組み合わせ
  [
    "text\n\n\n```\ncode\n\n\nmore code\n```\n\n\n# Heading\n\ntext\n\n\n## SubHeading",
    [
      { from: { line: 1, ch: 0 }, to: { line: 2, ch: 0 }, text: "" },
      { from: { line: 9, ch: 0 }, to: { line: 10, ch: 0 }, text: "\n\n" },
      { from: { line: 14, ch: 0 }, to: { line: 15, ch: 0 }, text: "\n" },
    ],
  ],

  // 空白のみの行
  [
    "text\n \n  \n\t\ntext2",
    [{ from: { line: 1, ch: 0 }, to: { line: 3, ch: 0 }, text: "" }],
  ],

  // 改行のみのマークダウン
  ["\n\n\n", []],

  // 単一行
  ["single line", []],

  // 複数の見出しが連続
  [
    "# Heading1\n\n\n## Heading2\n\n\n### Heading3",
    [
      { from: { line: 1, ch: 0 }, to: { line: 2, ch: 0 }, text: "" },
      { from: { line: 4, ch: 0 }, to: { line: 5, ch: 0 }, text: "" },
    ],
  ],
])(
  `formatLineBreaks edge cases("%s")`,
  (markdown: string, expected: TextReplacement[]) => {
    expect(Array.from(formatLineBreaks(markdown))).toEqual(expected);
  },
);
