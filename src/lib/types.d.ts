/**
 * Obsidianの型ファイルの接頭語にUをつけた型を定義しています
 * これは公式の公開APIだけでなく、非公開API(runtimeでは利用可能)を含みます
 * そのため、いきなり利用できなくなるリスクがあります
 */
import {
  App,
  CacheItem,
  Editor,
  FileView,
  LinkCache,
  MarkdownView,
  Pos,
  ReferenceCache,
  TFile,
  Vault,
  Workspace,
} from "obsidian";

export interface CodeBlock {
  language: string | null;
  content: string;
  position: Pos;
}

type Properties = {
  tags?: string | string[] | undefined | null;
  aliases?: string | string[] | undefined | null;
  [key: string]: any | any[] | undefined | null;
};

// From Obsidian 1.4.x
export interface FrontMatterLinkCache
  extends Omit<ReferenceCache, keyof CacheItem> {
  key: string;
}
export type ULinkCache = LinkCache | FrontMatterLinkCache;

export type UMetadataEditor = {
  addProperty(): void;
  focusValue(key: string): void;
  insertProperties(props: Properties): void;
};

export type UEditor = Editor;
export type UFileView = FileView;
export type UMarkdownView = MarkdownView;

type Config = {
  spellcheckDictionary?: string[];
  useMarkdownLinks?: boolean;
  newLinkFormat?: "shortest" | "relative" | "absolute";
  readableLineLength?: boolean;
};

export type UVault = Vault & {
  fileMap: { [path: string]: TFile };
  getConfig<K extends keyof Config>(key: K): Config[K];
  setConfig<K extends keyof Config>(key: K, value: Config[K]): void;
};

export type UWorkspace = Workspace & {
  getActiveFileView(): UFileView;
};

export type UApp = App & {
  workspace: UWorkspace;
  isMobile: boolean;
  vault: UVault;
  metadataCache: {
    getBacklinksForFile(file: TFile): { data: Record<string, ULinkCache[]> };
  };
  internalPlugins: {
    plugins: { [key: string]: any };
  };
  plugins: {
    plugins: {
      "periodic-notes"?: {
        settings: {
          daily: { folder?: string; format?: string | "" };
        };
      };
      [key: string]: any;
    };
  };
};
