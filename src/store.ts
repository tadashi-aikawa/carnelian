import jsSHA from "jssha";
import { stripDecoration } from "src/lib/obsutils/parser";

type SHA256 = string;

const hash = (str: string): SHA256 =>
  new jsSHA("SHA-256", "TEXT").update(str).getHash("HEX");

export const useActiveFileEssentialBodyStore = () => {
  const essentialBodyMapping: {
    [path: string]: { [datetime: string]: SHA256 };
  } = {};

  // TODO: まだまだロジックがあるはず...
  const toEssentialBody = (body: string): string => {
    return stripDecoration(body).replace(/\s+/g, "");
  };

  const hasEssetialBody = (path: string, datetime: string): boolean =>
    essentialBodyMapping[path]?.[datetime] != null;

  /**
   * datetime時点での本質的な内容をセットします。
   * @args.path ファイルパス
   * @args.datetime YYYY-MM-DD HH:mm
   * @args.body frontmatterを除いた本文全文
   * @args.noOverwrite すでにセットされている場合は上書きしない
   */
  const setEssentialBody = (args: {
    path: string;
    datetime: string;
    body: string;
    noOverwrite?: boolean;
  }): void => {
    const { path, datetime, body, noOverwrite = false } = args;

    if (noOverwrite && hasEssetialBody(path, datetime)) {
      return;
    }

    essentialBodyMapping[path] ??= {};
    essentialBodyMapping[path][datetime] = hash(toEssentialBody(body));
  };

  /**
   * datetime時点での内容と、bodyの内容が本質的に等しいかどうかを返します。
   * @args.path ファイルパス
   * @args.datetime 比較元のYYYY-MM-DD HH:mm
   * @args.body 比較先のfrontmatterを除いた本文全文
   */
  const equals = (args: {
    path: string;
    datetime: string;
    body: string;
  }): boolean => {
    const { path, datetime, body } = args;
    return (
      essentialBodyMapping[path]?.[datetime] === hash(toEssentialBody(body))
    );
  };

  /**
   * bodyの内容と本質的に等しい内容が記録されている日付を返します。
   * 見つからなかった場合はnullを返します。
   * @args.path ファイルパス
   * @args.body 比較先のfrontmatterを除いた本文全文
   */
  const findDatetimeByHash = (path: string, body: string): string | null => {
    const targetHash = hash(toEssentialBody(body));
    const datetimeHashMapping = essentialBodyMapping[path];
    if (!datetimeHashMapping) {
      return null;
    }

    for (const [datetime, recordedHash] of Object.entries(
      datetimeHashMapping,
    )) {
      if (recordedHash === targetHash) {
        return datetime;
      }
    }

    return null;
  };

  return {
    setEssentialBody,
    equals,
    findDatetimeByHash,
  };
};

export const store = useActiveFileEssentialBodyStore();
