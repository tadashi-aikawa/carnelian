import type { ViewState } from "obsidian";
import { getAllMarkdownLeaves } from "src/lib/helpers/leaves";
import { notifyRuntimeError } from "src/lib/helpers/ui";
import {
  moveNextWorkspace as _moveToNextWorkspace,
  getActiveWorkspaceName,
} from "src/lib/helpers/workspace";

const workspaceEditorState: {
  [workspaceName: string]: { vState: ViewState; eState: any }[] | undefined;
} = {};

/**
 * 次のワークスペースに移動する(循環)
 */
export async function moveToNextWorkspace() {
  workspaceEditorState[getActiveWorkspaceName()] = getAllMarkdownLeaves().map(
    (leaf) => {
      return {
        vState: { ...leaf.getViewState() },
        eState: { ...leaf.getEphemeralState() },
      };
    },
  );

  try {
    await _moveToNextWorkspace({ saveActiveWorkspace: true });

    const states = workspaceEditorState[getActiveWorkspaceName()];
    if (states) {
      for (const [i, leaf] of getAllMarkdownLeaves().entries()) {
        leaf.setViewState(states[i].vState, states[i].eState);
      }
    }
  } catch (error: any) {
    notifyRuntimeError(error.message);
  }
}
