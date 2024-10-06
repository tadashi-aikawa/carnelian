import { insertToCursor } from "src/lib/helpers/editors/basic";
import { showInputDialog, showSelectionDialog } from "src/lib/helpers/ui";

const releaseProductVars = {
  "Various Complements": {
    slug: "obsidian-various-complements-plugin",
    releaseCommand: (version: string) => `VERSION=${version} pnpm release`,
    kind: "Obsidian",
    useSemanticRelease: false,
  },
  "Another Quick Switcher": {
    slug: "obsidian-another-quick-switcher",
    releaseCommand: null,
    kind: "Obsidian",
    useSemanticRelease: true,
  },
  "Mobile First Daily Interface": {
    slug: "mobile-first-daily-interface",
    releaseCommand: (version: string) => `VERSION=${version} bun release`,
    kind: "Obsidian",
    useSemanticRelease: false,
  },
  Silhouette: {
    slug: "silhouette",
    releaseCommand: (version: string) => `VERSION=${version} bun release`,
    kind: "Obsidian",
    useSemanticRelease: false,
  },
  "Silhouette.nvim": {
    slug: "silhouette.nvim",
    releaseCommand: null,
    kind: "Neovim",
    useSemanticRelease: true,
  },
  "ghostwriter.nvim": {
    slug: "ghostwriter.nvim",
    releaseCommand: null,
    kind: "Neovim",
    useSemanticRelease: true,
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
  const { slug, kind, releaseCommand, useSemanticRelease } =
    releaseProductVars[product];

  insertToCursor(
    createTemplate({
      name,
      slug,
      version,
      kind,
      releaseCommand,
      useSemanticRelease,
    }),
  );
}

function createTemplate(vars: {
  name: string;
  slug: string;
  version: string;
  kind: "Obsidian" | "Neovim";
  releaseCommand: ((version: string) => string) | null;
  useSemanticRelease: boolean;
}): string {
  const { name, slug, version, kind, releaseCommand, useSemanticRelease } =
    vars;

  // プラグイン対象によってvがつかなかったりついたりする部分の吸収
  // 表示部分はvを付けるで統一しているが、URLなどtagに関与する部分は無理なので
  const normalizedVersion = kind === "Obsidian" ? version : `v${version}`;

  let message = "";
  const appendMessage = (m: string) => {
    message += `\n${m}`;
  };

  if (useSemanticRelease) {
    appendMessage("- [ ] GitHub Actionsでリリース");
  } else {
    appendMessage(`- [ ] (任意) READMEの更新
- [ ] リリースコマンドの実行

\`\`\`
${releaseCommand!(normalizedVersion)}
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
`);
  }

  appendMessage(`- [ ] MinervaのHomeに記載してpublish

\`\`\`
- [${name} v${version}リリース](https://github.com/tadashi-aikawa/${slug}/releases/tag/${normalizedVersion})
\`\`\`
`);

  appendMessage(`- [ ] Blueskyにて連絡

\`\`\`
📦 ${name} v${version} をリリース 🚀

コメント

https://github.com/tadashi-aikawa/${slug}/releases/tag/${normalizedVersion}
\`\`\`
`);

  return message;
}
