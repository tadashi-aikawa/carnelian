import type { EditorConfig } from "src/definitions/config";
import { getActiveFilePath } from "src/lib/helpers/entries";
import { notifyValidationError, openUrl } from "src/lib/helpers/ui";
import { encodeToUrl } from "src/lib/utils/strings";

/**
 * 現在アクティブなファイルをリモートのMkDocsサイトとして開きます。
 */
export async function openAsRemoteMkDocsSite(
  options?: EditorConfig["Open as remote MkDocs site"],
) {
  const { baseUrl, docsRootPath = "docs" } = options ?? {};
  if (!baseUrl) {
    return notifyValidationError(
      "Open as remote MkDocs siteのbaseUrlが設定されていません。",
    );
  }

  const filePath = getActiveFilePath();
  if (!filePath) {
    return;
  }

  let encodedPath = encodeToUrl(filePath.replace(".md", ""));
  if (docsRootPath && encodedPath.startsWith(`${docsRootPath}/`)) {
    encodedPath = encodedPath.slice(docsRootPath.length + 1);
  }

  // TODO: MkDocsの設定を参照して最適化
  const url = `${baseUrl}/${encodedPath}.html`;
  if (!url) {
    return;
  }

  openUrl(url);
}
