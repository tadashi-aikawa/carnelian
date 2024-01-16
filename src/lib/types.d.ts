import {
  App,
  CacheItem,
  Command,
  DataAdapter,
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

type CommandId = "editor:toggle-source";

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
  // Default editing modeに関係
  livePreview?: boolean;
  // Default view for new tabsに関係
  defaultViewMode?: "preview" | "source";
  // Vim key bindingsに関係
  vimMode?: boolean;
};

export type UAdapter = DataAdapter & {
  basePath: string;
};

export type UVault = Vault & {
  adapter: UAdapter;
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
  commands: {
    commands: { [key: string]: Command };
    executeCommandById(id: CommandId): boolean;
  };
};
