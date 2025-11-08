import type { ViewState } from "obsidian";
import {
  getActiveLeaf,
  getAllMarkdownLeaves,
  setActiveLeaf,
} from "src/lib/helpers/leaves";
import { notifyRuntimeError } from "src/lib/helpers/ui";
import {
  moveNextWorkspace as _moveToNextWorkspace,
  getActiveWorkspaceName,
} from "src/lib/helpers/workspace";

const workspaceEditorState: {
  [workspaceName: string]:
    | {
        leaves: { vState: ViewState; eState: any }[];
        activeLeafIndex: number | undefined;
      }
    | undefined;
} = {};

/**
 * 次のワークスペースに移動する(循環)
 */
export async function moveToNextWorkspace() {
  const previousLeaves = getAllMarkdownLeaves();
  workspaceEditorState[getActiveWorkspaceName()] = {
    leaves: previousLeaves.map((leaf) => {
      return {
        vState: { ...leaf.getViewState() },
        eState: { ...leaf.getEphemeralState() },
      };
    }),
    activeLeafIndex: previousLeaves.findIndex(
      (x) => x.id === getActiveLeaf()?.id,
    ),
  };

  try {
    await _moveToNextWorkspace({ saveActiveWorkspace: true });
  } catch (error: any) {
    return notifyRuntimeError(error.message);
  }

  const previousState = workspaceEditorState[getActiveWorkspaceName()];
  if (!previousState) {
    return;
  }

  const currentLeaves = getAllMarkdownLeaves();
  for (const [i, leaf] of currentLeaves.entries()) {
    leaf.setViewState(
      previousState.leaves[i].vState,
      previousState.leaves[i].eState,
    );
  }

  // リーフの復元が完了してからアクティブリーフを設定するために待機
  await sleep(0);

  if (previousState.activeLeafIndex == null) {
    return;
  }

  const activeLeaf = getAllMarkdownLeaves()[previousState.activeLeafIndex];
  if (activeLeaf) {
    setActiveLeaf(activeLeaf);
  }
}
