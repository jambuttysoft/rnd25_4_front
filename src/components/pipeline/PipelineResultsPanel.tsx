import { useMemo } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { usePipeline } from "../../state/PipelineContext";
import { CATEGORY_COLOR_VARS } from "../../types/pipeline";
import { AU } from "../../utils/format";
import type { ExpenseCategory, PipelineResult } from "../../types/pipeline";

const styles: Record<string, CSSProperties> = {
  wrap: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--space-6)",
    boxShadow: "var(--shadow-sm)",
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-5)",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "var(--space-4)",
  },
  headerText: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-1)",
  },
  eyebrow: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-accent-deep)",
    letterSpacing: "var(--tracking-widest)",
    textTransform: "uppercase" as const,
    fontWeight: 500,
  },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: "var(--text-xl)",
    color: "var(--color-ink-strong)",
    lineHeight: 1.1,
    letterSpacing: "var(--tracking-tight)",
    margin: 0,
  },
  subtitle: {
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    lineHeight: 1.5,
    maxWidth: 560,
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "var(--space-3)",
  },
  summaryCard: {
    background: "var(--color-surface-sunken)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-3) var(--space-4)",
    display: "flex",
    flexDirection: "column",
    gap: 2,
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
    fontSize: "var(--text-lg)",
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
  bars: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-2)",
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
    letterSpacing: "var(--tracking-wide)",
  },
  barTrack: {
    height: 12,
    background: "var(--color-surface-sunken)",
    borderRadius: "var(--radius-full)",
    overflow: "hidden",
    border: "1px solid var(--color-border)",
  },
  barFill: {
    height: "100%",
    borderRadius: "var(--radius-full)",
    transition: "width var(--duration-slower) var(--ease-out)",
  },
  barAmount: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-sm)",
    color: "var(--color-ink-strong)",
    textAlign: "right" as const,
    fontVariantNumeric: "tabular-nums" as const,
    fontWeight: 600,
  },
  flags: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-2)",
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
  flagOk: {
    background: "var(--color-success-soft)",
    borderColor: "var(--color-success)",
  },
  flagDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
  },
  flagBody: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    minWidth: 0,
  },
  flagRule: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    textTransform: "uppercase" as const,
    letterSpacing: "var(--tracking-widest)",
    fontWeight: 600,
  },
  flagMessage: {
    fontSize: "var(--text-sm)",
    color: "var(--color-ink)",
    lineHeight: 1.4,
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: "var(--space-4)",
    borderTop: "1px solid var(--color-border)",
    gap: "var(--space-4)",
  },
  footerText: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    minWidth: 0,
  },
  footerLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-wider)",
    textTransform: "uppercase" as const,
  },
  footerHint: {
    fontSize: "var(--text-sm)",
    color: "var(--color-ink)",
    lineHeight: 1.4,
  },
  footerLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--space-2)",
    padding: "var(--space-2) var(--space-4)",
    background: "var(--color-ink-strong)",
    color: "var(--color-paper)",
    borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-sm)",
    fontWeight: 600,
    letterSpacing: "var(--tracking-tight)",
    textDecoration: "none",
    flexShrink: 0,
    transition: "all var(--duration-base) var(--ease-out)",
    boxShadow: "var(--shadow-sm)",
  },
  loadingWrap: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--space-5) var(--space-6)",
    boxShadow: "var(--shadow-sm)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "var(--space-4)",
  },
  loadingText: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    minWidth: 0,
  },
  loadingTitle: {
    fontFamily: "var(--font-display)",
    fontSize: "var(--text-lg)",
    color: "var(--color-ink-strong)",
    lineHeight: 1.1,
    letterSpacing: "var(--tracking-tight)",
  },
  loadingSub: {
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
  },
  spinner: {
    width: 18,
    height: 18,
    borderRadius: "50%",
    border: "2px solid var(--color-border-strong)",
    borderTopColor: "var(--color-accent-deep)",
    animation: "spin 0.8s linear infinite",
    flexShrink: 0,
  },
};

const ENTER_KEYFRAMES = `
@keyframes pipelineResultsEnter {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.pipeline-results-enter {
  animation: pipelineResultsEnter 420ms var(--ease-out) both;
}
`;

function LoadingPanel() {
  return (
    <div style={styles.loadingWrap} aria-live="polite">
      <div style={styles.loadingText}>
        <span style={styles.eyebrow}>Running pipeline</span>
        <span style={styles.loadingTitle}>Processing the chain…</span>
        <span style={styles.loadingSub}>Categorising, validating, aggregating.</span>
      </div>
      <div style={styles.spinner} aria-hidden />
    </div>
  );
}

function ResultsPanel({ result }: { result: PipelineResult }) {
  const { byCategory, totalExpenses, totalItems, policyFlags, cashOutDetected, cashOutReason, receiptId } = result;
  const max = useMemo(
    () => Math.max(...byCategory.map((b) => b.total), 0.01),
    [byCategory],
  );

  return (
    <div
      key={receiptId}
      className="pipeline-results-enter"
      style={styles.wrap}
      data-receipt-id={receiptId}
    >
      <style>{ENTER_KEYFRAMES}</style>

      <div style={styles.header}>
        <div style={styles.headerText}>
          <span style={styles.eyebrow}>Inline results · last run</span>
          <h3 style={styles.title}>Pipeline summary</h3>
          <span style={styles.subtitle}>
            Compact preview of the last chain execution. Open the expense map for the
            full treemap, per-item drilldown, and JSON export.
          </span>
        </div>
      </div>

      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Total expenses</span>
          <span style={styles.summaryValue}>{AU.currency(totalExpenses)}</span>
        </div>
        <div style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Categories</span>
          <span style={styles.summaryValue}>{byCategory.length}</span>
        </div>
        <div style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Line items</span>
          <span style={styles.summaryValue}>{totalItems}</span>
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
        <div style={styles.bars}>
          <div className="eyebrow" style={{ paddingLeft: 4 }}>Category breakdown</div>
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
      )}

      <div style={styles.flags}>
        <div className="eyebrow" style={{ paddingLeft: 4 }}>Policy compliance</div>
        {policyFlags.length === 0 ? (
          <div style={{ ...styles.flagCard, ...styles.flagOk }}>
            <span
              style={{ ...styles.flagDot, background: "var(--color-success)" }}
              aria-hidden
            />
            <div style={styles.flagBody}>
              <span
                style={{ ...styles.flagRule, color: "var(--color-success)" }}
              >
                All checks passed
              </span>
              <span style={styles.flagMessage}>
                Receipt complies with the configured policy.
              </span>
            </div>
          </div>
        ) : (
          policyFlags.map((flag, i) => (
            <div key={`${flag.rule}-${i}`} style={styles.flagCard}>
              <span
                style={{ ...styles.flagDot, background: "var(--color-warning)" }}
                aria-hidden
              />
              <div style={styles.flagBody}>
                <span
                  style={{ ...styles.flagRule, color: "var(--color-warning)" }}
                >
                  {flag.rule}
                </span>
                <span style={styles.flagMessage}>{flag.message}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {result.complianceSummary && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--space-3)",
            padding: "var(--space-3) var(--space-4)",
            background: result.complianceSummary.isCompliant
              ? "var(--color-success-soft)"
              : "var(--color-error-soft)",
            border: `1px solid ${
              result.complianceSummary.isCompliant
                ? "var(--color-success)"
                : "var(--color-error)"
            }`,
            borderRadius: "var(--radius-md)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-xl)",
              fontWeight: 600,
            }}
          >
            {result.complianceSummary.passedRules}/{result.complianceSummary.totalRules}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
            }}
          >
            {result.complianceSummary.percentage}%
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              color: result.complianceSummary.isCompliant
                ? "var(--color-success)"
                : "var(--color-error)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "var(--tracking-wider)",
            }}
          >
            {result.complianceSummary.isCompliant ? "✓ Compliant" : "✗ Below threshold"}
          </span>
        </div>
      )}

      <div style={styles.footer}>
        <div style={styles.footerText}>
          <span style={styles.footerLabel}>Full report</span>
          <span style={styles.footerHint}>
            Interactive treemap, per-item breakdown, JSON export.
          </span>
        </div>
        <Link
          to="/map"
          style={styles.footerLink}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
            (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)";
          }}
        >
          Open expense map →
        </Link>
      </div>
    </div>
  );
}

export function PipelineResultsPanel() {
  const { lastResult, isExecuting } = usePipeline();

  if (!lastResult && !isExecuting) return null;
  if (!lastResult) return <LoadingPanel />;

  return <ResultsPanel result={lastResult} />;
}
