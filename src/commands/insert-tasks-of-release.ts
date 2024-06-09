import { insertToCursor } from "src/lib/helpers/editors/basic";
import { showInputDialog, showSelectionDialog } from "src/lib/helpers/ui";

const releaseProductVars = {
  "Various Complements": {
    slug: "obsidian-various-complements-plugin",
    isCommunityPlugin: true,
    runtime: "node",
  },
  "Another Quick Switcher": {
    slug: "obsidian-another-quick-switcher",
    isCommunityPlugin: true,
    runtime: "bun",
  },
  "Mobile First Daily Interface": {
    slug: "mobile-first-daily-interface",
    isCommunityPlugin: false,
    runtime: "bun",
  },
  Silhouette: {
    slug: "silhouette",
    isCommunityPlugin: false,
    runtime: "bun",
  },
} as const;
type Product = keyof typeof releaseProductVars;

/**
 * リリースに必要なタスクを挿入します
 */
export async function insertTasksOfRelease() {
  const product = await showSelectionDialog({
    message: "リリースするプロダクトを選択してください",
    items: Object.keys(releaseProductVars) as Product[],
  });
  if (!product) {
    return;
  }

  const version = await showInputDialog({
    message: "バージョンを入力してください",
    placeholder: "1.2.3, 1.2.3-beta2, ... etc",
  });
  if (!version) {
    return;
  }

  const name = product;
  const { slug, isCommunityPlugin, runtime } = releaseProductVars[product];

  insertToCursor(
    createTemplate({ name, slug, version, isCommunityPlugin, runtime }),
  );
}

function createTemplate(vars: {
  name: string;
  slug: string;
  version: string;
  isCommunityPlugin: boolean;
  runtime: "node" | "bun";
}): string {
  const { name, slug, version, isCommunityPlugin, runtime } = vars;
  let message = `
- [ ] (必要なら) READMEの更新
- [ ] ${runtime === "node" ? "taskコマンドでリリース" : "bunコマンドでリリース"}
- [ ] GitHubリリースノートを記入し公開

\`\`\`
## 🎇 **Shiny New Things**

### sub title

## ✨ **New things**

- hoge

## 🔼 **Improvements**

- hoge

## 🦾 **No longer broken**

- hoge

## 🔥 **Breaking changes**

- hoge

## 🚑 **Hot fix**

- hoge
\`\`\`

- [ ] GitHub Issuesにリリースの連絡

\`\`\`
@???

Released in [v${version}](https://github.com/tadashi-aikawa/${slug}/releases/tag/${version}) 🚀
\`\`\`

${isCommunityPlugin ? "- [ ] (必要なら) Discussionを閉じる" : ""}
- [ ] MFDIでBlueskyにて連絡

\`\`\`
📦 ${name} ${version} をリリース 🚀

コメント

https://github.com/tadashi-aikawa/${slug}/releases/tag/${version}
\`\`\`
`;

  if (isCommunityPlugin) {
    message += `
  - [ ] (必要なら) Discordで連絡

\`\`\`
# 📦 ${name} ${version} 🚀 

https://github.com/tadashi-aikawa/${slug}/releases/tag/${version}

あとはGitHubと同じ
\`\`\`
`;
  }

  message += `
- [ ] MinervaのHomeに記載してpublish

\`\`\`
- [${name} v${version}リリース](https://github.com/tadashi-aikawa/${slug}/releases/tag/${version})
\`\`\`
`;

  return message;
}
