import type { EditorConfig } from "src/definitions/config";
import { pasteClipboardAs } from "src/lib/helpers/images";
import { notifyRuntimeError } from "src/lib/helpers/ui";

export async function pasteClipboardAsAVIF(
  options?: EditorConfig["Paste clipboard as AVIF"],
) {
  const { quality = 35, maxWidth } = options ?? {};
  try {
    await pasteClipboardAs({
      format: "avif",
      quality,
      resize: maxWidth ? `'${maxWidth}x>'` : undefined,
    });
  } catch (error: any) {
    notifyRuntimeError(error.message);
  }
}
