import { requestUrl } from "obsidian";
import {
  getCharsetFromMeta,
  getMetaByHttpEquiv,
  getMetaByProperty,
  getMetaByName,
  getFaviconUrl,
  getCoverUrl,
} from "../utils/meta-helper";
import { defineUserAgent } from "../utils/agent";
import { forceLowerCaseKeys } from "../utils/collections";
import { sjis2String } from "../utils/strings";

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

async function getTwitterMeta(
  url: string,
  type: "X" | "Twitter"
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
      url.startsWith("https://x.com") ? "X" : "Twitter"
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
  let html = new DOMParser().parseFromString(res.text, "text/html");

  const metaContentType = getCharsetFromMeta(html)?.toLowerCase();
  const httpEquivContentType = getMetaByHttpEquiv(
    html,
    "content-type"
  )?.toLowerCase();
  if (
    metaContentType?.includes("shift_jis") ||
    httpEquivContentType?.includes("shift_jis")
  ) {
    // HTMLのmetaデータにshift_jisと明記されている場合はbodyを作り直す
    html = new DOMParser().parseFromString(
      sjis2String(res.arrayBuffer),
      "text/html"
    );
  }

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
 * HTMLメタ情報からサイトのカードを生成します
 * 作成に失敗した場合は例外をthrowします
 * タイトルの長さに応じて説明の長さを変更します
 */
export function createHTMLCard(meta: HTMLMeta): string {
  const isSecure = (url: string | undefined) =>
    url && !url.startsWith("http://");

  // TODO: internalに対応したときは分岐処理が入る予定
  const siteName = meta.siteName;
  const title = meta.title;
  const faviconUrl = meta.faviconUrl;
  const imageUrl = meta.coverUrl;

  const descriptionMaxLength = 200 - title.length * 2;
  const description = meta.description?.slice(0, descriptionMaxLength);
  const descriptionDom = description
    ? `<p class="link-card-description">${description}</p>`
    : "";

  const imageDom = isSecure(imageUrl)
    ? `<img src="${imageUrl}" class="link-card-image" />`
    : "";
  const linkDom = `<a href="${meta.originUrl}"></a>`;

  return `<div class="link-card">
	<div class="link-card-header">
		<img src="${faviconUrl}" class="link-card-site-icon"/>
		<span class="link-card-site-name">${siteName}</span>
	</div>
	<div class="link-card-body">
		<div class="link-card-content">
      <p class="link-card-title">${title}</p>
      ${descriptionDom}  
		</div>
		${imageDom}
	</div>
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
