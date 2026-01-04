import { insertToCursor } from "src/lib/helpers/editors/basic";
import { getClipboardText, notifyValidationError } from "src/lib/helpers/ui";
import { doSinglePatternCaptureMatching } from "src/lib/utils/strings";

const embedUriPattern = /data-bluesky-uri="at:\/\/([^"]+)"/g;
const embedUriPatternSingle = /data-bluesky-uri='at:\/\/([^']+)'/g;
const colorModePattern = /data-bluesky-embed-color-mode="([^"]+)"/g;
const colorModePatternSingle = /data-bluesky-embed-color-mode='([^']+)'/g;

/**
 * クリップボードの埋め込みスクリプトからBlueskyの埋め込みHTMLを挿入します
 */
export async function pasteBlueskyEmbed() {
  const script = await getClipboardText({ trim: true });
  if (!script) {
    return;
  }

  const embedUri = extractEmbedUri(script);
  if (!embedUri) {
    return notifyValidationError(
      "クリップボードからBlueskyの埋め込みURIを取得できません",
    );
  }

  const colorMode = extractColorMode(script) ?? "system";
  const html = createEmbedHtml(embedUri, colorMode);
  insertToCursor(`\n${html}`);
}

function extractEmbedUri(script: string): string | null {
  return (
    doSinglePatternCaptureMatching(script, embedUriPattern).at(0) ??
    doSinglePatternCaptureMatching(script, embedUriPatternSingle).at(0) ??
    null
  );
}

function extractColorMode(script: string): string | null {
  return (
    doSinglePatternCaptureMatching(script, colorModePattern).at(0) ??
    doSinglePatternCaptureMatching(script, colorModePatternSingle).at(0) ??
    null
  );
}

function createEmbedHtml(embedUri: string, colorMode: string): string {
  return [
    '<div class="bluesky-embed-container">',
    `<iframe height="500px" class="bluesky-embed" src="https://embed.bsky.app/embed/${embedUri}?colorMode=${colorMode}" scrolling="no" frameborder="0" loading="lazy"> </iframe>`,
    "</div>",
  ].join("\n");
}
