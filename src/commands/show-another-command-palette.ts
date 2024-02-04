import { Command, SuggestModal } from "obsidian";
import { getAvailableCommands } from "src/lib/helpers/commands";
import { now } from "src/lib/helpers/datetimes";
import { loadJson, saveJson } from "src/lib/helpers/io";
import { UApp } from "src/lib/types";
import { sorter } from "src/lib/utils/collections";
import { microFuzzy } from "src/lib/utils/strings";

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

  const commands: HistoricalCommand[] = getAvailableCommands().map((x) => ({
    ...x,
    lastUsed: commandHistoryMap[x.id],
  }));

  new CommandQuickSwitcher(app, commands, async (item) => {
    commandHistoryMap[item.id] = now("unixtime");
    await saveJson(args.commandHistoryPath, commandHistoryMap, {
      overwrite: true,
    });
  }).open();
}

class CommandQuickSwitcher extends SuggestModal<HistoricalCommand> {
  constructor(
    app: UApp,
    private commands: HistoricalCommand[],
    private handleChooseItem: (item: HistoricalCommand) => any,
  ) {
    super(app);
  }

  getSuggestions(query: string): HistoricalCommand[] {
    return this.commands
      .map((command) => ({
        command,
        result: microFuzzy(command.name.toLowerCase(), query.toLowerCase()),
      }))
      .filter(({ result }) => result.type !== "none")
      .toSorted(sorter(({ result }) => result.score, "desc"))
      .toSorted(sorter(({ command }) => command.lastUsed ?? 0, "desc"))
      .toSorted(sorter(({ result }) => result.type === "starts-with", "desc"))
      .toSorted(sorter(({ command }) => command.lastUsed != null, "desc"))
      .map(({ command }) => command);
  }

  renderSuggestion(item: HistoricalCommand, el: HTMLElement): void {
    const recordEl = createDiv({
      cls: [
        "carnelian-command-palette-item",
        item.lastUsed ? "carnelian-command-palette-item-lastused" : "",
      ],
    });

    recordEl.appendChild(
      createDiv({
        text: item.name,
      }),
    );
    recordEl.appendChild(
      createDiv({
        text: app.hotkeyManager.printHotkeyForCommand(item.id),
        cls: ["carnelian-command-palette-item__key"],
      }),
    );

    el.appendChild(recordEl);
  }

  onChooseSuggestion(item: HistoricalCommand, evt: MouseEvent | KeyboardEvent) {
    item.callback?.() ?? item.checkCallback?.(false);
    this.handleChooseItem(item);
  }
}
