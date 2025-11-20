import type { EditorConfig } from "src/definitions/config";
import { getActiveFilePath } from "src/lib/helpers/entries";
import { openUrl } from "src/lib/helpers/ui";
import { encodeToUrl } from "src/lib/utils/strings";

/**
 * 現在アクティブなファイルをローカルのMkDocsサイトとして開きます。
 */
export async function openAsLocalMkDocsSite(
  options?: EditorConfig["Open as local MkDocs site"],
) {
  const { baseUrl = "http://localhost:8000", docsRootPath = "docs" } =
    options ?? {};

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
