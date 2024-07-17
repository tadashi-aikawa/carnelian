import { type Command, SuggestModal } from "obsidian";
import { getAvailableCommands } from "src/lib/helpers/commands";
import { now } from "src/lib/helpers/datetimes";
import { loadJson, saveJson } from "src/lib/helpers/io";
import type { UApp } from "src/lib/types";
import { maxReducer } from "src/lib/utils/collections";
import { omitBy, sorter } from "src/lib/utils/collections";
import { microFuzzy } from "src/lib/utils/strings";
import { isPresent } from "src/lib/utils/types";

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
  const unixNow = now("unixtime");
  let commandHistoryMap =
    (await loadJson<CommandHistoryMap>(args.commandHistoryPath)) ?? {};
  // 最終コマンド利用日から3日以上経っているものは履歴から除外
  commandHistoryMap = omitBy(
    commandHistoryMap,
    (_, lastUpdated: number) => unixNow - lastUpdated > 3 * 24 * 60 * 60,
  );

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
        results: query
          .split(" ")
          .filter(isPresent)
          .map((q) => microFuzzy(command.name.toLowerCase(), q.toLowerCase())),
      }))
      .filter(({ results }) => results.every((r) => r.type !== "none"))
      .map(({ command, results }) => ({
        command,
        result: results.reduce(maxReducer((x) => x.score)),
      }))
      .filter(({ result }) => result.type !== "none")
      .toSorted(sorter(({ result }) => result.score, "desc"))
      .toSorted(sorter(({ command }) => command.lastUsed ?? 0, "desc"))
      .toSorted(sorter(({ result }) => result.type === "includes", "desc"))
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
