// This is an unsafe code..!! However, it might be a public interface because lishid commented it as a better way on PR :)
// https://github.com/obsidianmd/obsidian-releases/pull/520#issuecomment-944846642
import type { KeymapEventHandler, Scope } from "obsidian";

export interface UnsafeModalInterface<SuggestionItem> {
  scope: Scope & { keys: (KeymapEventHandler & { func: CallableFunction })[] };
  chooser: {
    values: SuggestionItem[] | null;
    selectedItem: number;
    setSelectedItem(item: number, event?: KeyboardEvent): void;
    useSelectedItem(ev: Partial<KeyboardEvent>): void;
    suggestions: Element[];
  };
  isOpen: boolean;
  updateSuggestions: () => unknown;
}
