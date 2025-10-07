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
 * FIXME: 表示されていないeditor情報はアクティブになっていない
 */
export async function moveToNextWorkspace() {
  workspaceEditorState[getActiveWorkspaceName()] = getAllEditors().map(
    (editor) => ({
      scrollTop: editor?.getScrollInfo().top ?? 0,
      scrollLeft: editor?.getScrollInfo().left ?? 0,
      cursor: editor?.getCursor() ?? { line: 0, ch: 0 },
    }),
  );

  try {
    await _moveToNextWorkspace({ saveActiveWorkspace: true });

    const states = workspaceEditorState[getActiveWorkspaceName()];
    if (states) {
      for (const [i, editor] of getAllEditors().entries()) {
        if (!editor) {
          continue;
        }
        editor.scrollTo(states[i].scrollLeft, states[i].scrollTop);
        editor.setCursor(states[i].cursor);
      }
    }
  } catch (error: any) {
    notifyRuntimeError(error.message);
  }
}
