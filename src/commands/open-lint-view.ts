import { ItemView, setIcon, type TFile, type WorkspaceLeaf } from "obsidian";
import { moveToOffset } from "src/lib/helpers/editors/basic";
import { getMarkdownFiles, openFile } from "src/lib/helpers/entries";
import { getOpenMarkdownFiles } from "src/lib/helpers/leaves";
import { notify, notifyValidationError } from "src/lib/helpers/ui";
import type { UApp } from "src/lib/types";
import { groupBy } from "src/lib/utils/collections";
import type { LintInspection } from "src/lib/utils/linter";
import { isMatchedGlobPatterns } from "src/lib/utils/strings";
import { inspectFile } from "src/services/lint-service";
import type { PluginSettings } from "src/settings";

declare let app: UApp;

export const LINT_VIEW_TYPE = "carnelian-lint";

type InspectionRecord = {
  file: TFile;
  inspection: LintInspection;
};
type LintInspectionLevel = LintInspection["level"];
type SummaryStat = {
  label: string;
  value: string | number;
  icon: string;
  level?: Lowercase<LintInspectionLevel>;
};

export async function openLintView(): Promise<void> {
  let leaf: WorkspaceLeaf | null =
    app.workspace.getLeavesOfType(LINT_VIEW_TYPE)[0] ?? null;
  if (!leaf) {
    leaf = app.workspace.getRightLeaf(false);
    if (!leaf) {
      notifyValidationError("サイドバーを開けませんでした");
      return;
    }
    await leaf.setViewState({
      type: LINT_VIEW_TYPE,
      active: true,
    });
  }

  await app.workspace.revealLeaf(leaf);
}

export class LintView extends ItemView {
  private readonly settings: PluginSettings["linter"];
  private inputEl!: HTMLInputElement;
  private runButtonEl!: HTMLButtonElement;
  private summaryTextEl!: HTMLElement;
  private levelSectionEl!: HTMLElement;
  private codeSectionEl!: HTMLElement;
  private resultEl!: HTMLElement;
  private excludedLevels = new Set<LintInspectionLevel>();
  private excludedCodes = new Set<string>();
  private lastCodeOrder: string[] = [];
  private lastTargetFileCount = 0;
  private lastRecords: InspectionRecord[] = [];
  private autoSyncEnabled = false;
  private unsetLintCompleteHandler!: () => void;

  constructor(leaf: WorkspaceLeaf, settings: PluginSettings["linter"]) {
    super(leaf);
    this.settings = settings;
  }

  getViewType(): string {
    return LINT_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Lint";
  }

  getIcon(): string {
    return "list-checks";
  }

  async onOpen(): Promise<void> {
    this.render();
    const ref = app.workspace.on(
      "carnelian:lint-complete" as any,
      (async (file: TFile, autofix: boolean) =>
        this.onFileLinted(file, autofix)) as any,
    );
    this.unsetLintCompleteHandler = () => app.workspace.offref(ref);
  }

  async onClose(): Promise<void> {
    this.unsetLintCompleteHandler?.();
  }

  private render(): void {
    const containerEl = this.containerEl.children[1];
    containerEl.empty();
    containerEl.addClass("carnelian-lint-view");

    const controlsEl = containerEl.createDiv({
      cls: "carnelian-lint-view__controls",
    });
    this.inputEl = controlsEl.createEl("input", {
      cls: "carnelian-lint-view__input",
      placeholder: "未入力: 開いているファイル / ex: Notes/**/*.md",
    });
    this.inputEl.addEventListener("keydown", (ev) => {
      if (ev.isComposing || ev.key !== "Enter") {
        return;
      }
      ev.preventDefault();
      this.runLint();
    });

    this.runButtonEl = controlsEl.createEl("button", {
      text: "実行",
      cls: "carnelian-lint-view__run-button",
    });
    this.runButtonEl.addEventListener("click", () => this.runLint());

    const autoSyncButtonEl = controlsEl.createEl("button", {
      cls: "clickable-icon carnelian-lint-view__auto-sync-button",
      attr: { "aria-label": "自動同期: OFF" },
    });
    setIcon(autoSyncButtonEl, "refresh-cw-off");
    autoSyncButtonEl.addEventListener("click", () => {
      this.autoSyncEnabled = !this.autoSyncEnabled;
      setIcon(
        autoSyncButtonEl,
        this.autoSyncEnabled ? "refresh-cw" : "refresh-cw-off",
      );
      autoSyncButtonEl.toggleClass(
        "carnelian-lint-view__auto-sync-button--active",
        this.autoSyncEnabled,
      );
      autoSyncButtonEl.setAttribute(
        "aria-label",
        `自動同期: ${this.autoSyncEnabled ? "ON" : "OFF"}`,
      );
    });

    this.summaryTextEl = containerEl.createDiv({
      cls: "carnelian-lint-view__summary-text",
    });
    this.summaryTextEl.createSpan({
      text: "実行してください (未入力の場合は開いているファイルが対象)",
      cls: "carnelian-lint-view__summary-placeholder",
    });
    this.levelSectionEl = containerEl.createDiv({
      cls: "carnelian-lint-view__section",
    });
    this.codeSectionEl = containerEl.createDiv({
      cls: "carnelian-lint-view__section",
    });
    this.resultEl = containerEl.createDiv({
      cls: "carnelian-lint-view__section carnelian-lint-view__result",
    });
  }

  private async runLint(options?: {
    silent?: boolean;
    autofixedFile?: TFile;
  }): Promise<void> {
    if (!this.settings) {
      notifyValidationError("Linter設定がありません");
      return;
    }

    const silent = options?.silent ?? false;
    const autofixedFile = options?.autofixedFile;
    const patterns = parsePatterns(this.inputEl.value);
    const targetFiles = (
      patterns.length === 0
        ? getOpenMarkdownFiles()
        : getMarkdownFiles().filter((file) =>
            isMatchedGlobPatterns(file.path, patterns, { nocase: true }),
          )
    ).toSorted((a, b) => a.path.localeCompare(b.path));

    if (targetFiles.length === 0) {
      this.renderEmptySummary("対象ファイルがありません");
      this.resultEl.empty();
      return;
    }

    if (!silent) {
      this.setRunning(true);
    }
    const notice =
      targetFiles.length >= 100
        ? notify(`${targetFiles.length}件のファイルをLint中...`)
        : null;
    const records: InspectionRecord[] = [];

    try {
      for (const file of targetFiles) {
        const inspections = await inspectFile(file, this.settings);
        for (const inspection of inspections) {
          if (autofixedFile?.path === file.path && inspection.fix) continue;
          records.push({ file, inspection });
        }
      }
    } finally {
      notice?.hide();
      if (!silent) {
        this.setRunning(false);
      }
    }

    this.lastTargetFileCount = targetFiles.length;
    this.lastRecords = records;
    this.lastCodeOrder = computeCodeOrder(records);
    this.renderResults();
  }

  private async onFileLinted(file: TFile, autofix: boolean): Promise<void> {
    if (!this.autoSyncEnabled) return;
    const patterns = parsePatterns(this.inputEl.value);
    if (patterns.length === 0) {
      if (!getOpenMarkdownFiles().some((f) => f.path === file.path)) return;
    } else {
      if (!isMatchedGlobPatterns(file.path, patterns, { nocase: true })) return;
    }
    await this.runLint({
      silent: true,
      autofixedFile: autofix ? file : undefined,
    });
  }

  private setRunning(running: boolean): void {
    this.inputEl.disabled = running;
    this.runButtonEl.disabled = running;
    this.runButtonEl.setText(running ? "実行中..." : "実行");
  }

  private renderResults() {
    const filteredRecords = this.filterRecords(this.lastRecords);
    const recordsByFilePath = groupBy(
      filteredRecords,
      (record) => record.file.path,
    );
    const allRecordsByFilePath = groupBy(
      this.lastRecords,
      (record) => record.file.path,
    );
    const affectedFileCount = Object.keys(allRecordsByFilePath).length;
    const visibleAffectedFileCount = Object.keys(recordsByFilePath).length;
    const errorCount = this.countByLevel("ERROR");
    const warnCount = this.countByLevel("WARN");
    const infoCount = this.countByLevel("INFO");

    this.renderSummary({
      targetFileCount: this.lastTargetFileCount,
      affectedFileCount,
      visibleAffectedFileCount,
      diagnosticCount: this.lastRecords.length,
      visibleDiagnosticCount: filteredRecords.length,
      errorCount,
      warnCount,
      infoCount,
    });
    this.resultEl.empty();
    const headingEl = this.resultEl.createDiv({
      cls: "carnelian-lint-view__section-heading carnelian-lint-view__section-heading--with-counts",
    });
    headingEl.createSpan({ text: "Results" });
    this.renderHeadingCounts(headingEl, filteredRecords);

    const bodyEl = this.resultEl.createDiv({
      cls: "carnelian-lint-view__result-body",
    });

    if (this.lastRecords.length === 0) {
      bodyEl.createDiv({
        text: "No diagnostics",
        cls: "carnelian-lint-view__empty",
      });
      return;
    }
    if (filteredRecords.length === 0) {
      bodyEl.createDiv({
        text: "No diagnostics matched the active filters",
        cls: "carnelian-lint-view__empty",
      });
      return;
    }

    for (const [filePath, fileRecords] of Object.entries(recordsByFilePath)) {
      const fileEl = bodyEl.createEl("details", {
        cls: "carnelian-lint-view__file",
      });
      fileEl.open = true;
      const fileSummaryEl = fileEl.createEl("summary", {
        cls: "carnelian-lint-view__file-summary",
      });
      fileSummaryEl.createSpan({
        text: fileRecords.length.toString(),
        cls: "carnelian-lint-view__file-count",
      });
      fileSummaryEl.createSpan({
        text: filePath,
        cls: "carnelian-lint-view__file-path",
      });

      const diagnosticsEl = fileEl.createDiv({
        cls: "carnelian-lint-view__diagnostics",
      });
      for (const record of fileRecords) {
        const diagnosticEl = diagnosticsEl.createDiv({
          cls: [
            "carnelian-lint-view__diagnostic",
            `carnelian-lint-view__diagnostic--${record.inspection.level.toLowerCase()}`,
            record.inspection.lineNo == null
              ? ""
              : "carnelian-lint-view__diagnostic--with-line",
          ],
        });
        diagnosticEl.addEventListener("click", () => openInspection(record));

        diagnosticEl.createDiv({
          text: record.inspection.level,
          cls: "carnelian-lint-view__diagnostic-level",
        });
        diagnosticEl.createDiv({
          text: formatDiagnostic(record.inspection),
          cls: "carnelian-lint-view__diagnostic-text",
        });
        if (record.inspection.lineNo != null) {
          diagnosticEl.createDiv({
            text: `L${record.inspection.lineNo}`,
            cls: "carnelian-lint-view__diagnostic-line",
          });
        }
      }
    }
  }

  private renderHeadingCounts(
    parent: HTMLElement,
    records: InspectionRecord[],
  ): void {
    const countsEl = parent.createDiv({
      cls: "carnelian-lint-view__heading-counts",
    });
    const levelStats: {
      level: Lowercase<LintInspectionLevel>;
      icon: string;
    }[] = [
      { level: "error", icon: "⛔" },
      { level: "warn", icon: "⚠️" },
      { level: "info", icon: "ℹ️" },
    ];
    for (const { level, icon } of levelStats) {
      const count = records.filter(
        (record) => record.inspection.level === levelFromLowercase(level),
      ).length;
      if (count === 0) {
        continue;
      }
      const countEl = countsEl.createSpan({
        cls: `carnelian-lint-view__heading-count carnelian-lint-view__heading-count--${level}`,
      });
      countEl.createSpan({
        text: icon,
        cls: "carnelian-lint-view__heading-count-icon",
      });
      countEl.createSpan({
        text: `${count}`,
        cls: "carnelian-lint-view__heading-count-value",
      });
    }
  }

  private filterRecords(records: InspectionRecord[]): InspectionRecord[] {
    return records.filter(
      (record) =>
        !this.excludedCodes.has(record.inspection.code) &&
        !this.excludedLevels.has(record.inspection.level),
    );
  }

  private countByLevel(level: LintInspectionLevel): number {
    return this.lastRecords.filter(
      (record) => record.inspection.level === level,
    ).length;
  }

  private toggleExcludedLevel(level: LintInspectionLevel): void {
    if (this.excludedLevels.has(level)) {
      this.excludedLevels.delete(level);
    } else {
      this.excludedLevels.add(level);
    }
    this.renderResults();
  }

  private toggleExcludedCode(code: string): void {
    if (this.excludedCodes.has(code)) {
      this.excludedCodes.delete(code);
    } else {
      this.excludedCodes.add(code);
    }
    this.renderResults();
  }

  private toggleAllCodes(): void {
    const allExcluded = this.lastCodeOrder.every((code) =>
      this.excludedCodes.has(code),
    );
    if (allExcluded) {
      for (const code of this.lastCodeOrder) {
        this.excludedCodes.delete(code);
      }
    } else {
      for (const code of this.lastCodeOrder) {
        this.excludedCodes.add(code);
      }
    }
    this.renderResults();
  }

  private isFiltering(): boolean {
    return this.excludedLevels.size > 0 || this.excludedCodes.size > 0;
  }

  private renderEmptySummary(message: string): void {
    this.summaryTextEl.empty();
    this.summaryTextEl.createSpan({
      text: message,
      cls: "carnelian-lint-view__summary-placeholder",
    });
    this.levelSectionEl.empty();
    this.codeSectionEl.empty();
  }

  private renderSummary(summary: {
    targetFileCount: number;
    affectedFileCount: number;
    visibleAffectedFileCount: number;
    diagnosticCount: number;
    visibleDiagnosticCount: number;
    errorCount: number;
    warnCount: number;
    infoCount: number;
  }): void {
    this.renderSummaryText(summary);
    this.renderLevelSection(summary);
    this.renderCodeSection();
  }

  private renderSummaryText(summary: {
    targetFileCount: number;
    affectedFileCount: number;
    visibleAffectedFileCount: number;
    diagnosticCount: number;
    visibleDiagnosticCount: number;
  }): void {
    this.summaryTextEl.empty();
    const filtering = this.isFiltering();
    const affected = formatFilteredCount(
      summary.visibleAffectedFileCount,
      summary.affectedFileCount,
      filtering,
    );
    const diagnostics = formatFilteredCount(
      summary.visibleDiagnosticCount,
      summary.diagnosticCount,
      filtering,
    );

    const sentenceEl = this.summaryTextEl.createSpan({
      cls: "carnelian-lint-view__summary-sentence",
    });
    const appendValue = (value: string | number): void => {
      sentenceEl.createSpan({
        text: `${value}`,
        cls: "carnelian-lint-view__summary-value",
      });
    };

    appendValue(diagnostics);
    sentenceEl.appendText(" detected (");
    appendValue(affected);
    sentenceEl.appendText(" affected files / ");
    appendValue(summary.targetFileCount);
    sentenceEl.appendText(" total)");
  }

  private renderLevelSection(summary: {
    errorCount: number;
    warnCount: number;
    infoCount: number;
  }): void {
    this.levelSectionEl.empty();
    this.levelSectionEl.createDiv({
      text: "Levels",
      cls: "carnelian-lint-view__section-heading",
    });
    const levelStats: SummaryStat[] = [
      { label: "Error", value: summary.errorCount, icon: "⛔", level: "error" },
      { label: "Warn", value: summary.warnCount, icon: "⚠️", level: "warn" },
      { label: "Info", value: summary.infoCount, icon: "ℹ️", level: "info" },
    ];
    this.renderStatChips(this.levelSectionEl, levelStats);
  }

  private renderCodeSection(): void {
    this.codeSectionEl.empty();
    if (this.lastCodeOrder.length === 0) {
      return;
    }
    const headingEl = this.codeSectionEl.createDiv({
      cls: "carnelian-lint-view__section-heading carnelian-lint-view__section-heading--with-action",
    });
    headingEl.createSpan({ text: "Codes" });
    const allExcluded = this.lastCodeOrder.every((code) =>
      this.excludedCodes.has(code),
    );
    const toggleAllEl = headingEl.createEl("button", {
      text: allExcluded ? "全てON" : "全てOFF",
      cls: "carnelian-lint-view__toggle-all",
    });
    toggleAllEl.addEventListener("click", () => this.toggleAllCodes());

    const countByCode = new Map<string, number>();
    for (const record of this.lastRecords) {
      if (this.excludedLevels.has(record.inspection.level)) {
        continue;
      }
      const code = record.inspection.code;
      countByCode.set(code, (countByCode.get(code) ?? 0) + 1);
    }

    const rowEl = this.codeSectionEl.createDiv({
      cls: "carnelian-lint-view__summary-row",
    });
    for (const code of this.lastCodeOrder) {
      const count = countByCode.get(code) ?? 0;
      if (count === 0) {
        continue;
      }
      const excluded = this.excludedCodes.has(code);
      const chipEl = rowEl.createEl("button", {
        cls: [
          "carnelian-lint-view__stat",
          "carnelian-lint-view__stat--code",
          excluded ? "carnelian-lint-view__stat--excluded" : "",
        ].filter((x) => x.length > 0),
      });
      chipEl.addEventListener("click", () => this.toggleExcludedCode(code));
      chipEl.createSpan({
        text: code,
        cls: "carnelian-lint-view__stat-label",
      });
      chipEl.createSpan({
        text: `${count}`,
        cls: "carnelian-lint-view__stat-value",
      });
    }
  }

  private renderStatChips(parent: HTMLElement, stats: SummaryStat[]): void {
    const rowEl = parent.createDiv({
      cls: "carnelian-lint-view__summary-row",
    });

    for (const stat of stats) {
      const statEl = rowEl.createEl(stat.level ? "button" : "div", {
        cls: [
          "carnelian-lint-view__stat",
          stat.level ? `carnelian-lint-view__stat--${stat.level}` : "",
          stat.level && this.isLevelExcluded(stat.level)
            ? "carnelian-lint-view__stat--excluded"
            : "",
        ].filter((x) => x.length > 0),
      });
      if (stat.level) {
        statEl.addEventListener("click", () =>
          this.toggleExcludedLevel(levelFromLowercase(stat.level!)),
        );
      }
      statEl.createSpan({
        text: stat.icon,
        cls: "carnelian-lint-view__stat-icon",
      });
      statEl.createSpan({
        text: stat.label,
        cls: "carnelian-lint-view__stat-label",
      });
      statEl.createSpan({
        text: `${stat.value}`,
        cls: "carnelian-lint-view__stat-value",
      });
    }
  }

  private isLevelExcluded(level: Lowercase<LintInspectionLevel>): boolean {
    return this.excludedLevels.has(levelFromLowercase(level));
  }
}

function formatFilteredCount(
  visibleCount: number,
  totalCount: number,
  filtering: boolean,
): string | number {
  return filtering ? `${visibleCount}/${totalCount}` : totalCount;
}

function computeCodeOrder(records: InspectionRecord[]): string[] {
  const countByCode = new Map<string, number>();
  for (const record of records) {
    const code = record.inspection.code;
    countByCode.set(code, (countByCode.get(code) ?? 0) + 1);
  }
  return [...countByCode.entries()]
    .sort(
      ([codeA, countA], [codeB, countB]) =>
        countB - countA || codeA.localeCompare(codeB),
    )
    .map(([code]) => code);
}

function levelFromLowercase(
  level: Lowercase<LintInspectionLevel>,
): LintInspectionLevel {
  return level.toUpperCase() as LintInspectionLevel;
}

function parsePatterns(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((x) => x.trim())
    .filter((x) => x.length > 0);
}

async function openInspection(record: InspectionRecord): Promise<void> {
  await openFile(record.file.path);
  if (record.inspection.offset == null) {
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, 100));
  moveToOffset(record.inspection.offset, { scrollToCenter: true });
}

function formatDiagnostic(inspection: LintInspection): string {
  return `${inspection.code}: ${inspection.message}`;
}
