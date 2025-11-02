import type { ViewState } from "obsidian";
import {
  getActiveLeaf,
  getAllLeaves,
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
        activeLeafId: string | undefined;
      }
    | undefined;
} = {};

/**
 * 次のワークスペースに移動する(循環)
 */
export async function moveToNextWorkspace() {
  workspaceEditorState[getActiveWorkspaceName()] = {
    leaves: getAllMarkdownLeaves().map((leaf) => {
      return {
        vState: { ...leaf.getViewState() },
        eState: { ...leaf.getEphemeralState() },
      };
    }),
    activeLeafId: getActiveLeaf()?.id,
  };

  try {
    await _moveToNextWorkspace({ saveActiveWorkspace: true });

    const previousState = workspaceEditorState[getActiveWorkspaceName()];
    if (previousState) {
      const leaves = getAllMarkdownLeaves();
      for (const [i, leaf] of leaves.entries()) {
        leaf.setViewState(
          previousState.leaves[i].vState,
          previousState.leaves[i].eState,
        );
      }

      // リーフの復元が完了してからアクティブリーフを設定するために待機
      await sleep(0);

      if (previousState.activeLeafId) {
        const activeLeaf = getAllLeaves().find(
          (x) => x.id === previousState.activeLeafId,
        );
        if (activeLeaf) {
          setActiveLeaf(activeLeaf);
        }
      }
    }
  } catch (error: any) {
    notifyRuntimeError(error.message);
  }
}
