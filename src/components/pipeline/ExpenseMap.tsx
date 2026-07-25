import { usePipeline } from "../../state/PipelineContext";
import { CATEGORY_COLOR_VARS } from "../../types/pipeline";
import { AU } from "../../utils/format";
import type { CSSProperties } from "react";
import type { CategoryBucket, ExpenseCategory, PipelineResult } from "../../types/pipeline";
import { ComplianceScoreCard } from "./ComplianceScoreCard";
import { JournalEntryPanel } from "./JournalEntryPanel";
import { ThresholdConfigurator } from "./ThresholdConfigurator";

const styles: Record<string, CSSProperties> = {
  wrap: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--space-7)",
    boxShadow: "var(--shadow-sm)",
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-5)",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "var(--space-4)",
  },
  headerText: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-1)",
  },
  stepBadge: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-accent-deep)",
    letterSpacing: "var(--tracking-widest)",
    textTransform: "uppercase" as const,
    fontWeight: 500,
  },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: "var(--text-2xl)",
    color: "var(--color-ink-strong)",
    lineHeight: 1.1,
    letterSpacing: "var(--tracking-tight)",
  },
  subtitle: {
    fontSize: "var(--text-sm)",
    color: "var(--color-ink-muted)",
    lineHeight: 1.5,
    maxWidth: 520,
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-3)",
  },
  exportBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--space-2)",
    padding: "var(--space-3) var(--space-4)",
    background: "var(--color-ink-strong)",
    color: "var(--color-paper)",
    border: "none",
    borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-sm)",
    fontWeight: 600,
    letterSpacing: "var(--tracking-tight)",
    cursor: "pointer",
    transition: "all var(--duration-base) var(--ease-out)",
    boxShadow: "var(--shadow-sm)",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "var(--space-4)",
  },
  summaryCard: {
    background: "var(--color-surface-sunken)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-4)",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  summaryLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-wider)",
    textTransform: "uppercase" as const,
  },
  summaryValue: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-2xl)",
    fontWeight: 600,
    color: "var(--color-ink-strong)",
    lineHeight: 1,
    letterSpacing: "var(--tracking-tight)",
    fontVariantNumeric: "tabular-nums" as const,
  },
  summarySub: {
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-subtle)",
  },
  treemap: {
    display: "grid",
    gridTemplateColumns: "repeat(12, 1fr)",
    gridAutoRows: "minmax(56px, auto)",
    gap: "var(--space-2)",
  },
  treemapBlock: {
    borderRadius: "var(--radius-md)",
    padding: "var(--space-4)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    cursor: "default",
    position: "relative",
    overflow: "hidden",
    minHeight: 80,
    transition: "all var(--duration-base) var(--ease-out)",
  },
  treemapLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    letterSpacing: "var(--tracking-widest)",
    textTransform: "uppercase" as const,
    fontWeight: 600,
    opacity: 0.9,
  },
  treemapAmount: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-2xl)",
    fontWeight: 600,
    lineHeight: 1,
    letterSpacing: "var(--tracking-tight)",
    fontVariantNumeric: "tabular-nums" as const,
  },
  treemapMeta: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    opacity: 0.75,
  },
  barRow: {
    display: "grid",
    gridTemplateColumns: "120px 1fr 80px",
    alignItems: "center",
    gap: "var(--space-3)",
  },
  barLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-sm)",
    fontWeight: 600,
    color: "var(--color-ink)",
    letterSpacing: "var(--tracking-wide)",
  },
  barTrack: {
    height: 14,
    background: "var(--color-surface-sunken)",
    borderRadius: "var(--radius-full)",
    overflow: "hidden",
    border: "1px solid var(--color-border)",
  },
  barFill: {
    height: "100%",
    borderRadius: "var(--radius-full)",
    transition: "width var(--duration-slow) var(--ease-out)",
  },
  barAmount: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-sm)",
    color: "var(--color-ink-strong)",
    textAlign: "right" as const,
    fontVariantNumeric: "tabular-nums" as const,
    fontWeight: 600,
  },
  flagCard: {
    background: "var(--color-warning-soft)",
    border: "1px solid var(--color-warning)",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-3) var(--space-4)",
    display: "flex",
    alignItems: "center",
    gap: "var(--space-3)",
  },
  flagText: {
    fontSize: "var(--text-sm)",
    color: "var(--color-ink)",
  },
  flagRule: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-warning)",
    textTransform: "uppercase" as const,
    letterSpacing: "var(--tracking-widest)",
    fontWeight: 600,
  },
  flagOk: {
    background: "var(--color-success-soft)",
    borderColor: "var(--color-success)",
  },
  flagOkText: {
    color: "var(--color-success)",
  },
  empty: {
    padding: "var(--space-9)",
    textAlign: "center",
    color: "var(--color-ink-muted)",
    fontStyle: "italic",
    background: "var(--color-surface-sunken)",
    borderRadius: "var(--radius-md)",
    border: "1px dashed var(--color-border)",
  },
};

function treemapGridFor(bucket: CategoryBucket, max: number): { col: number; row: number } {
  const ratio = bucket.total / max;
  if (ratio >= 0.45) return { col: 6, row: 2 };
  if (ratio >= 0.3) return { col: 6, row: 1 };
  if (ratio >= 0.18) return { col: 4, row: 1 };
  if (ratio >= 0.1) return { col: 3, row: 1 };
  if (ratio >= 0.05) return { col: 3, row: 1 };
  return { col: 2, row: 1 };
}

export function ExpenseMap() {
  const { lastResult, exportExpenseMap, selectedReceipt, runChain, nodes, isExecuting } = usePipeline();

  if (!lastResult) {
    return (
      <div style={styles.wrap}>
        <div style={styles.header}>
          <div style={styles.headerText}>
            <span style={styles.stepBadge}>STEP 04 — EXPENSE MAP</span>
            <h3 style={styles.title}>Visual expense report</h3>
            <p style={styles.subtitle}>
              After running the chain, the categorised totals are visualised here. Color-coded
              blocks scale with spend per category; export the result as JSON.
            </p>
          </div>
        </div>
        <div style={styles.empty}>
          {nodes.length === 0
            ? "Build a chain and run it to see the expense map."
            : "Click Run chain to generate the report."}
          {nodes.length > 0 && (
            <div style={{ marginTop: "var(--space-3)" }}>
              <button
                type="button"
                onClick={runChain}
                disabled={!selectedReceipt || isExecuting}
                style={{
                  ...styles.exportBtn,
                  opacity: !selectedReceipt ? 0.5 : 1,
                  cursor: !selectedReceipt ? "not-allowed" : "pointer",
                }}
              >
                Run chain now
              </button>
              {!selectedReceipt && (
                <div
                  style={{
                    marginTop: "var(--space-2)",
                    color: "var(--color-warning)",
                    fontSize: "var(--text-xs)",
                  }}
                >
                  Select a receipt first.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  const { byCategory, totalExpenses, totalItems, policyFlags, cashOutDetected, cashOutReason } = lastResult;
  const max = Math.max(...byCategory.map((b) => b.total), 0.01);

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.headerText}>
          <span style={styles.stepBadge}>STEP 04 — EXPENSE MAP</span>
          <h3 style={styles.title}>Visual expense report</h3>
          <p style={styles.subtitle}>
            Color-coded treemap, sorted by total. Export the full structure as JSON.
          </p>
        </div>
        <div style={styles.actions}>
          <button type="button" style={styles.exportBtn} onClick={exportExpenseMap}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M7 2v8m0 0L4 7m3 3l3-3M2 12h10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Export JSON
          </button>
        </div>
      </div>

      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Total expenses</span>
          <span style={styles.summaryValue}>{AU.currency(totalExpenses)}</span>
          <span style={styles.summarySub}>Sum of all categorised items</span>
        </div>
        <div style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Categories</span>
          <span style={styles.summaryValue}>{byCategory.length}</span>
          <span style={styles.summarySub}>Active expense buckets</span>
        </div>
        <div style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Line items</span>
          <span style={styles.summaryValue}>{totalItems}</span>
          <span style={styles.summarySub}>Categorised by pipeline</span>
        </div>
        <div
          style={{
            ...styles.summaryCard,
            background: cashOutDetected ? "var(--color-warning-soft)" : "var(--color-success-soft)",
            borderColor: cashOutDetected ? "var(--color-warning)" : "var(--color-success)",
          }}
        >
          <span style={styles.summaryLabel}>Cash-out</span>
          <span
            style={{
              ...styles.summaryValue,
              color: cashOutDetected ? "var(--color-warning)" : "var(--color-success)",
            }}
          >
            {cashOutDetected ? "Detected" : "Clear"}
          </span>
          {cashOutDetected && cashOutReason && cashOutReason !== "none" && (
            <span style={styles.summarySub}>
              {cashOutReason === "card_change" ? "card + cash change" : cashOutReason === "explicit" ? "explicit line item" : "implied amount"}
            </span>
          )}
        </div>
      </div>

      {byCategory.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <div className="eyebrow" style={{ paddingLeft: 4 }}>Treemap view</div>
          <div style={styles.treemap}>
            {byCategory.map((bucket) => {
              const cat = bucket.category as ExpenseCategory;
              const colors = CATEGORY_COLOR_VARS[cat];
              const { col, row } = treemapGridFor(bucket, max);
              return (
                <div
                  key={cat}
                  style={{
                    ...styles.treemapBlock,
                    gridColumn: `span ${col}`,
                    gridRow: `span ${row}`,
                    background: colors.bg,
                    color: colors.fg,
                    border: `1px solid ${colors.fg}`,
                  }}
                >
                  <div style={styles.treemapLabel}>{cat}</div>
                  <div style={styles.treemapAmount}>{AU.currency(bucket.total)}</div>
                  <div style={styles.treemapMeta}>
                    {bucket.count} item{bucket.count === 1 ? "" : "s"} ·{" "}
                    {((bucket.total / totalExpenses) * 100).toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {byCategory.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <div className="eyebrow" style={{ paddingLeft: 4 }}>Bar comparison</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {byCategory.map((bucket) => {
              const cat = bucket.category as ExpenseCategory;
              const colors = CATEGORY_COLOR_VARS[cat];
              const pct = (bucket.total / max) * 100;
              return (
                <div key={cat} style={styles.barRow}>
                  <span style={{ ...styles.barLabel, color: colors.fg }}>{cat}</span>
                  <div style={styles.barTrack}>
                    <div
                      style={{
                        ...styles.barFill,
                        width: `${pct}%`,
                        background: colors.fg,
                      }}
                    />
                  </div>
                  <span style={styles.barAmount}>{AU.currency(bucket.total)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <div className="eyebrow" style={{ paddingLeft: 4 }}>Policy compliance</div>
        {policyFlags.length === 0 ? (
          <div
            style={{
              ...styles.flagCard,
              ...styles.flagOk,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--color-success)",
              }}
            />
            <div>
              <div style={{ ...styles.flagRule, ...styles.flagOkText }}>All checks passed</div>
              <div style={styles.flagText}>Receipt complies with the configured policy.</div>
            </div>
          </div>
        ) : (
          policyFlags.map((flag, i) => (
            <div key={`${flag.rule}-${i}`} style={styles.flagCard}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--color-warning)",
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={styles.flagRule}>{flag.rule}</div>
                <div style={styles.flagText}>{flag.message}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {lastResult.complianceSummary && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <div className="eyebrow" style={{ paddingLeft: 4 }}>Scoring &amp; journal</div>
          <ComplianceScoreCard summary={lastResult.complianceSummary} />
          <ThresholdConfigurator />
          <JournalEntryPanel />
        </div>
      )}
    </div>
  );
}
