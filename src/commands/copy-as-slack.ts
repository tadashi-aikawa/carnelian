import { getSelectionText } from "src/lib/helpers/editors/basic";
import { getActiveFileContent } from "src/lib/helpers/entries";
import { linkText2Path } from "src/lib/helpers/links";
import { getActiveFileCache } from "src/lib/helpers/metadata";
import { getPropertiesByPath } from "src/lib/helpers/properties";
import { copyToClipboard, notify } from "src/lib/helpers/ui";
import { sorter } from "src/lib/utils/collections";
import {
  getWikiLinks,
  replaceAt,
  replaceWithRegExpMapping,
  replaceWithStringMapping,
} from "src/lib/utils/strings";
import type { PluginSettings } from "src/settings";

type Link = ReturnType<typeof getWikiLinks>[number];

/**
 * リンクのテキストをSlack形式に変換します
 */
function toSlackLink(link: Link): string {
  const path = linkText2Path(link.title);
  if (!path) {
    return link.alias ?? link.title;
  }

  const url = getPropertiesByPath(path)?.url;
  if (!url) {
    return link.alias ?? link.title;
  }

  if (link.alias) {
    return `[${link.alias}](${url})`;
  }

  return `[${link.title}](${url})`;
}

/**
 * Slackに貼り付ける形式でクリップボードにコピーします
 */
export async function copyAsSlack(settings: PluginSettings) {
  const replaceMapping = settings.slack?.copy.replaceMapping ?? {};
  let target = getSelectionText();
  if (!target) {
    const startOffset =
      getActiveFileCache()!.frontmatterPosition?.end.offset ?? 0;
    target = getActiveFileContent()!.slice(startOffset);
  }

  const links = getWikiLinks(target).sort(sorter((x) => x.range.start, "desc"));

  let text = target;
  for (const link of links) {
    text = replaceAt(text, link.range, toSlackLink(link));
  }
  text = text
    .split("\n")
    .map((x) => replaceWithRegExpMapping(x, replaceMapping))
    .map((x) => replaceWithStringMapping(x, { "**": "*", __: "_", "~~": "~" }))
    .join("\n");

  copyToClipboard(text);

  notify("📋 Slackに貼り付け可能な形式でコピーしました", 5000);
}
