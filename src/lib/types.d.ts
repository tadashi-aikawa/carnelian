import type {
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
import type { Properties as UProperties } from "./utils/types";

type CommandId = "editor:toggle-source" | "editor:save-file";

export interface CodeBlock {
  language: string | null;
  content: string;
  position: Pos;
}

// testableにするためutilを経由
type Properties = UProperties;

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
  removeProperties(entries: { entry: { key: any } }[]): void;
  /** 現在のプロパティを取得する */
  serialize(): UProperties;
  /** エディタに反映する (ファイルは保存されない) */
  synchronize(props: UProperties): void;
  /** ファイルに反映する */
  save(): void;
};

export type UEditor = Editor;
export type UFileView = FileView;
export type UMarkdownView = MarkdownView;

type Config = {
  spellcheckDictionary?: string[];
  useMarkdownLinks?: boolean;
  newLinkFormat?: "shortest" | "relative" | "absolute";
  // Folder to create new notes inに関係
  newFileFolderPath?: string;
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
    plugins: {
      [key: string]: any;
      publish: {
        instance: {
          // 独自ドメインではない
          host: `publish-${string}.obsidian.md`;
          excludes: string[];
          includes: string[];
          // id hash
          siteId: string;
          apiCustomUrl: () => Promise<{
            // id hash
            id: string;
            // Obsidian Publishの独自?ドメイン
            url: string;
            redirect: boolean;
          }>;
          apiOptions: () => Promise<{
            // path from root
            logo: string;
            siteName: string;
          }>;
        };
      };
    };
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
  hotkeyManager: {
    printHotkeyForCommand(id: string): string;
  };
};
