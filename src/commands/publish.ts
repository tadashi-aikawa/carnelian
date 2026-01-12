import dayjs, { type Dayjs } from "dayjs";
import type { TFile } from "obsidian";
import type { AllConfig } from "src/definitions/config";
import { type NoteType, findNoteType } from "src/definitions/mkms";
import { runCommandById } from "src/lib/helpers/commands";
import { now } from "src/lib/helpers/datetimes";
import { getMarkdownFiles } from "src/lib/helpers/entries";
import { saveFile } from "src/lib/helpers/io";
import { path2LinkText } from "src/lib/helpers/links";
import { getPropertiesByPath } from "src/lib/helpers/properties";
import { notifyValidationError } from "src/lib/helpers/ui";
import { groupBy, mapValues } from "src/lib/utils/collections";
import { isPresent } from "src/lib/utils/guard";
import { isMatchedGlobPatterns } from "src/lib/utils/strings";
import { match } from "ts-pattern";

type NoteKind = "created" | "updated";
type Note = { file: TFile; noteType: NoteType; updated: Dayjs; created: Dayjs };

/**
 * 前処理を行いObsidian Publishに公開します
 */
export async function publish(options?: AllConfig["Publish"]) {
  const { changelogNotePath, ignoreFiles = [] } = options ?? {};
  if (!changelogNotePath) {
    return notifyValidationError(
      "'all.Publish.changelogNotePath' が設定されていません。",
    );
  }

  const end = now("dayjs");
  const begin = end.clone().add(-7, "day");

  const targetFilesBase = getMarkdownFiles()
    .map((x) =>
      filterMap(x, {
        begin,
        end,
        ignoreFiles,
      }),
    )
    .filter(isPresent);

  const filesByUpdated = mapValues(
    groupBy(targetFilesBase, (note) => note.updated.format("YYYY-MM-DD (ddd)")),
    (notes) =>
      groupBy(notes.toSorted(), (n) =>
        n.created.isSame(n.updated, "day") ? "created" : "updated",
      ),
  );

  const notes2List = (notes: Note[]) =>
    notes
      .map((n) => path2LinkText(n.file.path))
      .map((line) => `- ${line}`)
      .join("\n");

  const body = Object.keys(filesByUpdated)
    .toSorted()
    .toReversed()
    .map((date) =>
      `
## ${date}

### New Notes

${filesByUpdated[date].created ? notes2List(filesByUpdated[date].created) : "_なし_"}

### Updated Notes

${filesByUpdated[date].updated ? notes2List(filesByUpdated[date].updated) : "_なし_"}
`.trimStart(),
    )
    .join("\n\n");

  const contents = `---
cssclasses:
  - history-page
cover: Attachments/history.webp
description: Minerva直近1週間の更新履歴です。Publishのたびに自動更新しています。
---
![[history.webp|frame]]

\`⌚ 最終更新日時\` ${now("YYYY-MM-DD (ddd) HH:mm:ss")}

> [!hint]- このページの見方について
> - このページは直近1週間に**新規作成**または**内容が更新された**ノートの一覧です
>    - 日付ごとの更新履歴ではありません
> - 更新は **ファイルの最終更新日** ではなく **コンテンツの意味が最後に更新された日** を意味しています
>    - たとえば『フォーマットや誤字を修正した』だけの場合は更新とみなしません

${body}
`.trim();

  await saveFile(changelogNotePath, contents, {
    overwrite: true,
  });

  runCommandById("publish:view-changes");
}

function filterMap(
  file: TFile,
  options: { begin: Dayjs; end: Dayjs; ignoreFiles: string[] },
): Note | null {
  const { begin, end, ignoreFiles } = options;
  if (isMatchedGlobPatterns(file.path, ignoreFiles)) {
    return null;
  }

  const props = getPropertiesByPath(file.path);
  if (!props || props.publish === false || !props.updated || !props.created) {
    return null;
  }

  const created = dayjs(props.created);
  const updated = dayjs(props.updated);
  if (updated.diff(begin, "day") < 0 || updated.diff(end, "day") > 0) {
    return null;
  }

  const noteType = findNoteType(file);
  if (!noteType) {
    return null;
  }

  return match(noteType.name)
    .with("Daily note", () => null)
    .otherwise(() => ({ file, noteType, updated, created }));
}
