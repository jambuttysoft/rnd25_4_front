import type { CSSProperties } from "react";

const styles: Record<string, CSSProperties> = {
  wrap: {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--space-2)",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    fontWeight: 500,
    letterSpacing: "var(--tracking-wider)",
    textTransform: "uppercase" as const,
    color: "var(--color-ink-muted)",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
    position: "relative",
  },
  pulse: {
    position: "absolute",
    inset: -3,
    borderRadius: "50%",
    border: "1px solid currentColor",
    opacity: 0.4,
    animation: "pulse 1.6s var(--ease-in-out) infinite",
  },
  spinner: {
    width: 12,
    height: 12,
    borderRadius: "50%",
    border: "1.5px solid var(--color-border)",
    borderTopColor: "var(--color-accent)",
    animation: "spin 0.8s linear infinite",
    flexShrink: 0,
  },
};

type Status = "idle" | "running" | "complete" | "error";

interface StatusIndicatorProps {
  status: Status;
  label?: string;
}

export function StatusIndicator({ status, label }: StatusIndicatorProps) {
  const config: Record<Status, { color: string; text: string; animate?: boolean }> = {
    idle: { color: "var(--color-ink-faint)", text: "Idle" },
    running: { color: "var(--color-accent)", text: "Running", animate: true },
    complete: { color: "var(--color-success)", text: "Complete" },
    error: { color: "var(--color-error)", text: "Error" },
  };

  const cfg = config[status];

  return (
    <div style={styles.wrap}>
      {status === "running" ? (
        <span style={{ ...styles.spinner }} />
      ) : (
        <span
          style={{
            ...styles.dot,
            background: cfg.color,
            color: cfg.color,
          }}
        >
          {cfg.animate && <span style={styles.pulse} />}
        </span>
      )}
      <span style={{ color: status === "idle" ? "var(--color-ink-muted)" : "var(--color-ink)" }}>
        {label ?? cfg.text}
      </span>
    </div>
  );
}
