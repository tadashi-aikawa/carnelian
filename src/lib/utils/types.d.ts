export type Properties = {
  tags?: string | string[] | undefined | null;
  aliases?: string | string[] | undefined | null;
  [key: string]: any | any[] | undefined | null;
};

export type PartialRequired<T, K extends keyof T> = T & {
  [P in K]-?: T[P];
};
