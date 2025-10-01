import { findCommandById, runCommandById } from "src/lib/helpers/commands";

/**
 * Cycle bullet/checkboxコマンドのラッパー
 * Silhouetteの同コマンドが存在する場合はそちらを優先する
 */
export async function cycleBulletCheckbox() {
  const cmd = findCommandById("obsidian-silhouette:cycle-bullet-checkbox");
  if (cmd) {
    runCommandById("obsidian-silhouette:cycle-bullet-checkbox");
    return;
  }

  runCommandById("editor:cycle-list-checklist");
}
