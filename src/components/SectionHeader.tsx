import type { CSSProperties, ReactNode } from "react";

const styles: Record<string, CSSProperties> = {
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-4)",
  },
  header: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "var(--space-6)",
    paddingBottom: "var(--space-4)",
    borderBottom: "1px solid var(--color-border)",
  },
  titleGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-1)",
  },
  subtitle: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    fontWeight: 500,
    letterSpacing: "var(--tracking-widest)",
    textTransform: "uppercase" as const,
    color: "var(--color-accent-deep)",
  },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: "var(--text-4xl)",
    fontWeight: 400,
    color: "var(--color-ink-strong)",
    letterSpacing: "var(--tracking-tight)",
    lineHeight: 1.1,
  },
  description: {
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-md)",
    lineHeight: 1.6,
    color: "var(--color-ink-muted)",
    maxWidth: "640px",
  },
  side: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "var(--space-2)",
  },
};

interface SectionHeaderProps {
  subtitle?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
}

export function SectionHeader({ subtitle, title, description, aside }: SectionHeaderProps) {
  return (
    <header style={styles.header}>
      <div style={styles.titleGroup}>
        {subtitle && <div style={styles.subtitle}>{subtitle}</div>}
        <h2 style={styles.title}>{title}</h2>
        {description && <p style={styles.description}>{description}</p>}
      </div>
      {aside && <div style={styles.side}>{aside}</div>}
    </header>
  );
}

const sectionStyles: Record<string, CSSProperties> = {
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-6)",
  },
};

interface SectionProps {
  children: ReactNode;
  style?: CSSProperties;
}

export function Section({ children, style }: SectionProps) {
  return (
    <section style={{ ...sectionStyles.section, ...style }}>{children}</section>
  );
}
