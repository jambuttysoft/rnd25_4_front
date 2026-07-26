import { usePipeline } from "../../state/PipelineContext";
import type { JournalEntry, JournalEntryLine } from "../../types/pipeline";
import { AU } from "../../utils/format";
import { getAccountName } from "../../utils/pipeline/execute";
import type { CSSProperties } from "react";

const styles: Record<string, CSSProperties> = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-4)",
    padding: "var(--space-5)",
    background: "var(--color-surface-sunken)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
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
    fontSize: "var(--text-lg)",
    color: "var(--color-ink-strong)",
    lineHeight: 1.2,
    letterSpacing: "var(--tracking-tight)",
  },
  subtitle: {
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    lineHeight: 1.5,
  },
  badge: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    fontWeight: 700,
    letterSpacing: "var(--tracking-wider)",
    textTransform: "uppercase" as const,
    padding: "var(--space-2) var(--space-3)",
    borderRadius: "var(--radius-sm)",
    border: "1px solid currentColor",
    whiteSpace: "nowrap" as const,
  },
  badgeApproved: {
    color: "var(--color-success)",
    background: "var(--color-success-soft)",
  },
  badgePending: {
    color: "var(--color-ink-muted)",
    background: "var(--color-surface)",
  },
  meta: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "var(--space-3)",
    padding: "var(--space-3) var(--space-4)",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-sm)",
  },
  metaItem: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    minWidth: 0,
  },
  metaLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-wider)",
    textTransform: "uppercase" as const,
  },
  metaValue: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-sm)",
    color: "var(--color-ink-strong)",
    fontWeight: 600,
    letterSpacing: "var(--tracking-tight)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  table: {
    display: "flex",
    flexDirection: "column",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-sm)",
    overflow: "hidden",
  },
  tableHead: {
    display: "grid",
    gridTemplateColumns: "100px 1fr 120px 120px",
    gap: "var(--space-3)",
    padding: "var(--space-2) var(--space-4)",
    background: "var(--color-surface-sunken)",
    borderBottom: "1px solid var(--color-border)",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-wider)",
    textTransform: "uppercase" as const,
    fontWeight: 600,
  },
  tableHeadNumeric: {
    textAlign: "right" as const,
  },
  tableRow: {
    display: "grid",
    gridTemplateColumns: "100px 1fr 120px 120px",
    gap: "var(--space-3)",
    padding: "var(--space-3) var(--space-4)",
    borderBottom: "1px solid var(--color-border)",
    alignItems: "center",
  },
  tableRowCredit: {
    background: "var(--color-surface-sunken)",
  },
  tableRowTotal: {
    display: "grid",
    gridTemplateColumns: "100px 1fr 120px 120px",
    gap: "var(--space-3)",
    padding: "var(--space-3) var(--space-4)",
    background: "var(--color-ink-strong)",
    color: "var(--color-paper)",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-sm)",
    fontWeight: 700,
    letterSpacing: "var(--tracking-tight)",
    alignItems: "center",
  },
  cellAccount: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-sm)",
    fontWeight: 600,
    color: "var(--color-ink-strong)",
    letterSpacing: "var(--tracking-tight)",
  },
  cellDescription: {
    fontSize: "var(--text-sm)",
    color: "var(--color-ink)",
    lineHeight: 1.4,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  cellAmount: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-sm)",
    fontWeight: 600,
    color: "var(--color-ink-strong)",
    textAlign: "right" as const,
    fontVariantNumeric: "tabular-nums" as const,
    letterSpacing: "var(--tracking-tight)",
  },
  cellAmountEmpty: {
    color: "var(--color-ink-faint)",
  },
  cellTypeTag: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-subtle)",
    letterSpacing: "var(--tracking-widest)",
    textTransform: "uppercase" as const,
    marginRight: "var(--space-2)",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
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
  exportBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  empty: {
    padding: "var(--space-7)",
    textAlign: "center",
    background: "var(--color-surface)",
    border: "1px dashed var(--color-border)",
    borderRadius: "var(--radius-md)",
    color: "var(--color-ink-muted)",
    fontStyle: "italic",
  },
};

function EntryRow({
  line,
  isCredit,
}: {
  line: JournalEntryLine;
  isCredit: boolean;
}) {
  return (
    <div
      style={{
        ...styles.tableRow,
        ...(isCredit ? styles.tableRowCredit : {}),
      }}
    >
      <span style={styles.cellAccount} title={getAccountName(line.accountCode)}>
        {line.accountCode}
      </span>
      <span style={styles.cellDescription} title={line.description}>
        {line.description}
      </span>
      <span
        style={{
          ...styles.cellAmount,
          ...(line.type !== "debit" ? styles.cellAmountEmpty : {}),
        }}
      >
        {line.type === "debit" ? AU.currency(line.amount) : "—"}
      </span>
      <span
        style={{
          ...styles.cellAmount,
          ...(line.type !== "credit" ? styles.cellAmountEmpty : {}),
        }}
      >
        {line.type === "credit" ? AU.currency(line.amount) : "—"}
      </span>
    </div>
  );
}

export function JournalEntryPanel() {
  const { lastResult, exportJournalEntry } = usePipeline();
  const journalEntry: JournalEntry | null = lastResult?.journalEntry ?? null;
  const isCompliant = lastResult?.complianceSummary.isCompliant ?? false;
  const compliance = lastResult?.complianceSummary;
  const pendingReason = !isCompliant
    ? `Compliance score ${compliance?.percentage ?? 0}% is below the ${compliance?.threshold ?? 0}% threshold.`
    : "No journal entry was returned by the pipeline.";

  if (!journalEntry || !isCompliant) {
    return (
      <div style={styles.wrap}>
        <div style={styles.header}>
          <div style={styles.headerText}>
            <span style={styles.eyebrow}>Journal Entry</span>
            <span style={styles.title}>Ready for Xero / QuickBooks</span>
            <span style={styles.subtitle}>
              Double-entry journal lines generated from the categorised totals.
            </span>
          </div>
          <span style={{ ...styles.badge, ...styles.badgePending }}>Not generated</span>
        </div>
        <div style={styles.empty}>
          {pendingReason}
        </div>
      </div>
    );
  }

  const totalDebits = journalEntry.lines
    .filter((l) => l.type === "debit")
    .reduce((sum, l) => sum + l.amount, 0);
  const totalCredits = journalEntry.lines
    .filter((l) => l.type === "credit")
    .reduce((sum, l) => sum + l.amount, 0);

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.headerText}>
          <span style={styles.eyebrow}>Journal Entry</span>
          <span style={styles.title}>Ready for Xero / QuickBooks</span>
          <span style={styles.subtitle}>
            Double-entry journal lines generated from the categorised totals.
          </span>
        </div>
        <span style={{ ...styles.badge, ...styles.badgeApproved }}>Approved</span>
      </div>

      <div style={styles.meta}>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Merchant</span>
          <span style={styles.metaValue} title={journalEntry.merchant}>
            {journalEntry.merchant}
          </span>
        </div>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Date</span>
          <span style={styles.metaValue}>{journalEntry.date}</span>
        </div>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Total</span>
          <span style={styles.metaValue}>{AU.currency(journalEntry.total)}</span>
        </div>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Entry ID</span>
          <span style={styles.metaValue} title={journalEntry.id}>
            {journalEntry.id}
          </span>
        </div>
      </div>

      <div style={styles.table}>
        <div style={styles.tableHead}>
          <span>Account</span>
          <span>Description</span>
          <span style={styles.tableHeadNumeric}>Debit</span>
          <span style={styles.tableHeadNumeric}>Credit</span>
        </div>
        {journalEntry.lines.map((line, idx) => (
          <EntryRow
            key={`${line.accountCode}-${idx}-${line.type}`}
            line={line}
            isCredit={line.type === "credit"}
          />
        ))}
        <div style={styles.tableRowTotal}>
          <span>Total</span>
          <span />
          <span style={{ textAlign: "right" as const }}>{AU.currency(totalDebits)}</span>
          <span style={{ textAlign: "right" as const }}>{AU.currency(totalCredits)}</span>
        </div>
      </div>

      <div style={styles.actions}>
        <button
          type="button"
          style={styles.exportBtn}
          onClick={exportJournalEntry}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              d="M7 2v8m0 0L4 7m3 3l3-3M2 12h10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Export Journal Entry
        </button>
      </div>
    </div>
  );
}
