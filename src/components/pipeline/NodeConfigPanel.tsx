import { usePipeline } from "../../state/PipelineContext";
import { MODULES } from "../../data/pipelineModules";
import { CATEGORY_COLOR_VARS, EXPENSE_CATEGORIES } from "../../types/pipeline";
import type { CSSProperties } from "react";
import type { ModuleId, ParamField, Receipt } from "../../types/pipeline";

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
    minWidth: 260,
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "var(--space-3)",
  },
  titleBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
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
    fontSize: "var(--text-xl)",
    color: "var(--color-ink-strong)",
    lineHeight: 1.1,
    letterSpacing: "var(--tracking-tight)",
  },
  subtitle: {
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    lineHeight: 1.5,
  },
  pillRow: {
    display: "flex",
    gap: "var(--space-2)",
    flexWrap: "wrap" as const,
  },
  pill: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    padding: "2px 8px",
    borderRadius: "var(--radius-full)",
    letterSpacing: "var(--tracking-wide)",
    textTransform: "uppercase" as const,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  fieldLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-wider)",
    textTransform: "uppercase" as const,
  },
  fieldHelp: {
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-subtle)",
    lineHeight: 1.4,
  },
  input: {
    padding: "var(--space-3) var(--space-4)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    background: "var(--color-surface)",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-sm)",
    color: "var(--color-ink-strong)",
  },
  select: {
    padding: "var(--space-3) var(--space-4)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    background: "var(--color-surface)",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-sm)",
    color: "var(--color-ink-strong)",
    cursor: "pointer",
  },
  catGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "var(--space-2)",
  },
  catOption: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 8px",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    background: "var(--color-surface)",
    transition: "all var(--duration-fast) var(--ease-out)",
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
  },
  actionRow: {
    display: "flex",
    gap: "var(--space-2)",
    alignItems: "center",
  },
  deleteBtn: {
    padding: "var(--space-2) var(--space-3)",
    background: "transparent",
    border: "1px solid var(--color-error)",
    borderRadius: "var(--radius-md)",
    color: "var(--color-error)",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    cursor: "pointer",
    letterSpacing: "var(--tracking-wider)",
    textTransform: "uppercase" as const,
  },
  summary: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-success)",
    background: "var(--color-success-soft)",
    border: "1px solid var(--color-success)",
    borderRadius: "var(--radius-sm)",
    padding: "var(--space-3)",
  },
  empty: {
    padding: "var(--space-6)",
    textAlign: "center",
    color: "var(--color-ink-muted)",
    fontStyle: "italic",
    fontSize: "var(--text-sm)",
  },
  receiptMini: {
    background: "var(--color-surface-sunken)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-3)",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  receiptLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-wider)",
    textTransform: "uppercase" as const,
  },
  receiptMerchant: {
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-sm)",
    fontWeight: 600,
    color: "var(--color-ink-strong)",
  },
};

export function NodeConfigPanel() {
  const { nodes, selectedNodeId, updateNodeParams, removeNode, selectedReceipt, lastResult } = usePipeline();
  const node = nodes.find((n) => n.id === selectedNodeId) ?? null;
  const mod = node ? MODULES[node.data.moduleId as ModuleId] : null;

  if (!node || !mod) {
    return (
      <div style={styles.wrap}>
        <div style={styles.header}>
          <div style={styles.titleBlock}>
            <span style={styles.stepBadge}>CONFIG</span>
            <h3 style={styles.title}>Node parameters</h3>
            <p style={styles.subtitle}>Click a module on the canvas to tune its parameters.</p>
          </div>
        </div>
        <div style={styles.empty}>No module selected.</div>
      </div>
    );
  }

  const renderField = (field: ParamField) => {
    const value = node.data.params[field.key] ?? field.defaultValue;
    if (field.kind === "number") {
      return (
        <input
          type="number"
          style={styles.input}
          value={String(value ?? "")}
          onChange={(e) => updateNodeParams(node.id, { [field.key]: Number(e.target.value) })}
        />
      );
    }
    if (field.kind === "text") {
      return (
        <input
          type="text"
          style={styles.input}
          value={String(value ?? "")}
          onChange={(e) => updateNodeParams(node.id, { [field.key]: e.target.value })}
        />
      );
    }
    if (field.kind === "select") {
      return (
        <select
          style={styles.select}
          value={String(value ?? "")}
          onChange={(e) => {
            const v = e.target.value;
            const updated = isNaN(Number(v)) ? v : Number(v);
            updateNodeParams(node.id, { [field.key]: updated });
          }}
        >
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }
    if (field.kind === "boolean") {
      return (
        <select
          style={styles.select}
          value={String(value ?? "false")}
          onChange={(e) => updateNodeParams(node.id, { [field.key]: e.target.value === "true" })}
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      );
    }
    if (field.kind === "categories") {
      return (
        <div style={styles.catGrid}>
          {EXPENSE_CATEGORIES.map((c) => {
            const colors = CATEGORY_COLOR_VARS[c];
            const active = value === c;
            return (
              <label
                key={c}
                style={{
                  ...styles.catOption,
                  background: active ? colors.bg : "var(--color-surface)",
                  borderColor: active ? colors.fg : "var(--color-border)",
                }}
              >
                <input
                  type="radio"
                  name={`cat-${node.id}-${field.key}`}
                  value={c}
                  checked={active}
                  onChange={() => updateNodeParams(node.id, { [field.key]: c })}
                  style={{ display: "none" }}
                />
                <span style={{ ...styles.catDot, background: colors.fg }} />
                <span style={{ color: active ? colors.fg : "var(--color-ink)" }}>{c}</span>
              </label>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.titleBlock}>
          <span style={styles.stepBadge}>{mod.type.toUpperCase()}</span>
          <h3 style={styles.title}>{mod.label}</h3>
          <p style={styles.subtitle}>{mod.description}</p>
        </div>
        <button
          type="button"
          style={styles.deleteBtn}
          onClick={() => removeNode(node.id)}
        >
          Remove
        </button>
      </div>

      <div style={styles.pillRow}>
        <span
          style={{
            ...styles.pill,
            background: "var(--color-surface-sunken)",
            color: "var(--color-ink-muted)",
          }}
        >
          {mod.inputs} in · {mod.outputs} out
        </span>
        <span
          style={{
            ...styles.pill,
            background: "var(--color-accent-soft)",
            color: "var(--color-accent-deep)",
          }}
        >
          {node.data.status ?? "idle"}
        </span>
        {node.data.resultSummary && (
          <span
            style={{
              ...styles.pill,
              background: "var(--color-success-soft)",
              color: "var(--color-success)",
            }}
          >
            {String(node.data.resultSummary)}
          </span>
        )}
      </div>

      {mod.id === "input.receipt" && selectedReceipt && (
        <div style={styles.receiptMini}>
          <span style={styles.receiptLabel}>Currently feeding</span>
          <span style={styles.receiptMerchant}>{selectedReceipt.merchant}</span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              color: "var(--color-ink-muted)",
            }}
          >
            {selectedReceipt.lineItems.length} items · total ${selectedReceipt.total.toFixed(2)}
          </span>
        </div>
      )}

      {mod.paramSchema.map((field) => (
        <div key={field.key} style={styles.field}>
          <span style={styles.fieldLabel}>{field.label}</span>
          {renderField(field)}
          {field.help && <span style={styles.fieldHelp}>{field.help}</span>}
        </div>
      ))}

      {mod.id === "validation.categorize" && (
        <div style={styles.field}>
          <span style={styles.fieldLabel}>Preview categorization</span>
          {selectedReceipt ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {selectedReceipt.lineItems.map((li: Receipt["lineItems"][number]) => {
                const cat = (li.category ?? "Other") as keyof typeof CATEGORY_COLOR_VARS;
                const colors = CATEGORY_COLOR_VARS[cat];
                return (
                  <div
                    key={li.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "var(--text-xs)",
                      padding: "4px 8px",
                      background: "var(--color-surface-sunken)",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    <span style={{ color: "var(--color-ink)" }}>{li.description}</span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "var(--text-xs)",
                        color: colors.fg,
                        fontWeight: 600,
                      }}
                    >
                      {cat}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <span style={styles.fieldHelp}>Select a receipt to preview.</span>
          )}
        </div>
      )}

      {mod.id === "output.expenseMap" && lastResult && (
        <div style={styles.field}>
          <span style={styles.fieldLabel}>Last run summary</span>
          <div style={styles.summary}>
            ${lastResult.totalExpenses.toFixed(2)} total across {lastResult.byCategory.length} categories
            <br />
            {lastResult.totalItems} items · {lastResult.policyFlags.length} policy flag(s)
          </div>
        </div>
      )}
    </div>
  );
}
