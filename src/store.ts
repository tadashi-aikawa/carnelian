import { stripDecoration } from "src/lib/obsutils/parser";

export const useActiveFileEssentialBodyStore = () => {
  let essentialBody: string | null = null;

  // TODO: まだまだロジックがあるはず...
  const toEssentialBody = (body: string): string => {
    return stripDecoration(body).replace(/\s+/g, "");
  };

  const setEssentialBody = (body: string): void => {
    essentialBody = toEssentialBody(body);
  };

  const equals = (body: string): boolean =>
    essentialBody === toEssentialBody(body);

  return {
    toEssentialBody,
    setEssentialBody,
    equals,
  };
};

export const store = useActiveFileEssentialBodyStore();
