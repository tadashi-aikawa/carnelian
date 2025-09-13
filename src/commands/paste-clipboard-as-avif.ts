import { pasteClipboardAs } from "src/lib/helpers/images";
import { notifyRuntimeError } from "src/lib/helpers/ui";

export async function pasteClipboardAsAVIF(options: { quality?: number }) {
  const { quality = 35 } = options;
  try {
    await pasteClipboardAs({ format: "avif", quality });
  } catch (error: any) {
    notifyRuntimeError(error.message);
  }
}
