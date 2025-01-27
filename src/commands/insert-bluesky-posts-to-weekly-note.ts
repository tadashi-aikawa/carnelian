import dayjs from "dayjs";
import { fetchFeedPostRecords } from "src/lib/helpers/clients/bluesky";
import { insertToCursor } from "src/lib/helpers/editors/basic";
import { getActiveFileDescriptionProperty } from "src/lib/helpers/properties";
import {
  notify,
  notifyRuntimeError,
  notifyValidationError,
} from "src/lib/helpers/ui";
import { createCard } from "src/lib/helpers/web";
import * as strings from "../lib/utils/strings";

/**
 * BlueskyのポストをWeekly Reportに必要な形式で差し込みます
 */
export async function insertBlueskyPostsToWeeklyNote() {
  const description = getActiveFileDescriptionProperty();
  if (!description) {
    return notifyValidationError("プロパティにdescriptionが存在しません");
  }

  const [weekBegin, weekEnd] = strings.doSinglePatternMatching(
    description,
    /\d{4}-\d{2}-\d{2}/g,
  );
  if (!weekBegin) {
    return notifyValidationError("descriptionプロパティに開始日が存在しません");
  }
  if (!weekEnd) {
    return notifyValidationError("descriptionプロパティに終了日が存在しません");
  }

  const nt = notify("⏳ Blueskyのデータを取得中...");

  const posts = await fetchFeedPostRecords("tadashi-aikawa.bsky.social", {
    limit: 100,
    filter: "posts_no_replies",
  });
  if (!posts) {
    return notifyRuntimeError("Blueskyからのデータ取得に失敗しました");
  }

  const weekBeginDate = dayjs(weekBegin).startOf("day");
  const weekEndDate = dayjs(weekEnd).endOf("day");
  const relatedPosts = posts
    .filter(
      (r) =>
        r.createdAt.isAfter(weekBeginDate) && r.createdAt.isBefore(weekEndDate),
    )
    .filter(
      (r) =>
        r.embedUri !== undefined &&
        !r.embedUri.includes("https://minerva.mamansoft.net") &&
        (!r.embedUri.includes("https://github.com/tadashi-aikawa") ||
          r.text.includes("リリース 🚀")),
    );

  for (let i = 0; i < relatedPosts.length; i++) {
    const post = relatedPosts[i];
    nt.setMessage(
      `⏳ [${i + 1}/${relatedPosts.length}] Cardのデータを作成中...`,
    );

    const card = post.embedUri?.startsWith("https://www.youtube.com/")
      ? `![](${post.embedUri})`
      : await createCard(post.embedUri!);

    insertToCursor(
      `## ${post.embedTitle}

${card}

~~~
${post.text}
~~~

`,
    );
  }

  nt.setMessage(
    `👍 ${weekBegin} ～ ${weekEnd} にMFDIで投稿されたサイトURL付の投稿を挿入しました`,
  );
  await sleep(5000);
  nt.hide();
}
