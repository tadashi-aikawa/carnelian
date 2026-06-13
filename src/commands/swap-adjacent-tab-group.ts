import type { App } from "obsidian";
import { getActiveLeaf, setActiveLeaf } from "src/lib/helpers/leaves";
import { notifyWarning } from "src/lib/helpers/ui";
import type { UWorkspaceLeaf } from "src/lib/types";

type WorkspaceLayoutNode = {
  id?: string;
  type?: string;
  children?: WorkspaceLayoutNode[];
};

declare let app: App;

function findTabGroupByLeafId(
  node: WorkspaceLayoutNode,
  leafId: string,
  parent?: WorkspaceLayoutNode,
): { tabGroup: WorkspaceLayoutNode; parent: WorkspaceLayoutNode } | null {
  if (!node.children) {
    return null;
  }

  if (
    node.type === "tabs" &&
    node.children.some((child) => child.id === leafId)
  ) {
    return parent ? { tabGroup: node, parent } : null;
  }

  for (const child of node.children) {
    const result = findTabGroupByLeafId(child, leafId, node);
    if (result) {
      return result;
    }
  }

  return null;
}

/**
 * アクティブなタブグループを隣接するタブグループと入れ替えます
 */
export async function swapAdjacentTabGroup() {
  const activeLeaf = getActiveLeaf();
  if (!activeLeaf) {
    return notifyWarning("アクティブなタブがありません");
  }

  const layout = app.workspace.getLayout() as Record<
    string,
    WorkspaceLayoutNode
  >;
  const result = findTabGroupByLeafId(layout.main, activeLeaf.id);
  if (!result) {
    return notifyWarning("メイン領域のタブグループが見つかりません");
  }

  const { tabGroup, parent } = result;
  if (parent.type !== "split" || !parent.children) {
    return notifyWarning("入れ替え可能な分割レイアウトではありません");
  }

  const index = parent.children.indexOf(tabGroup);
  const nextTabGroupIndex = parent.children.findIndex(
    (child, i) => i > index && child.type === "tabs",
  );
  const previousTabGroupIndex = parent.children
    .map((child, i) => ({ child, i }))
    .reverse()
    .find(({ child, i }) => i < index && child.type === "tabs")?.i;
  const swapIndex =
    nextTabGroupIndex !== -1 ? nextTabGroupIndex : previousTabGroupIndex;

  if (swapIndex === undefined) {
    return notifyWarning("隣接するタブグループがありません");
  }

  const ephemeralStates = new Map<string, any>();
  app.workspace.iterateAllLeaves((leaf) => {
    ephemeralStates.set((leaf as UWorkspaceLeaf).id, {
      ...leaf.getEphemeralState(),
    });
  });

  [parent.children[index], parent.children[swapIndex]] = [
    parent.children[swapIndex],
    parent.children[index],
  ];

  await app.workspace.changeLayout(layout);
  await sleep(0);

  for (const [leafId, ephemeralState] of ephemeralStates) {
    app.workspace.getLeafById(leafId)?.setEphemeralState(ephemeralState);
  }

  const updatedActiveLeaf = app.workspace.getLeafById(activeLeaf.id);
  if (updatedActiveLeaf) {
    setActiveLeaf(updatedActiveLeaf as UWorkspaceLeaf);
  }
}
