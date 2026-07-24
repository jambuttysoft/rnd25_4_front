import { Link } from "react-router-dom";
import { ExpenseMap } from "./ExpenseMap";
import { RagInsights } from "./RagInsights";
import type { CSSProperties } from "react";

const styles: Record<string, CSSProperties> = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-9)",
  },
  intro: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-3)",
    paddingBottom: "var(--space-5)",
    borderBottom: "1px solid var(--color-border)",
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
    fontSize: "var(--text-5xl)",
    color: "var(--color-ink-strong)",
    lineHeight: 1,
    letterSpacing: "var(--tracking-tight)",
  },
  lede: {
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-md)",
    color: "var(--color-ink-muted)",
    lineHeight: 1.6,
    maxWidth: 720,
  },
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "var(--space-6)",
  },
  navRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "var(--space-4)",
    padding: "var(--space-5) var(--space-6)",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-sm)",
  },
  navStepText: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  navStepLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-widest)",
    textTransform: "uppercase" as const,
  },
  navStepTitle: {
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-md)",
    fontWeight: 600,
    color: "var(--color-ink-strong)",
    letterSpacing: "var(--tracking-tight)",
  },
  navBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--space-2)",
    padding: "var(--space-3) var(--space-5)",
    background: "var(--color-surface)",
    color: "var(--color-ink-strong)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-sm)",
    fontWeight: 600,
    letterSpacing: "var(--tracking-tight)",
    textDecoration: "none",
    cursor: "pointer",
    transition: "all var(--duration-base) var(--ease-out)",
  },
};

export function ViewExpenseMapTab() {
  return (
    <div style={styles.wrap}>
      <div style={styles.intro}>
        <span style={styles.eyebrow}>Step 03 — Review &amp; Export</span>
        <h2 style={styles.title}>View the expense map</h2>
        <p style={styles.lede}>
          The categorised totals are visualised here. Color-coded blocks scale with
          spend per category; policy flags surface anything that needs attention. Export
          the final result as JSON for downstream processing.
        </p>
      </div>

      <div style={styles.bottomGrid}>
        <ExpenseMap />
      </div>

      <RagInsights />

      <div style={styles.navRow}>
        <Link to="/build" style={styles.navBtn}>
          ← Back to Build
        </Link>
        <div style={styles.navStepText}>
          <span style={styles.navStepLabel}>Start over</span>
          <span style={styles.navStepTitle}>Upload a new receipt</span>
        </div>
        <Link to="/upload" style={styles.navBtn}>
          New Receipt →
        </Link>
      </div>
    </div>
  );
}
