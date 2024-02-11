import { getActiveFilePath } from "src/lib/helpers/entries";
import { useObsidianPublishInfo } from "src/lib/helpers/plugins";
import { copyToClipboard, notify } from "src/lib/helpers/ui";

/**
 * MinervaのURLをコピーします
 */
export async function copyMinervaURL() {
  // INFO:
  // この関数の処理はMinervaに限らずObsidian Publish全体で動作します
  // 関数名はコマンド名にあわせており、たまたま今は実装が↑となっている

  const nt = notify("⏳ MinervaのURL情報を取得中...");

  const { getPageUrl } = await useObsidianPublishInfo();
  const url = getPageUrl(getActiveFilePath()!);
  await copyToClipboard(url);

  nt.setMessage(
    `👍 MinervaのURLをコピーしました

${url}`,
  );
  await sleep(5000);
  nt.hide();
}
