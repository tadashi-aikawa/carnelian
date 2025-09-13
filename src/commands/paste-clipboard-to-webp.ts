import { execSync } from "child_process";
import path from "path";
import { now } from "src/lib/helpers/datetimes";
import { insertToCursor } from "src/lib/helpers/editors/basic";
import { getActiveFileFolder } from "src/lib/helpers/entries";
import { notifyRuntimeError } from "src/lib/helpers/ui";
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
    execMagickFromClipboard(dstPath, options);
  } catch (error: any) {
    notifyRuntimeError(error.message);
  }

  insertToCursor(`![[${fileName}]]`);
}

const execMagickFromClipboard = (dstPath: string, options: Options) => {
  const _magick = "/opt/homebrew/bin/magick";
  const _pngpaste = "/opt/homebrew/bin/pngpaste";

  const optionStr = [
    options.resize ? `-resize ${options.resize}` : "",
    options.quality ? `-quality ${options.quality}` : "",
  ].join(" ");

  try {
    execSync(`${_pngpaste} - | ${_magick} - ${optionStr} ${dstPath}`);
    return dstPath;
  } catch (e: any) {
    const stderr =
      e?.stderr instanceof Buffer ? e.stderr.toString() : e.message;
    throw new Error(`ImageMagick 実行エラー: ${stderr}`);
  }
};
