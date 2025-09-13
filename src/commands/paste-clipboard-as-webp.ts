import { pasteClipboardAs } from "src/lib/helpers/images";
import { notifyRuntimeError } from "src/lib/helpers/ui";

export async function pasteClipboardAsWebp() {
  try {
    await pasteClipboardAs({ format: "webp" });
  } catch (error: any) {
    notifyRuntimeError(error.message);
  }
}
