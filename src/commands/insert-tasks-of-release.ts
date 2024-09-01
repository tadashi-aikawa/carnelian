import { insertToCursor } from "src/lib/helpers/editors/basic";
import { showInputDialog, showSelectionDialog } from "src/lib/helpers/ui";

const releaseProductVars = {
  "Various Complements": {
    slug: "obsidian-various-complements-plugin",
    isCommunityPlugin: true,
    releaseCommand: (version: string) => `VERSION=${version} pnpm release`,
    kind: "Obsidian",
  },
  "Another Quick Switcher": {
    slug: "obsidian-another-quick-switcher",
    isCommunityPlugin: true,
    releaseCommand: (version: string) => `VERSION=${version} bun release`,
    kind: "Obsidian",
  },
  "Mobile First Daily Interface": {
    slug: "mobile-first-daily-interface",
    isCommunityPlugin: false,
    releaseCommand: (version: string) => `VERSION=${version} bun release`,
    kind: "Obsidian",
  },
  Silhouette: {
    slug: "silhouette",
    isCommunityPlugin: false,
    releaseCommand: (version: string) => `VERSION=${version} bun release`,
    kind: "Obsidian",
  },
  "Silhouette.nvim": {
    slug: "silhouette.nvim",
    isCommunityPlugin: false,
    releaseCommand: (version: string) =>
      `git tag ${version} && git push --tags`,
    kind: "Neovim",
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
  const { slug, isCommunityPlugin, kind, releaseCommand } =
    releaseProductVars[product];

  insertToCursor(
    createTemplate({
      name,
      slug,
      version,
      isCommunityPlugin,
      kind,
      releaseCommand,
    }),
  );
}

function createTemplate(vars: {
  name: string;
  slug: string;
  version: string;
  isCommunityPlugin: boolean;
  kind: "Obsidian" | "Neovim";
  releaseCommand: (version: string) => string;
}): string {
  const { name, slug, version, isCommunityPlugin, kind, releaseCommand } = vars;

  // プラグイン対象によってvがつかなかったりついたりする部分の吸収
  // 表示部分はvを付けるで統一しているが、URLなどtagに関与する部分は無理なので
  const normalizedVersion = kind === "Obsidian" ? version : `v${version}`;

  let message = `
- [ ] (任意) READMEの更新

- [ ] リリースコマンドの実行

\`\`\`
${releaseCommand(normalizedVersion)}
\`\`\`

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

- [ ] (任意) GitHub Issuesにリリースの連絡

\`\`\`
@???

Released in [v${version}](https://github.com/tadashi-aikawa/${slug}/releases/tag/${normalizedVersion}) 🚀
\`\`\`

${isCommunityPlugin ? "- [ ] (任意) Discussionを閉じる" : ""}
- [ ] MFDIでBlueskyにて連絡

\`\`\`
📦 ${name} v${version} をリリース 🚀

コメント

https://github.com/tadashi-aikawa/${slug}/releases/tag/${normalizedVersion}
\`\`\`
`;

  if (isCommunityPlugin) {
    message += `
  - [ ] (任意) Discordで連絡

\`\`\`
# 📦 ${name} v${version} 🚀 

https://github.com/tadashi-aikawa/${slug}/releases/tag/${normalizedVersion}

あとはGitHubと同じ
\`\`\`
`;
  }

  message += `
- [ ] MinervaのHomeに記載してpublish

\`\`\`
- [${name} v${version}リリース](https://github.com/tadashi-aikawa/${slug}/releases/tag/${normalizedVersion})
\`\`\`
`;

  return message;
}
