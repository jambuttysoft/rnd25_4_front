import { usePipeline } from "../../state/PipelineContext";
import type { CSSProperties, ChangeEvent } from "react";

const PRESETS = [70, 80, 90, 100] as const;

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
  title: {
    fontFamily: "var(--font-display)",
    fontSize: "var(--text-lg)",
    color: "var(--color-ink-strong)",
    lineHeight: 1.2,
    letterSpacing: "var(--tracking-tight)",
  },
  description: {
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    lineHeight: 1.5,
    maxWidth: 520,
  },
  controlRow: {
    display: "grid",
    gridTemplateColumns: "1fr 80px",
    gap: "var(--space-3)",
    alignItems: "center",
  },
  slider: {
    width: "100%",
    height: 6,
    appearance: "none" as const,
    WebkitAppearance: "none" as const,
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-full)",
    outline: "none",
    cursor: "pointer",
  },
  numberInput: {
    width: "100%",
    padding: "var(--space-2) var(--space-3)",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-sm)",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-sm)",
    color: "var(--color-ink-strong)",
    fontWeight: 600,
    textAlign: "right" as const,
    fontVariantNumeric: "tabular-nums" as const,
    letterSpacing: "var(--tracking-tight)",
  },
  currentValue: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-wider)",
    textTransform: "uppercase" as const,
  },
  presetRow: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-2)",
    flexWrap: "wrap" as const,
  },
  presetLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-wider)",
    textTransform: "uppercase" as const,
    marginRight: "var(--space-2)",
  },
  presetBtn: {
    padding: "var(--space-1) var(--space-3)",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-sm)",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    fontWeight: 600,
    color: "var(--color-ink)",
    cursor: "pointer",
    letterSpacing: "var(--tracking-tight)",
    transition: "all var(--duration-fast) var(--ease-out)",
  },
  presetBtnActive: {
    background: "var(--color-ink-strong)",
    color: "var(--color-paper)",
    borderColor: "var(--color-ink-strong)",
  },
};

const SLIDER_STYLES = `
.threshold-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-ink-strong);
  border: 2px solid var(--color-paper);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
}
.threshold-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-ink-strong);
  border: 2px solid var(--color-paper);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
}
.threshold-slider:focus {
  border-color: var(--color-accent);
}
`;

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function ThresholdConfigurator() {
  const { complianceThreshold, setComplianceThreshold } = usePipeline();
  const value = clamp(complianceThreshold, 0, 100);

  const onSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value);
    setComplianceThreshold(clamp(next, 0, 100));
  };

  const onNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = Number(e.target.value);
    if (Number.isNaN(raw)) return;
    setComplianceThreshold(clamp(raw, 0, 100));
  };

  return (
    <div style={styles.wrap}>
      <style>{SLIDER_STYLES}</style>
      <div style={styles.header}>
        <span style={styles.eyebrow}>Threshold</span>
        <span style={styles.title}>Compliance threshold</span>
        <span style={styles.description}>
          The minimum pass-rate required for a receipt to be considered compliant and
          approved for journal entry. Lower thresholds are more lenient; higher
          thresholds enforce stricter policy adherence.
        </span>
      </div>

      <div style={styles.controlRow}>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={onSliderChange}
          style={styles.slider}
          className="threshold-slider"
          aria-label="Compliance threshold"
        />
        <input
          type="number"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={onNumberChange}
          style={styles.numberInput}
          aria-label="Compliance threshold value"
        />
      </div>

      <div style={styles.currentValue}>Threshold: {value}%</div>

      <div style={styles.presetRow}>
        <span style={styles.presetLabel}>Presets:</span>
        {PRESETS.map((preset) => {
          const active = preset === value;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => setComplianceThreshold(preset)}
              style={{
                ...styles.presetBtn,
                ...(active ? styles.presetBtnActive : {}),
              }}
              aria-pressed={active}
            >
              {preset}%
            </button>
          );
        })}
      </div>
    </div>
  );
}
