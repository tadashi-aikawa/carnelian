import jsSHA from "jssha";
import { stripDecoration } from "src/lib/obsutils/parser";

type SHA256 = string;

const hash = (str: string): SHA256 =>
  new jsSHA("SHA-256", "TEXT").update(str).getHash("HEX");

export const useActiveFileEssentialBodyStore = () => {
  const essentialBodyMapping: { [path: string]: { [date: string]: SHA256 } } =
    {};

  // TODO: まだまだロジックがあるはず...
  const toEssentialBody = (body: string): string => {
    return stripDecoration(body).replace(/\s+/g, "");
  };

  const hasEssetialBody = (path: string, date: string): boolean =>
    essentialBodyMapping[path]?.[date] != null;

  /**
   * date時点での本質的な内容をセットします。ただし、すでにセットされている場合は上書きしません。
   * @args.path ファイルパス
   * @args.date YYYY-MM-DD
   * @args.body frontmatterを除いた本文全文
   */
  const setEssentialBody = (args: {
    path: string;
    date: string;
    body: string;
  }): void => {
    const { path, date, body } = args;

    if (hasEssetialBody(path, date)) {
      return;
    }

    essentialBodyMapping[path] ??= {};
    essentialBodyMapping[path][date] = hash(toEssentialBody(body));
  };

  /**
   * date時点での内容と、bodyの内容が本質的に等しいかどうかを返します。
   * @args.path ファイルパス
   * @args.date 比較元のYYYY-MM-DD
   * @args.body 比較先のfrontmatterを除いた本文全文
   */
  const equals = (args: {
    path: string;
    date: string;
    body: string;
  }): boolean => {
    const { path, date, body } = args;
    return essentialBodyMapping[path]?.[date] === hash(toEssentialBody(body));
  };

  return {
    setEssentialBody,
    equals,
  };
};

export const store = useActiveFileEssentialBodyStore();
