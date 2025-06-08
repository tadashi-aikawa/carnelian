import { spawn } from "child_process";
import path from "path";
import { now } from "src/lib/helpers/datetimes";
import { insertToCursor } from "src/lib/helpers/editors/basic";
import { getActiveFileFolder } from "src/lib/helpers/entries";
import {
  getClipboardImage,
  notifyRuntimeError,
  notifyValidationError,
} from "src/lib/helpers/ui";
import { toFullPath } from "src/lib/obsutils/mapper";

type Options = {
  format: "webp" | "avif";
  resize?: string;
  quality?: number;
};

/**
 * クリップボードの画像を別形式に変換して貼り付けます
 * ImageMagickを利用して変換します
 */
export async function pasteClipboardAs(options: Options) {
  let buffer: Buffer;
  try {
    buffer = await getClipboardImage();
  } catch (e: any) {
    return notifyValidationError(e);
  }

  // WARNING: attachmentsのディレクトリは `Default location for new attachments` を考慮する必要があるが、面倒なので決め打ち
  const folder = getActiveFileFolder();
  if (!folder) {
    return notifyRuntimeError(
      "アクティブなファイルのフォルダが取得できませんでした",
    );
  }

  const fileName = `${now("YYYY-MM-DD-HH-mm-ss")}.${options.format}`;
  const dstPath = toFullPath(path.join(folder.path, "attachments", fileName));

  try {
    await execMagick(buffer, dstPath, options);
  } catch (error: any) {
    notifyRuntimeError(error.message);
  }

  insertToCursor(`![[${fileName}]]`);
}

const execMagick = (buffer: Buffer, dstPath: string, options: Options) => {
  return new Promise((resolve, reject) => {
    // WARNING: homebrewでインストールした場合のみ動作する
    const magickProcess = spawn("/opt/homebrew/bin/magick", [
      "-",
      ...(options?.resize ? ["-resize", options.resize] : []),
      ...(options?.quality ? ["-quality", `${options.quality}`] : []),
      dstPath,
    ]);
    let stderr = "";

    magickProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    magickProcess.on("close", (code) => {
      if (code === 0) {
        resolve(dstPath);
      } else {
        reject(new Error(`ImageMagick エラー (code ${code}): ${stderr}`));
      }
    });

    magickProcess.on("error", (error) => {
      reject(new Error(`ImageMagick 実行エラー: ${error.message}`));
    });

    magickProcess.stdin.write(buffer);
    magickProcess.stdin.end();
  });
};
