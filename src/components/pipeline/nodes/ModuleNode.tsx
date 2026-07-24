import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { MODULES } from "../../../data/pipelineModules";
import type { ModuleId, ModuleType, PipelineNodeData, NodeStatus } from "../../../types/pipeline";
import type { CSSProperties } from "react";

const TYPE_COLOR: Record<ModuleType, { fg: string; bg: string; ink: string; border: string }> = {
  input: { fg: "var(--mod-input)", bg: "var(--mod-input-soft)", ink: "var(--mod-input)", border: "var(--mod-input)" },
  validation: { fg: "var(--mod-validation)", bg: "var(--mod-validation-soft)", ink: "var(--mod-validation)", border: "var(--mod-validation)" },
  logic: { fg: "var(--mod-logic)", bg: "var(--mod-logic-soft)", ink: "var(--mod-logic)", border: "var(--mod-logic)" },
  output: { fg: "var(--mod-output)", bg: "var(--mod-output-soft)", ink: "var(--mod-output)", border: "var(--mod-output)" },
};

const TYPE_LABEL: Record<ModuleType, string> = {
  input: "INPUT",
  validation: "VALIDATION",
  logic: "LOGIC",
  output: "OUTPUT",
};

const STATUS_COLOR: Record<NodeStatus, string> = {
  idle: "var(--color-ink-faint)",
  running: "var(--color-accent)",
  success: "var(--color-success)",
  error: "var(--color-error)",
  skipped: "var(--color-ink-muted)",
};

const styles: Record<string, CSSProperties> = {
  node: {
    background: "var(--color-surface)",
    borderRadius: "var(--radius-lg)",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--color-border)",
    minWidth: 220,
    maxWidth: 240,
    boxShadow: "var(--shadow-md)",
    fontFamily: "var(--font-sans)",
    position: "relative",
    transition: "all var(--duration-base) var(--ease-out)",
  },
  selected: {
    borderColor: "var(--color-ink-strong)",
    boxShadow: "var(--shadow-lg)",
  },
  running: {
    borderColor: "var(--color-accent)",
    boxShadow: "0 0 0 3px var(--color-accent-soft), var(--shadow-md)",
  },
  success: {
    borderColor: "var(--color-success)",
  },
  error: {
    borderColor: "var(--color-error)",
  },
  accent: {
    height: 3,
    width: "100%",
    borderTopLeftRadius: "var(--radius-lg)",
    borderTopRightRadius: "var(--radius-lg)",
  },
  typePill: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    fontWeight: 600,
    letterSpacing: "var(--tracking-widest)",
    textTransform: "uppercase" as const,
    padding: "2px 6px",
    borderRadius: "var(--radius-sm)",
    display: "inline-block",
  },
  body: {
    padding: "var(--space-4)",
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-2)",
  },
  title: {
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-md)",
    fontWeight: 600,
    color: "var(--color-ink-strong)",
    lineHeight: 1.25,
    letterSpacing: "var(--tracking-tight)",
  },
  desc: {
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    lineHeight: 1.4,
  },
  summary: {
    marginTop: "var(--space-2)",
    paddingTop: "var(--space-2)",
    borderTop: "1px dashed var(--color-border)",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink)",
    lineHeight: 1.4,
    wordBreak: "break-word" as const,
  },
  handle: {
    width: 10,
    height: 10,
    background: "var(--color-surface)",
    border: "2px solid var(--color-ink-strong)",
    borderRadius: "50%",
  },
  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-2)",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-wider)",
    textTransform: "uppercase" as const,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
  },
};

export type ModuleNode = Node<PipelineNodeData, "module">;

export function ModuleNodeComponent(props: NodeProps<ModuleNode>) {
  const { data, selected } = props;
  const mod = MODULES[data.moduleId as ModuleId];
  const colors = TYPE_COLOR[mod.type];
  const status = (data.status as NodeStatus) ?? "idle";

  const nodeStyle: CSSProperties = {
    ...styles.node,
    ...(selected ? styles.selected : {}),
    ...(status === "running" ? styles.running : {}),
    ...(status === "success" ? styles.success : {}),
    ...(status === "error" ? styles.error : {}),
  };

  return (
    <div style={nodeStyle} className="nodrag-prevent">
      <div
        style={{
          ...styles.accent,
          background: colors.fg,
        }}
      />
      <div style={styles.body}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              ...styles.typePill,
              background: colors.bg,
              color: colors.ink,
            }}
          >
            {TYPE_LABEL[mod.type]}
          </span>
          <span style={{ ...styles.statusRow, color: STATUS_COLOR[status] }}>
            <span style={{ ...styles.statusDot, background: STATUS_COLOR[status] }} />
            {status}
          </span>
        </div>
        <div style={styles.title}>{mod.label}</div>
        <div style={styles.desc}>{mod.description}</div>
        {data.resultSummary && (
          <div style={styles.summary}>{String(data.resultSummary)}</div>
        )}
      </div>
      {mod.inputs > 0 && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ ...styles.handle, top: "50%" }}
        />
      )}
      {mod.outputs >= 1 && (
        <Handle
          type="source"
          position={Position.Right}
          id="out"
          style={{ ...styles.handle, top: "50%" }}
        />
      )}
      {mod.outputs >= 2 && (
        <Handle
          type="source"
          position={Position.Right}
          id="out-false"
          style={{ ...styles.handle, top: "70%" }}
        />
      )}
    </div>
  );
}
