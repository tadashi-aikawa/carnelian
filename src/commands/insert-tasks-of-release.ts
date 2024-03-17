import { insertToCursor } from "src/lib/helpers/editors/basic";
import { showInputDialog, showSelectionDialog } from "src/lib/helpers/ui";

const releaseProductVars = {
  "Various Complements": {
    slug: "obsidian-various-complements-plugin",
  },
  "Another Quick Switcher": {
    slug: "obsidian-another-quick-switcher",
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
  const slug = releaseProductVars[product].slug;

  insertToCursor(createTemplate({ name, slug, version }));
}

function createTemplate(vars: {
  name: string;
  slug: string;
  version: string;
}): string {
  const { name, slug, version } = vars;
  return `
- [ ] (必要なら) READMEの更新

- [ ] \`task\`コマンドでリリース

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

- [ ] (必要なら) Discussionを閉じる

- [ ] MFDIでBlueskyにて連絡

\`\`\`
📦 ${name} ${version} をリリース 🚀

コメント

https://github.com/tadashi-aikawa/${slug}/releases/tag/${version}
\`\`\`

- [ ] (必要なら) Discordで連絡

\`\`\`
# 📦 ${name} ${version} 🚀 

https://github.com/tadashi-aikawa/${slug}/releases/tag/${version}

あとはGitHubと同じ
\`\`\`

- [ ] MinervaのHomeに記載してpublish

\`\`\`
- [${name} v${version}リリース](https://github.com/tadashi-aikawa/${slug}/releases/tag/${version})
\`\`\`
`;
}
