import { Link } from "react-router-dom";
import { ModuleToolbox } from "./ModuleToolbox";
import { WorkflowCanvas } from "./WorkflowCanvas";
import { NodeConfigPanel } from "./NodeConfigPanel";
import { TemplateManager } from "./TemplateManager";
import { WorkflowResultsPanel } from "./WorkflowResultsPanel";
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
  builderGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(220px, 260px) minmax(0, 1fr) minmax(260px, 300px)",
    gridAutoRows: "minmax(640px, auto)",
    gap: "var(--space-5)",
    alignItems: "stretch",
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

export function BuildWorkflowTab() {
  return (
    <div style={styles.wrap}>
      <div style={styles.intro}>
        <span style={styles.eyebrow}>Step 02 — Compose &amp; Configure</span>
        <h2 style={styles.title}>Build the workflow</h2>
        <p style={styles.lede}>
          Drag modules from the toolbox onto the canvas, wire them together, and tune
          the parameters of each node. Load a template below for a working baseline,
          or assemble your own verification flow and save it for later.
        </p>
      </div>

      <div style={styles.builderGrid}>
        <ModuleToolbox />
        <WorkflowCanvas />
        <NodeConfigPanel />
      </div>

      <WorkflowResultsPanel />

      <TemplateManager />

      <div style={styles.nextStep}>
        <div style={styles.nextStepText}>
          <span style={styles.nextStepLabel}>Next step</span>
          <span style={styles.nextStepTitle}>Run the chain and view the expense map</span>
        </div>
        <Link to="/map" style={styles.nextStepBtn}>
          Continue to Map →
        </Link>
      </div>
    </div>
  );
}

export const BuildPipelineTab = BuildWorkflowTab;
