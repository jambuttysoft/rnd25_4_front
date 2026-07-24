import { usePipeline } from "../../state/PipelineContext";
import type { ComplianceSummary, RuleCheck } from "../../types/pipeline";
import type { CSSProperties } from "react";

const styles: Record<string, CSSProperties> = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-4)",
    padding: "var(--space-5)",
    background: "var(--color-surface-sunken)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "var(--space-4)",
  },
  headerText: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-1)",
  },
  eyebrow: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-accent-deep)",
    letterSpacing: "var(--tracking-widest)",
    textTransform: "uppercase" as const,
    fontWeight: 500,
  },
  score: {
    fontFamily: "var(--font-display)",
    fontSize: "var(--text-4xl)",
    fontWeight: 600,
    color: "var(--color-ink-strong)",
    lineHeight: 1,
    letterSpacing: "var(--tracking-tight)",
    fontVariantNumeric: "tabular-nums" as const,
  },
  badge: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    fontWeight: 700,
    letterSpacing: "var(--tracking-wider)",
    textTransform: "uppercase" as const,
    padding: "var(--space-2) var(--space-3)",
    borderRadius: "var(--radius-sm)",
    border: "1px solid currentColor",
  },
  badgePass: {
    color: "var(--color-success)",
    background: "var(--color-success-soft)",
  },
  badgeFail: {
    color: "var(--color-error)",
    background: "var(--color-error-soft)",
  },
  barSection: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-2)",
  },
  barLabel: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-wider)",
    textTransform: "uppercase" as const,
  },
  barTrack: {
    position: "relative" as const,
    height: 18,
    background: "var(--color-surface)",
    borderRadius: "var(--radius-full)",
    overflow: "hidden",
    border: "1px solid var(--color-border)",
  },
  barFill: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    height: "100%",
    borderRadius: "var(--radius-full)",
    transition: "width var(--duration-slow) var(--ease-out)",
  },
  barThreshold: {
    position: "absolute" as const,
    top: -2,
    bottom: -2,
    width: 2,
    background: "var(--color-warning)",
    zIndex: 2,
    boxShadow: "0 0 0 1px var(--color-warning-soft)",
  },
  summary: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-sm)",
    color: "var(--color-ink)",
    fontWeight: 500,
    letterSpacing: "var(--tracking-tight)",
  },
  rulesList: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-2)",
  },
  ruleItem: {
    display: "grid",
    gridTemplateColumns: "20px 1fr",
    alignItems: "start",
    gap: "var(--space-3)",
    padding: "var(--space-3)",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-sm)",
  },
  ruleIcon: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    fontFamily: "var(--font-mono)",
    flexShrink: 0,
  },
  ruleIconPass: {
    color: "var(--color-success)",
    background: "var(--color-success-soft)",
  },
  ruleIconFail: {
    color: "var(--color-error)",
    background: "var(--color-error-soft)",
  },
  ruleBody: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    minWidth: 0,
  },
  ruleName: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-sm)",
    fontWeight: 600,
    color: "var(--color-ink-strong)",
    letterSpacing: "var(--tracking-tight)",
  },
  ruleDetail: {
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    lineHeight: 1.4,
  },
};

interface ComplianceScoreCardProps {
  summary: ComplianceSummary;
}

function RuleRow({ rule }: { rule: RuleCheck }) {
  const passed = rule.passed;
  return (
    <div style={styles.ruleItem}>
      <span
        style={{
          ...styles.ruleIcon,
          ...(passed ? styles.ruleIconPass : styles.ruleIconFail),
        }}
        aria-hidden
      >
        {passed ? "✓" : "✗"}
      </span>
      <div style={styles.ruleBody}>
        <span style={styles.ruleName}>{rule.ruleName}</span>
        <span style={styles.ruleDetail}>{rule.detail}</span>
      </div>
    </div>
  );
}

export function ComplianceScoreCard({ summary }: ComplianceScoreCardProps) {
  const { complianceThreshold } = usePipeline();
  const { percentage, passedRules, totalRules, isCompliant, ruleChecks, threshold } = summary;

  const fillColor = isCompliant ? "var(--color-success)" : "var(--color-error)";
  const barFillStyle: CSSProperties = {
    ...styles.barFill,
    width: `${Math.min(100, Math.max(0, percentage))}%`,
    background: fillColor,
  };

  const thresholdPct = Math.min(100, Math.max(0, threshold ?? complianceThreshold));
  const barThresholdStyle: CSSProperties = {
    ...styles.barThreshold,
    left: `calc(${thresholdPct}% - 1px)`,
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.headerText}>
          <span style={styles.eyebrow}>Compliance score</span>
          <span style={styles.score}>{percentage}%</span>
        </div>
        <span
          style={{
            ...styles.badge,
            ...(isCompliant ? styles.badgePass : styles.badgeFail),
          }}
        >
          {isCompliant ? "✓ Compliant" : "✗ Below threshold"}
        </span>
      </div>

      <div style={styles.barSection}>
        <div style={styles.barLabel}>
          <span>{passedRules}/{totalRules} rules passed</span>
          <span>Threshold: {thresholdPct}%</span>
        </div>
        <div style={styles.barTrack} role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
          <div style={barFillStyle} />
          <div style={barThresholdStyle} aria-hidden />
        </div>
      </div>

      <div style={styles.summary}>
        {passedRules === totalRules
          ? "All rules satisfied — receipt is fully compliant."
          : `${totalRules - passedRules} of ${totalRules} rule${totalRules - passedRules === 1 ? "" : "s"} failed.`}
      </div>

      {ruleChecks.length > 0 && (
        <div style={styles.rulesList}>
          {ruleChecks.map((rule) => (
            <RuleRow key={rule.ruleId} rule={rule} />
          ))}
        </div>
      )}
    </div>
  );
}
