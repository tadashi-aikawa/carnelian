import { getActiveParagraph } from "src/lib/helpers/editors/advanced";
import { insertMOC } from "./insert-moc";
import { transformMOC } from "./transform-moc";

/**
 * カーソル配下にMOCがなければ新しく追加し、あれば新しい形式に変換します
 */
export async function updateMOCSuitably() {
  const p = getActiveParagraph();
  if (!p) {
    await insertMOC();
    return;
  }

  await transformMOC();
}
