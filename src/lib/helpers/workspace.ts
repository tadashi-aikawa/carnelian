import { UApp, UWorkspace } from "../types";

declare let app: UApp;

/**
 * 現在のワークスペースを取得します
 */
export function getWorkspace(): UWorkspace {
  return app.workspace;
}
