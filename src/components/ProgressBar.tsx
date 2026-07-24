import type { CSSProperties, ReactNode } from "react";

const styles: Record<string, CSSProperties> = {
  bar: {
    width: "100%",
    height: 6,
    background: "var(--color-border)",
    borderRadius: "var(--radius-full)",
    overflow: "hidden",
    position: "relative",
  },
  fill: {
    height: "100%",
    borderRadius: "var(--radius-full)",
    transition: "width var(--duration-slow) var(--ease-out)",
    background: "var(--color-accent)",
    backgroundImage:
      "linear-gradient(90deg, var(--color-accent) 0%, var(--color-accent-deep) 100%)",
  },
  wrap: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-1)",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
  },
};

interface ProgressBarProps {
  value: number;
  max?: number;
  showValue?: boolean;
  color?: "accent" | "success" | "warning" | "error" | "highlight";
  valueFormatter?: (v: number) => ReactNode;
}

export function ProgressBar({
  value,
  max = 1,
  showValue = true,
  color = "accent",
  valueFormatter,
}: ProgressBarProps) {
  const colorMap = {
    accent: "var(--color-accent)",
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    error: "var(--color-error)",
    highlight: "var(--color-highlight)",
  };

  const pct = Math.max(0, Math.min(1, value / max));
  const formatted = valueFormatter ? valueFormatter(value) : `${Math.round(pct * 100)}%`;

  return (
    <div style={styles.wrap}>
      <div style={styles.bar}>
        <div
          style={{
            ...styles.fill,
            width: `${pct * 100}%`,
            background: colorMap[color],
            backgroundImage: `linear-gradient(90deg, ${colorMap[color]} 0%, var(--color-accent-deep) 100%)`,
          }}
        />
      </div>
      {showValue && (
        <div style={styles.row}>
          <span style={{ color: "var(--color-ink-muted)" }}>{formatted}</span>
          <span style={{ color: "var(--color-ink-faint)" }}>{Math.round(pct * 100)}%</span>
        </div>
      )}
    </div>
  );
}
