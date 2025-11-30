import { expect, test } from "bun:test";
import {
  parseMarkdownList,
  parseTags,
  stripCodeAndHtmlBlocks,
  stripDecoration,
  stripLinks,
} from "./parser";

test.each([
  ["", { prefix: "", content: "" }],
  ["hoge", { prefix: "", content: "hoge" }],
  ["- ", { prefix: "- ", content: "" }],
  ["- hoge", { prefix: "- ", content: "hoge" }],
  ["- [ ] hoge", { prefix: "- [ ] ", content: "hoge" }],
  ["- [x] hoge", { prefix: "- [x] ", content: "hoge" }],
  ["  hoge", { prefix: "  ", content: "hoge" }],
  ["  - ", { prefix: "  - ", content: "" }],
  ["  - hoge", { prefix: "  - ", content: "hoge" }],
  ["  - [ ] hoge", { prefix: "  - [ ] ", content: "hoge" }],
  ["  - [x] hoge", { prefix: "  - [x] ", content: "hoge" }],
  ["* ", { prefix: "* ", content: "" }],
  ["* hoge", { prefix: "* ", content: "hoge" }],
  ["* [ ] hoge", { prefix: "* [ ] ", content: "hoge" }],
  ["* [x] hoge", { prefix: "* [x] ", content: "hoge" }],
  ["\t- ", { prefix: "\t- ", content: "" }],
  ["\t- hoge", { prefix: "\t- ", content: "hoge" }],
  ["\t- [ ] hoge", { prefix: "\t- [ ] ", content: "hoge" }],
  ["\t- [x] hoge", { prefix: "\t- [x] ", content: "hoge" }],
  ["\t\t- ", { prefix: "\t\t- ", content: "" }],
  ["\t\t- hoge", { prefix: "\t\t- ", content: "hoge" }],
  ["\t\t- [ ] hoge", { prefix: "\t\t- [ ] ", content: "hoge" }],
  ["\t\t- [x] hoge", { prefix: "\t\t- [x] ", content: "hoge" }],
  ["　- ", { prefix: "　- ", content: "" }],
  ["　- hoge", { prefix: "　- ", content: "hoge" }],
  ["　- [ ] hoge", { prefix: "　- [ ] ", content: "hoge" }],
  ["　- [x] hoge", { prefix: "　- [x] ", content: "hoge" }],
  ["　　- ", { prefix: "　　- ", content: "" }],
  ["　　- hoge", { prefix: "　　- ", content: "hoge" }],
  ["　　- [ ] hoge", { prefix: "　　- [ ] ", content: "hoge" }],
  ["　　- [x] hoge", { prefix: "　　- [x] ", content: "hoge" }],
])(
  `parseMarkdownList("%s")`,
  (text: string, expected: ReturnType<typeof parseMarkdownList>) => {
    expect(parseMarkdownList(text)).toEqual(expected);
  },
);

test.each([
  ["#hoge", ["hoge"]],
  [" #hoge", ["hoge"]],
  ["#hoge ", ["hoge"]],
  [" #hoge ", ["hoge"]],
  ["  #hoge  ", ["hoge"]],
  ["#hoge #hoga", ["hoge", "hoga"]],
  ["hoge #hoga fuga", ["hoga"]],
  ["#hoge hoga #fuga", ["hoge", "fuga"]],
])(
  `parseTags("%s")`,
  (text: string, expected: ReturnType<typeof parseTags>) => {
    expect(parseTags(text)).toEqual(expected);
  },
);

test.each([
  // bold
  ["**a**", "a"],
  ["a **a** a", "a a a"],
  ["**a** **a**", "a a"],
  ["**abc** **efg**", "abc efg"],
  ["**aaa\nbbb**", "**aaa\nbbb**"],

  ["__a__", "a"],
  ["a __a__ a", "a a a"],
  ["__a__ __a__", "a a"],
  ["__abc__ __efg__", "abc efg"],
  ["__abc\nefg__", "__abc\nefg__"],

  // italic
  ["*a*", "a"],
  ["a *a* a", "a a a"],
  ["* a\n* b", "* a\n* b"],

  ["_a_", "a"],
  ["a _a_ a", "a a a"],
  ["a_b\nc_d", "a_b\nc_d"],

  // bold and italic
  ["**abc *d* efg**", "abc d efg"],
  ["__abc _d_ efg__", "abc d efg"],

  // strikethrough
  ["~~a~~", "a"],
  ["~~a\n~~b", "~~a\n~~b"],

  // highlight
  ["==a==", "a"],
  ["== a\nb ==", "== a\nb =="],

  // mixed
  ["a **b** ~~c~~ ==d== e", "a b c d e"],
])(
  `stripDecoration("%s")`,
  (text: string, expected: ReturnType<typeof stripDecoration>) => {
    expect(stripDecoration(text)).toEqual(expected);
  },
);

test.each([
  // link
  ["[text](link)", "text"],
  ["[text](link) [text2](link2)", "text text2"],
  ["[text]", "text"],
  ["[text] [text2]", "text text2"],

  // wiki link
  ["[[text]]", "text"],
  ["[[text]] [[text2]]", "text text2"],
  ["[[text|alias]]", "alias"],
  ["[[text|alias]] [[text2|alias2]]", "alias alias2"],

  // mixed
  ["[e](link) [[f]] [g] [[h|H!]]", "e f g H!"],

  // checkbox
  ["- [ ] hoge", "- [ ] hoge"],
  ["- [ ] [hoge](fuga)", "- [ ] hoge"],
  ["- [ ] [[hoge]]", "- [ ] hoge"],
  ["- [x] hoge", "- [x] hoge"],
  ["- [x] [hoge](fuga)", "- [x] hoge"],
  ["- [x] [[hoge]]", "- [x] hoge"],
])(
  `stripLinks("%s")`,
  (text: string, expected: ReturnType<typeof stripLinks>) => {
    expect(stripLinks(text)).toEqual(expected);
  },
);

test.each([
  [
    ["text", "```", "code", "```", "text2"].join("\n"),
    ["text", "text2"].join("\n"),
  ],
  [
    ["text", "~~~ts", "code", "~~~", "text2"].join("\n"),
    ["text", "text2"].join("\n"),
  ],
  [
    ["text", "<pre><code>abc</code></pre>", "text2"].join("\n"),
    ["text", "", "text2"].join("\n"),
  ],
  [
    ["text", "<code>abc</code>", "text2"].join("\n"),
    ["text", "", "text2"].join("\n"),
  ],
  [
    ["text", "```", "code", "```", "", "```", "more code", "```", "text2"].join(
      "\n",
    ),
    ["text", "", "text2"].join("\n"),
  ],
  ["text `abc` text2", "text  text2"],
  [
    ["text", "<div>==a==</div>", "text2"].join("\n"),
    ["text", "", "text2"].join("\n"),
  ],
  [
    'text <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA=="> text2',
    "text  text2",
  ],
  [["> ```", "> const a = 1;", "> ```", "text"].join("\n"), "text"],
  [["> <div>==a==</div>", "text"].join("\n"), ["> ", "text"].join("\n")],
])(
  `stripCodeAndHtmlBlocks("%s")`,
  (text: string, expected: ReturnType<typeof stripCodeAndHtmlBlocks>) => {
    expect(stripCodeAndHtmlBlocks(text)).toEqual(expected);
  },
);
