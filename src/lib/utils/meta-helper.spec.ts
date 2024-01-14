import { expect, test } from "bun:test";
import { JSDOM } from "jsdom";
import {
  getCharsetFromMeta,
  getCoverUrl,
  getFaviconUrl,
  getMetaByHttpEquiv,
} from "./meta-helper";

test.each([
  [
    "mockito",
    "https://site.mockito.org/",
    "https://site.mockito.org/favicon.ico",
  ],
  [
    "ESLint",
    "https://eslint.org/docs/latest/rules",
    "https://eslint.org/icon.svg",
  ],
  [
    "GitHub",
    "https://github.com/tadashi-aikawa/obsidian-another-quick-switcher",
    "https://github.githubassets.com/favicons/favicon.svg",
  ],
  [
    "voicy",
    "https://voicy.jp/channel/1380/459280",
    "https://voicy.jp/favicon.ico",
  ],
  [
    "Zenn",
    "https://zenn.dev/estra/books/obsidian-dot-zenn",
    "https://static.zenn.studio/images/logo-transparent.png",
  ],
  [
    "Qiita",
    "https://qiita.com/ugr0/items/514dcab4275aa74f3add",
    "https://cdn.qiita.com/assets/favicons/public/production-c620d3e403342b1022967ba5e3db1aaa.ico",
  ],
  [
    "Cargo",
    "https://doc.rust-lang.org/cargo/reference/publishing.html",
    "https://doc.rust-lang.org/cargo/favicon.png",
  ],
  [
    "GIGAZINE",
    "https://gigazine.net/news/20230322-windows-11-snipping-tool-vulnerability/",
    "https://gigazine.net/favicon.ico",
  ],
  [
    "Gihyo",
    "https://gihyo.jp/book/2023/978-4-297-13719-9",
    "https://gihyo.jp/GHfavicon.svg",
  ],
  [
    "ｽﾀﾃﾞｨｻﾌﾟﾘ",
    "https://blog.studysapuri.jp/entry/2018/11/14/working-out-loud",
    "https://blog.studysapuri.jp/icon/favicon",
  ],
])(
  `%s`,
  async (
    name: string,
    url: Parameters<typeof getFaviconUrl>[1],
    expected: ReturnType<typeof getFaviconUrl>,
  ) => {
    const textResponse = await (await fetch(url)).text();
    expect(getFaviconUrl(new JSDOM(textResponse).window.document, url)).toBe(
      expected,
    );
  },
);

test.each([
  ["mockito", "https://site.mockito.org/", undefined],
  [
    "ESLint",
    "https://eslint.org/docs/latest/rules",
    "https://eslint.org/og?title=Rules%20Reference&summary=A%20pluggable%20and%20configurable%20linter%20tool%20for%20identifying%20and%20reporting%20on%20patterns%20in%20JavaScript.%20Maintain%20your%20code%20quality%20with%20ease.%0A&is_rule=false&recommended=&fixable=&suggestions=",
  ],
  [
    "voicy",
    "https://voicy.jp/channel/1380/459280",
    "https://ogp-image.voicy.jp/ogp-image/story/0/1380/459280",
  ],
  [
    "Cargo",
    "https://doc.rust-lang.org/cargo/reference/publishing.html",
    undefined,
  ],
  [
    "GIGAZINE",
    "https://gigazine.net/news/20230322-windows-11-snipping-tool-vulnerability/",
    "https://i.gzn.jp/img/2023/03/22/windows-11-snipping-tool-vulnerability/00_m.jpg",
  ],
  [
    "relative path",
    "https://lukas.zapletalovi.com/posts/2022/wrapping-multiple-errors/",
    "https://lukas.zapletalovi.com/images/avatar_rh_512.jpg",
  ],
])(
  `%s`,
  async (
    name: string,
    url: Parameters<typeof getCoverUrl>[1],
    expected: ReturnType<typeof getCoverUrl>,
  ) => {
    const textResponse = await (await fetch(url)).text();
    const actual = getCoverUrl(new JSDOM(textResponse).window.document, url);
    if (expected === undefined) {
      expect(actual).toBeUndefined();
    } else {
      expect(actual).toBe(expected);
    }
  },
);

test.each([
  [
    "content-type",
    "https://gigazine.net/news/20230322-windows-11-snipping-tool-vulnerability/",
    undefined,
  ],
  [
    "content-type",
    "https://www.itmedia.co.jp/news/articles/2307/26/news116.html",
    "text/html;charset=shift_jis",
  ],
  [
    "content-type",
    "https://www.itmedia.co.jp/pcuser/spv/2310/18/news078.html",
    undefined,
  ],
])(
  `%s`,
  async (
    httpEquiv: string,
    url: Parameters<typeof getCoverUrl>[1],
    expected: ReturnType<typeof getCoverUrl>,
  ) => {
    const textResponse = await (await fetch(url)).text();
    const actual = getMetaByHttpEquiv(
      new JSDOM(textResponse).window.document,
      httpEquiv,
    );
    if (expected === undefined) {
      expect(actual).toBeUndefined();
    } else {
      expect(actual).toBe(expected);
    }
  },
);

test.each([
  [
    "https://gigazine.net/news/20230322-windows-11-snipping-tool-vulnerability/",
    "utf-8",
  ],
  ["https://www.itmedia.co.jp/news/articles/2307/26/news116.html", undefined],
  ["https://www.itmedia.co.jp/pcuser/spv/2310/18/news078.html", "shift_jis"],
])(
  `%s`,
  async (
    url: Parameters<typeof getCoverUrl>[1],
    expected: ReturnType<typeof getCoverUrl>,
  ) => {
    const textResponse = await (await fetch(url)).text();
    const actual = getCharsetFromMeta(new JSDOM(textResponse).window.document);
    if (expected === undefined) {
      expect(actual).toBeUndefined();
    } else {
      expect(actual).toBe(expected);
    }
  },
);
