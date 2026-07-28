import { Link } from "react-router-dom";
import { UploadStep } from "./UploadStep";
import { ReceiptDetail } from "./ReceiptDetail";
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
  topGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 1fr)",
    gap: "var(--space-6)",
    alignItems: "start",
  },
  nextStep: {
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
  nextStepText: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  nextStepLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-widest)",
    textTransform: "uppercase" as const,
  },
  nextStepTitle: {
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-md)",
    fontWeight: 600,
    color: "var(--color-ink-strong)",
    letterSpacing: "var(--tracking-tight)",
  },
  nextStepBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--space-2)",
    padding: "var(--space-3) var(--space-5)",
    background: "var(--color-ink-strong)",
    color: "var(--color-paper)",
    border: "none",
    borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-sm)",
    fontWeight: 600,
    letterSpacing: "var(--tracking-tight)",
    textDecoration: "none",
    cursor: "pointer",
    transition: "all var(--duration-base) var(--ease-out)",
    boxShadow: "var(--shadow-sm)",
  },
};

export function UploadReceiptTab() {
  return (
    <div style={styles.wrap}>
      <div style={styles.intro}>
        <span style={styles.eyebrow}>Step 01 — Upload &amp; Inspect</span>
        <h2 style={styles.title}>Capture a receipt</h2>
        <p style={styles.lede}>
          Drop a receipt image or generate a sample. OCR runs through six progressive
          stages — text region detection, entity extraction, line-item cross-check — and
          saves the structured payload in browser memory. Select a receipt to feed into
          the workflow.
        </p>
      </div>

      <div style={styles.topGrid}>
        <UploadStep />
        <ReceiptDetail />
      </div>

      <div style={styles.nextStep}>
        <div style={styles.nextStepText}>
          <span style={styles.nextStepLabel}>Next step</span>
          <span style={styles.nextStepTitle}>Build the verification workflow</span>
        </div>
        <Link to="/build" style={styles.nextStepBtn}>
          Continue to Build →
        </Link>
      </div>
    </div>
  );
}
