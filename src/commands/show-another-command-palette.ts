import { Command, FuzzyMatch, FuzzySuggestModal } from "obsidian";
import { getAvailableCommands } from "src/lib/helpers/commands";
import { now } from "src/lib/helpers/datetimes";
import { UApp } from "src/lib/types";
import { sorter } from "src/lib/utils/collections";

// XXX: 少し気持ち悪い
declare let app: UApp;

type HistoricalCommand = Command & {
  lastUsed?: number;
};

// TODO: 今後 永続化したい
const commandHistoryMap: { [id: string]: number } = {};

/**
 * もう1つのコマンドパレットを表示
 */
export function showAnotherCommandPalette(): void {
  const commands: HistoricalCommand[] = getAvailableCommands()
    .map((x) => ({
      ...x,
      lastUsed: commandHistoryMap[x.id],
    }))
    .sort(sorter((x) => x.lastUsed ?? 0, "desc"));
  showCommandQuickSwitcher(commands);
}

class CommandQuickSwitcher extends FuzzySuggestModal<HistoricalCommand> {
  constructor(
    app: UApp,
    private commands: HistoricalCommand[],
  ) {
    super(app);
  }
  getItems(): HistoricalCommand[] {
    return this.commands;
  }
  getItemText(item: HistoricalCommand): string {
    return item.name;
  }
  onChooseItem(item: HistoricalCommand): void {
    item.callback?.() ?? item.checkCallback?.(false);
    commandHistoryMap[item.id] = now("unixtime");
  }
  renderSuggestion(item: FuzzyMatch<HistoricalCommand>, el: HTMLElement): void {
    el.appendChild(
      createDiv({
        cls: [
          "carnelian-command-palette-item",
          item.item.lastUsed ? "carnelian-command-palette-item-lastused" : "",
        ],
        text: item.item.name,
      }),
    );
  }
}

/**
 * コマンドを実行するクイックスウィッチャーを表示します
 */
function showCommandQuickSwitcher(commands: HistoricalCommand[]) {
  new CommandQuickSwitcher(app, commands).open();
}
