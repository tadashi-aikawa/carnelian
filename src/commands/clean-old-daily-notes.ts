import dayjs from "dayjs";
import { renameFileWithoutLinkModified } from "src/lib/helpers/entries";
import { getDailyNotes } from "src/lib/helpers/plugins";
import { notify } from "src/lib/helpers/ui";

/**
 * 現在日時時より14日前よりも古いDaily Noteをクリーンします。ただし2020月12月30日以降のものに限ります。
 * クリーンとは任意の別ディレクトリに移すこと
 *
 * WARN:
 * デイリーノート一覧はキャッシュの情報から判断します
 * デイリーノートファイルに大きな増減があった場合はObsidianを再起動してから実行してください
 */
export async function cleanOldDailyNotes() {
  _cleanOldDailyNotes("2020-12-30", "../minerva-daily-note-backup");
}

/**
 * 14日前よりも古いDaily Noteをクリーンします
 *
 * @param startDate - 探索開始日付 (ex: 2023-12-30)
 * @param cleanDir - クリーンしたファイルを配置するディレクトリパス
 */
async function _cleanOldDailyNotes(startDate: string, cleanDir: string) {
  const end = dayjs().subtract(2, "weeks").format("YYYY-MM-DD");

  const notes = getDailyNotes(startDate, end);
  if (notes.length === 0) {
    return notify(
      `${startDate} ～ ${end} の期間にはデイリーノートが存在しませんでした。`,
    );
  }

  const nt = notify(
    `${notes.length}件のノートを ${cleanDir} 配下に移動します。しばらく時間がかかる場合があります。`,
  );

  for (const f of notes) {
    await renameFileWithoutLinkModified(f.path, `${cleanDir}/${f.name}`);
  }

  nt.setMessage(`${notes.length}件のノートを ${cleanDir} 配下に移動しました。`);
}
