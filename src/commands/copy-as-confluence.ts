import { getSelectionText } from "src/lib/helpers/editors/basic";
import { getActiveFileContent } from "src/lib/helpers/entries";
import { linkText2Path } from "src/lib/helpers/links";
import { getActiveFileCache } from "src/lib/helpers/metadata";
import { getPropertiesByPath } from "src/lib/helpers/properties";
import { copyToClipboard, notify } from "src/lib/helpers/ui";
import { sorter } from "src/lib/utils/collections";
import { getWikiLinks, replaceAt } from "src/lib/utils/strings";
import { PluginSettings } from "src/settings";

type Link = ReturnType<typeof getWikiLinks>[number];

function getReplacedText(link: Link, confluenceDomain: string): string {
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

  if (new URL(url).hostname !== confluenceDomain) {
    return `[${link.title}](${url})`;
  }

  return ` ${url} `;
}

/**
 * Confluenceに貼り付ける形式でクリップボードにコピーします
 */
export async function copyAsConfluence(settings: PluginSettings) {
  let target = getSelectionText();
  if (!target) {
    const startOffset =
      getActiveFileCache()!.frontmatterPosition?.end.offset ?? 0;
    target = getActiveFileContent()!.slice(startOffset);
  }

  const links = getWikiLinks(target).sort(sorter((x) => x.range.start, "desc"));

  let text = target;
  for (const link of links) {
    text = replaceAt(
      text,
      link.range,
      getReplacedText(link, settings.confluenceDomain),
    );
  }

  copyToClipboard(text);

  notify("📋 Confluenceに貼り付け可能な形式でコピーしました", 5000);
}
