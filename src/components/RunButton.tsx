import type { CSSProperties, MouseEvent } from "react";
import { useState } from "react";

const styles: Record<string, CSSProperties> = {
  button: {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--space-3)",
    padding: "var(--space-3) var(--space-5)",
    borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-sm)",
    fontWeight: 600,
    letterSpacing: "var(--tracking-tight)",
    cursor: "pointer",
    transition: "all var(--duration-base) var(--ease-out)",
    position: "relative",
    overflow: "hidden",
  },
  primary: {
    background: "var(--color-ink-strong)",
    color: "var(--color-paper)",
    boxShadow: "var(--shadow-md)",
  },
  primaryHover: {
    background: "var(--color-ink)",
    boxShadow: "var(--shadow-lg)",
    transform: "translateY(-1px)",
  },
  ghost: {
    background: "transparent",
    color: "var(--color-ink)",
    border: "1px solid var(--color-border-strong)",
  },
  ghostHover: {
    background: "var(--color-surface)",
    borderColor: "var(--color-ink)",
  },
  icon: {
    width: 16,
    height: 16,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: 14,
    height: 14,
    border: "1.5px solid currentColor",
    borderTopColor: "transparent",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};

type Variant = "primary" | "ghost";

interface RunButtonProps {
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  running?: boolean;
  label?: string;
  runningLabel?: string;
  variant?: Variant;
  icon?: React.ReactNode;
}

export function RunButton({
  onClick,
  running = false,
  label = "Run experiment",
  runningLabel = "Running…",
  variant = "primary",
  icon,
}: RunButtonProps) {
  const [hover, setHover] = useState(false);

  const baseStyle = variant === "primary" ? styles.primary : styles.ghost;
  const hoverStyle = variant === "primary" ? styles.primaryHover : styles.ghostHover;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      disabled={running}
      style={{
        ...styles.button,
        ...baseStyle,
        ...(hover && !running ? hoverStyle : {}),
        cursor: running ? "wait" : "pointer",
        opacity: running ? 0.85 : 1,
      }}
    >
      <span style={styles.icon}>
        {running ? <span style={styles.spinner} /> : icon ?? <PlayIcon />}
      </span>
      <span>{running ? runningLabel : label}</span>
    </button>
  );
}

function PlayIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M3 2L10 6L3 10V2Z" fill="currentColor" />
    </svg>
  );
}
