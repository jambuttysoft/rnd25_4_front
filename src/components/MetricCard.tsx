import type { CSSProperties, ReactNode } from "react";

const styles: Record<string, CSSProperties> = {
  card: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--space-6)",
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-3)",
    position: "relative",
    transition: "all var(--duration-base) var(--ease-out)",
    boxShadow: "var(--shadow-sm)",
  },
  label: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    fontWeight: 500,
    letterSpacing: "var(--tracking-widest)",
    textTransform: "uppercase" as const,
    color: "var(--color-ink-muted)",
    display: "flex",
    alignItems: "center",
    gap: "var(--space-2)",
  },
  value: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-3xl)",
    fontWeight: 600,
    color: "var(--color-ink-strong)",
    lineHeight: 1,
    letterSpacing: "var(--tracking-tight)",
    fontVariantNumeric: "tabular-nums",
  },
  sublabel: {
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-sm)",
    color: "var(--color-ink-muted)",
    lineHeight: 1.4,
  },
  trend: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-2)",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    marginTop: "var(--space-1)",
  },
};

interface MetricCardProps {
  label: ReactNode;
  value: ReactNode;
  sublabel?: ReactNode;
  trend?: ReactNode;
  accent?: "default" | "accent" | "success" | "warning" | "error" | "highlight";
  size?: "sm" | "md" | "lg";
  children?: ReactNode;
}

export function MetricCard({
  label,
  value,
  sublabel,
  trend,
  accent = "default",
  size = "md",
  children,
}: MetricCardProps) {
  const accentColors: Record<NonNullable<MetricCardProps["accent"]>, string> = {
    default: "var(--color-ink-strong)",
    accent: "var(--color-accent-deep)",
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    error: "var(--color-error)",
    highlight: "var(--color-highlight)",
  };

  const sizeMap = {
    sm: { valueFont: "var(--text-2xl)" },
    md: { valueFont: "var(--text-3xl)" },
    lg: { valueFont: "var(--text-5xl)" },
  };

  return (
    <div style={styles.card}>
      <div style={styles.label}>{label}</div>
      <div
        style={{
          ...styles.value,
          color: accentColors[accent],
          fontSize: sizeMap[size].valueFont,
        }}
      >
        {value}
      </div>
      {sublabel && <div style={styles.sublabel}>{sublabel}</div>}
      {trend && <div style={styles.trend}>{trend}</div>}
      {children}
    </div>
  );
}
