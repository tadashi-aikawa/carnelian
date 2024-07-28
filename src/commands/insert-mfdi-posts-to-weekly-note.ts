import { insertToCursor } from "src/lib/helpers/editors/basic";
import { getDailyNotes } from "src/lib/helpers/plugins";
import { getActiveFileDescriptionProperty } from "src/lib/helpers/properties";
import { loadCodeBlocks } from "src/lib/helpers/sections";
import { notify } from "src/lib/helpers/ui";
import { createHTMLCard, createMeta } from "src/lib/helpers/web";
import type { CodeBlock } from "src/lib/types";
import * as strings from "../lib/utils/strings";

/**
 * MFDIでポストした内容をWeekly Reportに差し込みます
 */
export async function insertMFDIPostsToWeeklyNote() {
  const description = getActiveFileDescriptionProperty();
  if (!description) {
    return notify("プロパティにdescriptionが存在しません");
  }

  const [weekBegin, weekEnd] = strings.doSinglePatternMatching(
    description,
    /\d{4}-\d{2}-\d{2}/g,
  );
  if (!weekBegin) {
    return notify("descriptionプロパティに開始日が存在しません");
  }
  if (!weekEnd) {
    return notify("descriptionプロパティに終了日が存在しません");
  }

  const nt = notify("⏳ MFDIのデータを取得中...");

  const codeBlocks: { path: string; codeBlock: CodeBlock }[] = [];
  for (const file of getDailyNotes(weekBegin, weekEnd)) {
    const cbs = await loadCodeBlocks(file.path);
    for (const codeBlock of cbs!) {
      codeBlocks.push({
        path: file.path,
        codeBlock,
      });
    }
  }

  const targetCodeBlocks = codeBlocks
    .map((x) => x.codeBlock)
    .filter(
      (cb) =>
        cb.language === "fw" &&
        cb.content.includes("http") &&
        // Minervaは単なる投稿用のPostであり、Weekly Reportの内容と重複するので除外
        !cb.content.includes("minerva.mamansoft.net") &&
        // GitHubもリリース連絡であり、Weekly Reportの内容と重複するので除外
        !cb.content.includes("github.com/tadashi-aikawa"),
    )
    .toReversed();

  for (let i = 0; i < targetCodeBlocks.length; i++) {
    const cb = targetCodeBlocks[i];
    nt.setMessage(
      `⏳ [${i + 1}/${targetCodeBlocks.length}] Cardのデータを作成中...`,
    );

    const [url] = strings.doSinglePatternMatching(cb.content, /http.+/g);
    const meta = await createMeta(url);
    if (meta?.type !== "html") {
      continue;
    }

    // YouTubeだけはカードのレイアウトが崩れるので直接URLを挿入する
    const card = url.includes("https://youtu.be/")
      ? `![](${url})`
      : createHTMLCard(meta);

    insertToCursor(
      `## ${meta.title}

${card}

~~~
${cb.content}
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
