import { AtpAgent } from "@atproto/api";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

interface FeedPostRecord {
  $type: "app.bsky.feed.post";
  createdAt: string;
  text: string;
  embed?: {
    $type: "app.bsky.embed.external";
    external: {
      title: string;
      uri: string;
    };
  };
}

export interface Posts {
  createdAt: Dayjs;
  text: string;
  embedTitle: string | undefined;
  embedUri: string | undefined;
}

export async function fetchFeedPostRecords(
  actor: string,
  option?: {
    limit?: number;
    filter?:
      | "posts_with_replies"
      | "posts_no_replies"
      | "posts_with_media"
      | "posts_and_author_threads";
  },
): Promise<Posts[] | false> {
  const agent = new AtpAgent({
    service: "https://api.bsky.app",
  });

  const feeds = await agent.getAuthorFeed({
    actor,
    limit: option?.limit,
    filter: option?.filter,
  });

  if (!feeds.success) {
    return false;
  }

  return feeds.data.feed.map((f) => {
    const r = f.post.record as FeedPostRecord;
    return {
      createdAt: dayjs(r.createdAt),
      text: r.text.replace(/\n[a-zA-Z0-9\/.\-_]+\.\.\.$/, "").trim(),
      embedTitle: r.embed?.external?.title,
      embedUri: r.embed?.external?.uri,
    };
  });
}
