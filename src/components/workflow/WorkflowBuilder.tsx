import { UploadStep } from "./UploadStep";
import { ReceiptDetail } from "./ReceiptDetail";
import { ModuleToolbox } from "./ModuleToolbox";
import { WorkflowCanvas } from "./WorkflowCanvas";
import { NodeConfigPanel } from "./NodeConfigPanel";
import { ExpenseMap } from "./ExpenseMap";
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
  builderGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(220px, 260px) minmax(0, 1fr) minmax(260px, 300px)",
    gridAutoRows: "minmax(640px, auto)",
    gap: "var(--space-5)",
    alignItems: "stretch",
  },
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "var(--space-6)",
  },
};

/**
 * Layout-only compositing view of the full workflow.
 *
 * The active app shell (see app.tsx) splits this into three routed tabs:
 *   /upload → UploadReceiptTab (uses UploadStep + ReceiptDetail)
 *   /build  → BuildWorkflowTab (uses ModuleToolbox + WorkflowCanvas + NodeConfigPanel)
 *   /map    → ViewExpenseMapTab (uses ExpenseMap)
 *
 * The WorkflowProvider must be an ancestor of this component.
 * It is mounted at the App root so all three tabs share state.
 */
export function WorkflowBuilder() {
  return (
    <div style={styles.wrap}>
      <div style={styles.intro}>
        <span style={styles.eyebrow}>Visual Workflow · Full Layout</span>
        <h2 style={styles.title}>Document verification, end to end</h2>
        <p style={styles.lede}>
          Upload a receipt, run it through a custom chain of validations and logic gates,
          and watch the categorised expense map appear at the bottom. Every step lives in
          browser memory — drop, wire, run, export.
        </p>
      </div>

      <div style={styles.topGrid}>
        <UploadStep />
        <ReceiptDetail />
      </div>

      <div style={styles.builderGrid}>
        <ModuleToolbox />
        <WorkflowCanvas />
        <NodeConfigPanel />
      </div>

      <div style={styles.bottomGrid}>
        <ExpenseMap />
      </div>
    </div>
  );
}

export const PipelineBuilder = WorkflowBuilder;
