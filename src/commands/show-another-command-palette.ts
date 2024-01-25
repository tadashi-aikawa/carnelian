import { Command, FuzzyMatch, FuzzySuggestModal } from "obsidian";
import { getAvailableCommands } from "src/lib/helpers/commands";
import { now } from "src/lib/helpers/datetimes";
import { loadJson, saveJson } from "src/lib/helpers/io";
import { UApp } from "src/lib/types";
import { sorter } from "src/lib/utils/collections";

// XXX: 少し気持ち悪い
declare let app: UApp;

type HistoricalCommand = Command & {
  lastUsed?: number;
};

type CommandHistoryMap = { [id: string]: number };

/**
 * もう1つのコマンドパレットを表示
 */
export async function showAnotherCommandPalette(args: {
  commandHistoryPath: string;
}): Promise<void> {
  const commandHistoryMap =
    (await loadJson<CommandHistoryMap>(args.commandHistoryPath)) ?? {};

  const commands: HistoricalCommand[] = getAvailableCommands()
    .map((x) => ({
      ...x,
      lastUsed: commandHistoryMap[x.id],
    }))
    .sort(sorter((x) => x.lastUsed ?? 0, "desc"));

  new CommandQuickSwitcher(app, commands, async (item) => {
    commandHistoryMap[item.id] = now("unixtime");
    await saveJson(args.commandHistoryPath, commandHistoryMap, {
      overwrite: true,
    });
  }).open();
}

class CommandQuickSwitcher extends FuzzySuggestModal<HistoricalCommand> {
  constructor(
    app: UApp,
    private commands: HistoricalCommand[],
    private handleChooseItem: (item: HistoricalCommand) => any,
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
    this.handleChooseItem(item);
  }
  renderSuggestion(item: FuzzyMatch<HistoricalCommand>, el: HTMLElement): void {
    const recordEl = createDiv({
      cls: [
        "carnelian-command-palette-item",
        item.item.lastUsed ? "carnelian-command-palette-item-lastused" : "",
      ],
    });

    recordEl.appendChild(
      createDiv({
        text: item.item.name,
      }),
    );
    recordEl.appendChild(
      createDiv({
        text: app.hotkeyManager.printHotkeyForCommand(item.item.id),
        cls: ["carnelian-command-palette-item__key"],
      }),
    );

    el.appendChild(recordEl);
  }
}
