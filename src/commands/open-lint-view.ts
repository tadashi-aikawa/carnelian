import { ItemView, type TFile, type WorkspaceLeaf } from "obsidian";
import { moveToOffset } from "src/lib/helpers/editors/basic";
import { getMarkdownFiles, openFile } from "src/lib/helpers/entries";
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
  private summaryEl!: HTMLElement;
  private resultEl!: HTMLElement;
  private activeFilterLevels = new Set<LintInspectionLevel>();
  private lastTargetFileCount = 0;
  private lastRecords: InspectionRecord[] = [];

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
      placeholder: "ex: Notes/**/*.md, 📘Articles/**/*.md",
      value: "**/*.md",
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

    this.summaryEl = containerEl.createDiv({
      cls: "carnelian-lint-view__summary",
    });
    this.summaryEl.createDiv({
      text: "Path glob pattern を指定して実行してください",
      cls: "carnelian-lint-view__summary-placeholder",
    });
    this.resultEl = containerEl.createDiv({
      cls: "carnelian-lint-view__result",
    });
  }

  private async runLint(): Promise<void> {
    if (!this.settings) {
      notifyValidationError("Linter設定がありません");
      return;
    }

    const patterns = parsePatterns(this.inputEl.value);
    const targetFiles = getMarkdownFiles()
      .filter((file) =>
        patterns.length === 0
          ? true
          : isMatchedGlobPatterns(file.path, patterns),
      )
      .toSorted((a, b) => a.path.localeCompare(b.path));

    if (targetFiles.length === 0) {
      this.renderEmptySummary("対象ファイルがありません");
      this.resultEl.empty();
      return;
    }

    this.setRunning(true);
    const notice = notify(`${targetFiles.length}件のファイルをLint中...`);
    const records: InspectionRecord[] = [];

    try {
      for (const file of targetFiles) {
        const inspections = await inspectFile(file, this.settings);
        for (const inspection of inspections) {
          records.push({ file, inspection });
        }
      }
    } finally {
      notice.hide();
      this.setRunning(false);
    }

    this.lastTargetFileCount = targetFiles.length;
    this.lastRecords = records;
    this.renderResults();
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

    if (this.lastRecords.length === 0) {
      this.resultEl.createDiv({
        text: "No diagnostics",
        cls: "carnelian-lint-view__empty",
      });
      return;
    }
    if (filteredRecords.length === 0) {
      this.resultEl.createDiv({
        text: "No diagnostics matched the active filters",
        cls: "carnelian-lint-view__empty",
      });
      return;
    }

    for (const [filePath, fileRecords] of Object.entries(recordsByFilePath)) {
      const fileEl = this.resultEl.createEl("details", {
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
      }
    }
  }

  private filterRecords(records: InspectionRecord[]): InspectionRecord[] {
    if (this.activeFilterLevels.size === 0) {
      return records;
    }
    return records.filter((record) =>
      this.activeFilterLevels.has(record.inspection.level),
    );
  }

  private countByLevel(level: LintInspectionLevel): number {
    return this.lastRecords.filter(
      (record) => record.inspection.level === level,
    ).length;
  }

  private toggleFilterLevel(level: LintInspectionLevel): void {
    if (this.activeFilterLevels.has(level)) {
      this.activeFilterLevels.delete(level);
    } else {
      this.activeFilterLevels.add(level);
    }
    this.renderResults();
  }

  private isFiltering(): boolean {
    return this.activeFilterLevels.size > 0;
  }

  private renderEmptySummary(message: string): void {
    this.summaryEl.empty();
    this.summaryEl.createDiv({
      text: message,
      cls: "carnelian-lint-view__summary-placeholder",
    });
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
    this.summaryEl.empty();
    const fileStats: SummaryStat[] = [
      { label: "Files", value: summary.targetFileCount, icon: "📄" },
      {
        label: "Affected",
        value: formatFilteredCount(
          summary.visibleAffectedFileCount,
          summary.affectedFileCount,
          this.isFiltering(),
        ),
        icon: "📌",
      },
    ];
    const diagnosticStats: SummaryStat[] = [
      {
        label: "Diagnostics",
        value: formatFilteredCount(
          summary.visibleDiagnosticCount,
          summary.diagnosticCount,
          this.isFiltering(),
        ),
        icon: "🧪",
      },
      { label: "Error", value: summary.errorCount, icon: "⛔", level: "error" },
      { label: "Warn", value: summary.warnCount, icon: "⚠️", level: "warn" },
      { label: "Info", value: summary.infoCount, icon: "ℹ️", level: "info" },
    ];

    this.renderSummaryRow(fileStats);
    this.renderSummaryRow(diagnosticStats);
  }

  private renderSummaryRow(stats: SummaryStat[]): void {
    const rowEl = this.summaryEl.createDiv({
      cls: "carnelian-lint-view__summary-row",
    });

    for (const stat of stats) {
      const statEl = rowEl.createEl(stat.level ? "button" : "div", {
        cls: [
          "carnelian-lint-view__stat",
          stat.level ? `carnelian-lint-view__stat--${stat.level}` : "",
          stat.level && this.isLevelFilterActive(stat.level)
            ? "carnelian-lint-view__stat--active"
            : "",
        ].filter((x) => x.length > 0),
      });
      if (stat.level) {
        statEl.addEventListener("click", () =>
          this.toggleFilterLevel(levelFromLowercase(stat.level!)),
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

  private isLevelFilterActive(level: Lowercase<LintInspectionLevel>): boolean {
    return this.activeFilterLevels.has(levelFromLowercase(level));
  }
}

function formatFilteredCount(
  visibleCount: number,
  totalCount: number,
  filtering: boolean,
): string | number {
  return filtering ? `${visibleCount}/${totalCount}` : totalCount;
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
  const location = inspection.lineNo == null ? "" : `L${inspection.lineNo} `;
  return `${location}${inspection.code}: ${inspection.message}`;
}
