import { useState } from "react";
import { useWorkflow } from "../../state/WorkflowContext";
import { MODULE_LIST } from "../../data/workflowModules";
import type { ModuleDefinition, ModuleType } from "../../types/workflow";
import type { CSSProperties } from "react";

const styles: Record<string, CSSProperties> = {
  wrap: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--space-5)",
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-4)",
    boxShadow: "var(--shadow-sm)",
    minWidth: 240,
  },
  header: {
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
  hint: {
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    lineHeight: 1.5,
  },
  group: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-2)",
  },
  groupHeader: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-2)",
    paddingBottom: "var(--space-2)",
    borderBottom: "1px dashed var(--color-border)",
  },
  groupDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
  },
  groupTitle: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    fontWeight: 600,
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-widest)",
    textTransform: "uppercase" as const,
  },
  groupCount: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-faint)",
    marginLeft: "auto",
  },
  moduleBtn: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-3)",
    padding: "var(--space-3) var(--space-3)",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    cursor: "grab",
    textAlign: "left",
    transition: "all var(--duration-fast) var(--ease-out)",
    width: "100%",
  },
  moduleBtnActive: {
    borderColor: "var(--color-ink-strong)",
    background: "var(--color-surface-sunken)",
  },
  moduleBar: {
    width: 4,
    alignSelf: "stretch",
    borderRadius: 2,
  },
  moduleText: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    flex: 1,
  },
  moduleLabel: {
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-sm)",
    fontWeight: 600,
    color: "var(--color-ink-strong)",
    letterSpacing: "var(--tracking-tight)",
  },
  moduleShort: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-wide)",
  },
};

const TYPE_META: Record<ModuleType, { color: string; label: string; bg: string }> = {
  input: { color: "var(--mod-input)", bg: "var(--mod-input-soft)", label: "Input" },
  validation: { color: "var(--mod-validation)", bg: "var(--mod-validation-soft)", label: "Validation" },
  logic: { color: "var(--mod-logic)", bg: "var(--mod-logic-soft)", label: "Logic" },
  output: { color: "var(--mod-output)", bg: "var(--mod-output-soft)", label: "Output" },
};

const TYPE_ORDER: ModuleType[] = ["input", "validation", "logic", "output"];

export function ModuleToolbox() {
  const { addModuleNode, nodes, loadPresetChain } = useWorkflow();
  const [dragId, setDragId] = useState<string | null>(null);

  const grouped = TYPE_ORDER.map((t) => ({
    type: t,
    items: MODULE_LIST.filter((m) => m.type === t),
  }));

  const handleAdd = (mod: ModuleDefinition) => {
    addModuleNode(mod.id, {
      x: 200 + Math.random() * 80,
      y: 80 + nodes.length * 30,
    });
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <span style={styles.stepBadge}>STEP 03 — TOOLBOX</span>
        <h3 style={styles.title}>Modules</h3>
        <p style={styles.hint}>
          Drag a module onto the canvas, or click to add. Connect handles to wire the chain.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <button
          type="button"
          onClick={loadPresetChain}
          style={{
            ...styles.moduleBtn,
            background: "var(--color-ink-strong)",
            borderColor: "var(--color-ink-strong)",
            color: "var(--color-paper)",
            justifyContent: "center",
          }}
        >
          <span style={{ ...styles.moduleLabel, color: "var(--color-paper)" }}>Load preset chain</span>
        </button>
      </div>

      {grouped.map(({ type, items }) => {
        const meta = TYPE_META[type];
        return (
          <div key={type} style={styles.group}>
            <div style={styles.groupHeader}>
              <span style={{ ...styles.groupDot, background: meta.color }} />
              <span style={styles.groupTitle}>{meta.label}</span>
              <span style={styles.groupCount}>{items.length}</span>
            </div>
            {items.map((mod) => (
              <button
                key={mod.id}
                type="button"
                onClick={() => handleAdd(mod)}
                onDragStart={(e) => {
                  e.dataTransfer.setData("application/x-workflow-module", mod.id);
                  e.dataTransfer.setData("application/x-pipeline-module", mod.id);
                  e.dataTransfer.effectAllowed = "copy";
                  setDragId(mod.id);
                }}
                onDragEnd={() => setDragId(null)}
                draggable
                style={{
                  ...styles.moduleBtn,
                  ...(dragId === mod.id ? styles.moduleBtnActive : {}),
                }}
              >
                <span
                  style={{
                    ...styles.moduleBar,
                    background: meta.color,
                  }}
                />
                <div style={styles.moduleText}>
                  <span style={styles.moduleLabel}>{mod.label}</span>
                  <span style={styles.moduleShort}>{mod.shortLabel}</span>
                </div>
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
}
