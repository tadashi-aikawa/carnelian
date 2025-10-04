import { notifyRuntimeError } from "src/lib/helpers/ui";
import { moveNextWorkspace as _moveToNextWorkspace } from "src/lib/helpers/workspace";

/**
 * 次のワークスペースに移動する(循環)
 */
export async function moveToNextWorkspace() {
  try {
    await _moveToNextWorkspace({ saveActiveWorkspace: true });
  } catch (error: any) {
    notifyRuntimeError(error.message);
  }
}
