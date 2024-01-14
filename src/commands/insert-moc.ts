import { insertToCursor } from "src/lib/helpers/editors/basic";

/**
 * MOCを挿入します
 */
export async function insertMOC() {
  insertToCursor(
    `
## MOC

- 📒**関連**
- 📜**アクティビティ**
- 📝**トラブルシューティング**
`.trim(),
  );
}
