import type { EditorPosition } from "obsidian";
import { getAllEditors } from "src/lib/helpers/editors/basic";
import { notifyRuntimeError } from "src/lib/helpers/ui";
import {
  moveNextWorkspace as _moveToNextWorkspace,
  getActiveWorkspaceName,
} from "src/lib/helpers/workspace";

type EditorState = {
  scrollTop: number;
  scrollLeft: number;
  cursor: EditorPosition;
};

const workspaceEditorState: {
  [workspaceName: string]: EditorState[] | undefined;
} = {};

/**
 * 次のワークスペースに移動する(循環)
 */
export async function moveToNextWorkspace() {
  workspaceEditorState[getActiveWorkspaceName()] = getAllEditors().map(
    (editor) => ({
      scrollTop: editor.getScrollInfo().top,
      scrollLeft: editor.getScrollInfo().left,
      cursor: editor.getCursor(),
    }),
  );

  try {
    await _moveToNextWorkspace({ saveActiveWorkspace: true });

    const states = workspaceEditorState[getActiveWorkspaceName()];
    if (states) {
      for (const [i, editor] of getAllEditors().entries()) {
        editor.scrollTo(states[i].scrollLeft, states[i].scrollTop);
        editor.setCursor(states[i].cursor);
      }
    }
  } catch (error: any) {
    notifyRuntimeError(error.message);
  }
}
