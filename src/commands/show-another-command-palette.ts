import type { Command } from "obsidian";
import { getAvailableCommands } from "src/lib/helpers/commands";
import { AbstractSuggestionModal } from "src/lib/helpers/components/AbstractSuggestionModal";
import { now } from "src/lib/helpers/datetimes";
import { loadJson, saveJson } from "src/lib/helpers/io";
import { copyToClipboard, notify } from "src/lib/helpers/ui";
import type { UApp } from "src/lib/types";
import { maxReducer } from "src/lib/utils/collections";
import { omitBy, sorter } from "src/lib/utils/collections";
import { isPresent } from "src/lib/utils/guard";
import { isMod } from "src/lib/utils/keys";
import { microFuzzy } from "src/lib/utils/strings";

// XXX: 少し気持ち悪い
declare let app: UApp;

type HistoricalCommand = Command & {
  lastUsed?: number;
  /* 最優先で上位に表示するか */
  topPriority?: boolean;
};

type CommandId = string;
interface CommandHistoryMap {
  lastUsedMap: { [id: CommandId]: number };
  queryUsedMap: { [query: string]: CommandId };
}

/**
 * もう1つのコマンドパレットを表示
 */
export async function showAnotherCommandPalette(args: {
  commandHistoryPath: string;
}): Promise<void> {
  const unixNow = now("unixtime");
  const { lastUsedMap: _lastUsedMap = {}, queryUsedMap = {} } =
    (await loadJson<CommandHistoryMap>(args.commandHistoryPath)) ?? {};

  // 最終コマンド利用日から10日以上経っているものは履歴から除外
  const lastUsedMap = omitBy(
    _lastUsedMap,
    (_, lastUpdated: number) => unixNow - lastUpdated > 10 * 24 * 60 * 60,
  );

  const commands: HistoricalCommand[] = getAvailableCommands().map((x) => ({
    ...x,
    lastUsed: lastUsedMap[x.id],
  }));

  new CommandQuickSwitcher(app, commands, queryUsedMap, async (item, query) => {
    lastUsedMap[item.id] = now("unixtime");
    queryUsedMap[query] = item.id;

    await saveJson(
      args.commandHistoryPath,
      { lastUsedMap, queryUsedMap },
      {
        overwrite: true,
      },
    );
  }).open();
}

class CommandQuickSwitcher extends AbstractSuggestionModal<HistoricalCommand> {
  query = "";

  constructor(
    app: UApp,
    private commands: HistoricalCommand[],
    private queryUsedMap: CommandHistoryMap["queryUsedMap"],
    private handleChooseItem: (item: HistoricalCommand, query: string) => any,
  ) {
    super(app);

    this.registerKeyMap(["Mod"], "enter", async (evt) => {
      const item = this.getSelectedItem();
      if (!item) {
        return;
      }
      if (isMod(evt)) {
        await copyToClipboard(item.id);
        notify(`Copied command ID to clipboard: ${item.id}`);
        this.close();
      }
    });
  }

  toKey(item: HistoricalCommand): string {
    return item.id;
  }

  getSuggestions(query: string): HistoricalCommand[] {
    this.query = query;
    return this.commands
      .map((command) => ({
        command:
          this.queryUsedMap[query] === command.id
            ? { ...command, topPriority: true }
            : command,
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
      .filter(
        ({ result }) =>
          !query || result.type !== "fuzzy" || result.score > 0.25,
      )
      .toSorted(sorter(({ result }) => result.score, "desc"))
      .toSorted(sorter(({ command }) => command.lastUsed ?? 0, "desc"))
      .toSorted(
        sorter(
          ({ result }) =>
            result.type === "includes" || result.type === "starts-with",
          "desc",
        ),
      )
      .toSorted(sorter(({ command }) => command.lastUsed != null, "desc"))
      .toSorted(sorter(({ command }) => command.topPriority ?? false, "desc"))
      .map(({ command }) => command);
  }

  renderSuggestion(item: HistoricalCommand, el: HTMLElement): void {
    const recordEl = createDiv({
      cls: [
        "carnelian-command-palette-item",
        item.lastUsed ? "carnelian-command-palette-item-lastused" : "",
        item.topPriority ? "carnelian-command-palette-item-top-priority" : "",
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
    this.handleChooseItem(item, this.query);
  }
}
