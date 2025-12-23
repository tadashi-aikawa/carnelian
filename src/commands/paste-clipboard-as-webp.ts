import type { EditorConfig } from "src/definitions/config";
import { pasteClipboardAs } from "src/lib/helpers/images";
import { notifyRuntimeError } from "src/lib/helpers/ui";

export async function pasteClipboardAsWebp(
  options?: EditorConfig["Paste clipboard as WebP"],
) {
  const { maxWidth } = options ?? {};
  try {
    await pasteClipboardAs({
      format: "webp",
      resize: maxWidth ? `'${maxWidth}x>'` : undefined,
    });
  } catch (error: any) {
    notifyRuntimeError(error.message);
  }
}
