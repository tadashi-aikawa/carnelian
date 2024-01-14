import { expect, test } from "bun:test";
import { JSDOM } from "jsdom";
import { getCoverUrl } from "./meta-helper";

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
  "%s",
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
