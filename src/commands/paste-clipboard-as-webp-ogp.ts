import { pasteClipboardAs } from "src/lib/helpers/images";
import { notifyRuntimeError } from "src/lib/helpers/ui";

export async function pasteClipboardAsWebpForOGP() {
  try {
    await pasteClipboardAs({
      format: "webp",
      resize: `'1200x>'`,
    });
  } catch (error: any) {
    notifyRuntimeError(error.message);
  }
}
