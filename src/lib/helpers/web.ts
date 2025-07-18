import { type TFile, requestUrl } from "obsidian";
import { stripDecoration, stripLinks } from "../obsutils/parser";
import { defineUserAgent } from "../utils/agent";
import { forceLowerCaseKeys } from "../utils/collections";
import { map } from "../utils/guard";
import {
  getCharsetFromMeta,
  getCoverUrl,
  getFaviconUrl,
  getMetaByHttpEquiv,
  getMetaByName,
  getMetaByProperty,
} from "../utils/meta-helper";
import { countCharsWidth, eucJp2String, sjis2String } from "../utils/strings";
import { path2LinkText } from "./links";
import { useObsidianPublishInfo } from "./plugins";
import { getPropertiesByPath } from "./properties";

export type Meta = HTMLMeta | ImageMeta | TwitterMeta;
export interface HTMLMeta {
  type: "html";
  siteName: string;
  title: string;
  description?: string;
  faviconUrl: string;
  coverUrl?: string;
  originUrl: string;
}
export interface ImageMeta {
  type: "image";
  data: Blob;
  originUrl: string;
}
export interface TwitterMeta {
  type: "twitter";
  url: string;
  author_name: string;
  html: string;
}

export const isYoutubeUrl = (url: string): boolean =>
  url.startsWith("https://www.youtube.com") ||
  url.startsWith("https://youtu.be/") ||
  url.startsWith("https://youtube.com");

async function getTwitterMeta(
  url: string,
  type: "X" | "Twitter",
): Promise<TwitterMeta | null> {
  const twitterEmbedUrl = `https://publish.${
    type === "X" ? "x" : "twitter"
  }.com/oembed?hide_media=true&hide_thread=true&omit_script=true&lang=ja&url=${url}`;
  const res = await requestUrl({
    url: twitterEmbedUrl,
    headers: { "User-Agent": defineUserAgent(twitterEmbedUrl) },
  });
  if (res.status >= 400) {
    console.debug(`twitter embed status is ${res.status}`);
    return null;
  }

  return res.json;
}

function htmlString2Document(
  htmlString: string,
  htmlBuffer: ArrayBuffer,
): Document {
  let html = new DOMParser().parseFromString(htmlString, "text/html");

  const metaContentType = getCharsetFromMeta(html);
  const httpEquivContentType = getMetaByHttpEquiv(html, "content-type");

  const normalize = (s: string | undefined) =>
    s?.toLowerCase()?.replaceAll(/[-_]/g, "");
  const infer = (encoding: "shiftjis" | "eucjp" | "utf8"): boolean =>
    normalize(metaContentType)?.includes(encoding) ??
    normalize(httpEquivContentType?.content)?.includes(encoding) ??
    false;

  if (infer("shiftjis")) {
    // HTMLのmetaデータにshift_jisと明記されている場合はbodyを作り直す
    html = new DOMParser().parseFromString(
      sjis2String(htmlBuffer),
      "text/html",
    );
  } else if (infer("eucjp")) {
    // HTMLのmetaデータにeuc_jpと明記されている場合はbodyを作り直す
    html = new DOMParser().parseFromString(
      eucJp2String(htmlBuffer),
      "text/html",
    );
  }

  return html;
}

/**
 * サイトのメタデータを取得します
 */
export async function createMeta(url: string): Promise<Meta | null> {
  if (
    url.startsWith("https://twitter.com") ||
    url.startsWith("https://x.com")
  ) {
    const res = await getTwitterMeta(
      url,
      url.startsWith("https://x.com") ? "X" : "Twitter",
    );
    if (!res) {
      return null;
    }

    return {
      type: "twitter",
      url,
      author_name: res.author_name,
      html: res.html,
    };
  }

  const res = await requestUrl({
    url,
    headers: { "User-Agent": defineUserAgent(url) },
  });
  if (res.status >= 400) {
    console.debug(`status is ${res.status}`);
    return null;
  }

  const headers = forceLowerCaseKeys(res.headers);
  const contentType = headers["content-type"] as string;
  if (contentType.startsWith("image/")) {
    return {
      type: "image",
      data: new Blob([res.arrayBuffer], { type: contentType }),
      originUrl: url,
    };
  }

  if (!contentType.startsWith("text/html")) {
    console.debug(`content-type is ${contentType}`);
    return null;
  }

  const html = htmlString2Document(res.text, res.arrayBuffer);

  const siteName = getMetaByProperty(html, "og:site_name") ?? new URL(url).host;
  const title =
    getMetaByProperty(html, "og:title") ??
    getMetaByProperty(html, "title") ??
    html.querySelector("title")?.text ??
    url;
  const description =
    getMetaByProperty(html, "og:description") ??
    getMetaByProperty(html, "description") ??
    getMetaByName(html, "description");
  const faviconUrl = getFaviconUrl(html, url);
  const coverUrl = getCoverUrl(html, url);

  return {
    type: "html",
    siteName,
    title,
    description,
    faviconUrl,
    coverUrl,
    originUrl: url,
  };
}

/**
 * description DOMの文字列を生成します
 * WARN: このメソッドはObsidian MobileのiPhone/iPadでは動作しない可能性があります
 */
function createDescriptionDOM(meta: HTMLMeta): string {
  if (!meta.description) {
    return "";
  }

  // 1byte文字で何文字にするか上限を決める
  const descriptionMaxWidth = 112;
  const description = stripLinks(
    stripDecoration(meta.description?.replaceAll("\n", "")),
  );

  // 上限を考慮した最終的に表示する文言
  // TODO: 2byte文字をちゃんと考慮するようにしたい
  let displayDescription = "";
  if (description != null) {
    // TODO: Blueskyとの分岐はmetaデータ作成時に制御したい
    if (
      countCharsWidth(description) <= descriptionMaxWidth ||
      meta.originUrl.startsWith("https://bsky.app")
    ) {
      displayDescription = description;
    } else {
      displayDescription = `${description?.slice(0, descriptionMaxWidth)} ... `;
    }
  }

  return displayDescription
    ? `  <div class="link-card-v2-content">
    ${displayDescription}
  </div>`
    : "";
}

/**
 * HTMLメタ情報からサイトのカードを生成します
 * 作成に失敗した場合は例外をthrowします
 * タイトルの長さに応じて説明の長さを変更します
 */
export function createHTMLCard(meta: HTMLMeta): string {
  const isSecure = (url: string | undefined) =>
    url && !url.startsWith("http://");

  const siteName = meta.siteName;
  const title = meta.title;
  const faviconUrl = meta.faviconUrl;
  const imageUrl = meta.coverUrl;

  const descriptionDom = createDescriptionDOM(meta);

  const imageDom = isSecure(imageUrl)
    ? `<img class="link-card-v2-image" src="${imageUrl}" />`
    : "";
  const linkDom = `<a href="${meta.originUrl}"></a>`;

  return `<div class="link-card-v2">
  <div class="link-card-v2-site">
    <img class="link-card-v2-site-icon" src="${faviconUrl}" />
    <span class="link-card-v2-site-name">${siteName}</span>
  </div>
  <div class="link-card-v2-title">
    ${title}
  </div>
  ${descriptionDom}
  ${imageDom}
  ${linkDom}
</div>`;
}

/**
 * Vaultのノートに対するカードを作成します。
 * 作成に失敗した場合は例外をthrowします
 */
export async function createNoteCard(
  file: TFile,
  args: { defaultImageUrl: string; faviconUrl: string; siteName?: string },
): Promise<string> {
  const { domain, getResourceUrl } = await useObsidianPublishInfo();

  const description = getPropertiesByPath(file.path)?.description ?? "TODO";
  const descriptionDom = `<div class="link-card-v2-content">${description}</div>`;

  const imageUrl =
    map(getPropertiesByPath(file.path)?.cover, getResourceUrl) ??
    args.defaultImageUrl;
  const imageDom = `<img class="link-card-v2-image" src="${imageUrl}" />`;

  const dataHref = path2LinkText(file.path)?.slice(2).slice(0, -2) ?? file.path;
  const linkDom = `<a data-href="${dataHref}" class="internal-link"></a>`;

  return `<div class="link-card-v2">
  <div class="link-card-v2-site">
    <img class="link-card-v2-site-icon" src="${args.faviconUrl}" />
    <span class="link-card-v2-site-name">${args.siteName ?? domain}</span>
  </div>
  <div class="link-card-v2-title">
    ${file.basename}
  </div>
  ${descriptionDom}
  ${imageDom}
  ${linkDom}
</div>`;
}

/**
 * サイトのカードを生成します
 * 作成に失敗した場合は例外をthrowします
 *
 * TODO: internalにも対応したい
 * XXX: 今はtype = htmlに限定する (imgとtwitterは今後検討)
 */
export async function createCard(url: string): Promise<string> {
  const meta = await createMeta(url);
  if (!meta) {
    throw new Error("メタデータの取得に失敗しました");
  }
  if (meta.type !== "html") {
    throw new Error("HTML以外のメタデータ取得には対応していません");
  }

  return createHTMLCard(meta);
}
