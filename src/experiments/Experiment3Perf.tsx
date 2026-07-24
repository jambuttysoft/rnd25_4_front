import { useState } from "react";
import { MetricCard } from "../components/MetricCard";
import { ProgressBar } from "../components/ProgressBar";
import { StatusIndicator } from "../components/StatusIndicator";
import { RunButton } from "../components/RunButton";
import { DataTable, type Column } from "../components/DataTable";
import { Section, SectionHeader } from "../components/SectionHeader";
import { perfData, type GraphConfig } from "../data/perfData";
import { AU } from "../utils/format";
import type { CSSProperties } from "react";

const styles: Record<string, CSSProperties> = {
  summary: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "var(--space-4)",
  },
  configs: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "var(--space-4)",
  },
  configCard: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--space-5)",
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-4)",
    boxShadow: "var(--shadow-sm)",
    position: "relative",
    overflow: "hidden",
  },
  configCardBest: {
    borderColor: "var(--color-highlight)",
    background: "linear-gradient(180deg, var(--color-highlight-soft) 0%, var(--color-surface) 60%)",
  },
  bestBadge: {
    position: "absolute",
    top: "var(--space-3)",
    right: "var(--space-3)",
    background: "var(--color-highlight)",
    color: "white",
    padding: "2px 10px",
    borderRadius: "var(--radius-full)",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    fontWeight: 700,
    letterSpacing: "var(--tracking-wider)",
    textTransform: "uppercase" as const,
  },
  configName: {
    fontFamily: "var(--font-display)",
    fontSize: "var(--text-2xl)",
    color: "var(--color-ink-strong)",
    lineHeight: 1.1,
    letterSpacing: "var(--tracking-tight)",
  },
  configPattern: {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--space-1)",
    padding: "2px 8px",
    borderRadius: "var(--radius-full)",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "var(--tracking-wider)",
    alignSelf: "flex-start" as const,
  },
  patternSequential: { background: "var(--color-accent-soft)", color: "var(--color-accent-deep)" },
  patternParallel: { background: "var(--color-success-soft)", color: "var(--color-success)" },
  patternConditional: { background: "var(--color-warning-soft)", color: "var(--color-warning)" },
  patternDeep: { background: "var(--color-error-soft)", color: "var(--color-error)" },
  configDesc: {
    fontSize: "var(--text-sm)",
    color: "var(--color-ink-muted)",
    lineHeight: 1.5,
    minHeight: 60,
  },
  configTopLine: {
    display: "flex",
    alignItems: "baseline",
    gap: "var(--space-2)",
  },
  configBigNumber: {
    fontFamily: "var(--font-display)",
    fontSize: "var(--text-4xl)",
    color: "var(--color-ink-strong)",
    lineHeight: 1,
    letterSpacing: "var(--tracking-tight)",
    fontVariantNumeric: "tabular-nums",
  },
  configUnit: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-sm)",
    color: "var(--color-ink-muted)",
  },
  configMeta: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "var(--space-3)",
    paddingTop: "var(--space-3)",
    borderTop: "1px dashed var(--color-border)",
  },
  configMetaItem: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    flex: "1 1 auto",
  },
  configMetaLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-wider)",
    textTransform: "uppercase" as const,
  },
  configMetaValue: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-md)",
    fontWeight: 600,
    color: "var(--color-ink)",
    fontVariantNumeric: "tabular-nums",
  },
  latencyBar: {
    position: "relative",
    height: 8,
    background: "var(--color-border)",
    borderRadius: "var(--radius-full)",
    overflow: "hidden",
  },
  latencyFill: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    borderRadius: "var(--radius-full)",
    transition: "width var(--duration-slow) var(--ease-out)",
  },
  thresholdLine: {
    position: "absolute",
    top: -2,
    bottom: -2,
    width: 2,
    background: "var(--color-error)",
    opacity: 0.5,
  },
};

const patternLabel = {
  sequential: "Sequential",
  parallel: "Parallel",
  conditional: "Conditional",
  deep: "Deep",
};

function patternStyle(p: GraphConfig["pattern"]): CSSProperties {
  const map = {
    sequential: styles.patternSequential,
    parallel: styles.patternParallel,
    conditional: styles.patternConditional,
    deep: styles.patternDeep,
  };
  return { ...styles.configPattern, ...map[p] };
}

const maxLatencyForBar = (configs: GraphConfig[]) =>
  Math.max(...configs.map((c) => c.p99LatencyMs));

const ConfigCard = ({
  config,
  isBest,
  maxLatency,
}: {
  config: GraphConfig;
  isBest: boolean;
  maxLatency: number;
}) => (
  <div style={{ ...styles.configCard, ...(isBest ? styles.configCardBest : {}) }}>
    {isBest && <div style={styles.bestBadge}>Best</div>}
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      <div style={styles.configName}>{config.name}</div>
      <span style={patternStyle(config.pattern)}>{patternLabel[config.pattern]}</span>
    </div>
    <div style={styles.configDesc}>{config.description}</div>
    <div style={styles.configTopLine}>
      <span style={styles.configBigNumber}>{Math.round(config.p50LatencyMs)}</span>
      <span style={styles.configUnit}>ms · p50</span>
    </div>
    <div style={styles.latencyBar}>
      <div
        style={{
          ...styles.latencyFill,
          width: `${(config.p99LatencyMs / maxLatency) * 100}%`,
          background: isBest ? "var(--color-highlight)" : "var(--color-accent)",
        }}
      />
    </div>
    <div style={styles.configMeta}>
      <div style={styles.configMetaItem}>
        <div style={styles.configMetaLabel}>Nodes / Edges</div>
        <div style={styles.configMetaValue}>
          {config.nodes} / {config.edges}
        </div>
      </div>
      <div style={styles.configMetaItem}>
        <div style={styles.configMetaLabel}>Throughput</div>
        <div style={styles.configMetaValue}>{AU.throughput(config.throughputTps)}</div>
      </div>
      <div style={styles.configMetaItem}>
        <div style={styles.configMetaLabel}>p99</div>
        <div style={styles.configMetaValue}>{AU.latency(config.p99LatencyMs)}</div>
      </div>
      <div style={styles.configMetaItem}>
        <div style={styles.configMetaLabel}>Failures</div>
        <div style={styles.configMetaValue}>{AU.percent(config.failureRate)}</div>
      </div>
    </div>
  </div>
);

const configColumns: Column<GraphConfig>[] = [
  {
    key: "name",
    header: "Configuration",
    render: (r) => (
      <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>{r.name}</span>
    ),
  },
  {
    key: "nodes",
    header: "Nodes",
    align: "right",
    width: "80px",
    mono: true,
    render: (r) => r.nodes,
  },
  {
    key: "edges",
    header: "Edges",
    align: "right",
    width: "80px",
    mono: true,
    render: (r) => r.edges,
  },
  {
    key: "avg",
    header: "Avg",
    align: "right",
    width: "90px",
    mono: true,
    render: (r) => AU.latency(r.avgLatencyMs),
  },
  {
    key: "p50",
    header: "p50",
    align: "right",
    width: "90px",
    mono: true,
    render: (r) => AU.latency(r.p50LatencyMs),
  },
  {
    key: "p90",
    header: "p90",
    align: "right",
    width: "90px",
    mono: true,
    render: (r) => AU.latency(r.p90LatencyMs),
  },
  {
    key: "p99",
    header: "p99",
    align: "right",
    width: "90px",
    mono: true,
    render: (r) => AU.latency(r.p99LatencyMs),
  },
  {
    key: "tps",
    header: "Throughput",
    align: "right",
    width: "110px",
    mono: true,
    render: (r) => AU.throughput(r.throughputTps),
  },
  {
    key: "speedup",
    header: "Speedup",
    align: "right",
    width: "100px",
    mono: true,
    render: (r) => (
      <span
        style={{
          color: r.speedup > 1 ? "var(--color-success)" : r.speedup < 1 ? "var(--color-error)" : "var(--color-ink-muted)",
          fontWeight: 600,
        }}
      >
        {r.speedup.toFixed(2)}×
      </span>
    ),
  },
];

interface Experiment3Props {
  status: "idle" | "running" | "complete" | "error";
  onRun: () => void;
  onComplete: () => void;
}

export function Experiment3Perf({ status, onRun, onComplete }: Experiment3Props) {
  const [progress, setProgress] = useState(0);

  const bestConfig = perfData.configurations.find((c) => c.isBest);
  const maxLatency = maxLatencyForBar(perfData.configurations);

  const handleRun = () => {
    onRun();
    setProgress(0);
    const start = performance.now();
    const duration = 2200;
    const tick = () => {
      const elapsed = performance.now() - start;
      const p = Math.min(1, elapsed / duration);
      setProgress(p);
      if (p < 1) requestAnimationFrame(tick);
      else onComplete();
    };
    requestAnimationFrame(tick);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-9)" }}>
      <Section>
        <SectionHeader
          subtitle={perfData.subtitle}
          title={perfData.title}
          description={perfData.description}
          aside={
            <>
              <StatusIndicator status={status} label="Orchestrator" />
              <RunButton
                onClick={handleRun}
                running={status === "running"}
                label="Run latency benchmark"
                runningLabel="Running 400 iterations…"
              />
            </>
          }
        />
      </Section>

      {status === "running" && <ProgressBar value={progress} color="accent" />}

      <Section>
        <div className="eyebrow" style={{ paddingLeft: 4 }}>Headline</div>
        <div style={styles.summary}>
          <MetricCard
            label="Best p50"
            value={`${Math.round(bestConfig?.p50LatencyMs ?? 0)} ms`}
            sublabel={bestConfig?.name}
            accent="highlight"
            size="lg"
          />
          <MetricCard
            label="Best throughput"
            value={AU.throughput(bestConfig?.throughputTps ?? 0)}
            sublabel={`vs ${AU.throughput(perfData.configurations[0].throughputTps)} sequential`}
            accent="accent"
            size="lg"
          />
          <MetricCard
            label="Worst-case p99"
            value={AU.latency(perfData.configurations[3].p99LatencyMs)}
            sublabel="Deep Chain — 10 nodes"
            accent="error"
            size="lg"
          />
          <MetricCard
            label="Target threshold"
            value={`${perfData.targetLatencyMs / 1000} s`}
            sublabel="All configurations pass"
            accent="success"
            size="lg"
          />
        </div>
      </Section>

      <Section>
        <div className="eyebrow" style={{ paddingLeft: 4 }}>Per configuration</div>
        <div style={styles.configs}>
          {perfData.configurations.map((c) => (
            <ConfigCard
              key={c.name}
              config={c}
              isBest={c.isBest}
              maxLatency={maxLatency}
            />
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader
          subtitle="Comparison"
          title="Full benchmark table"
          description="100 iterations per configuration. Speedup is measured against the Sequential Chain baseline."
        />
        <DataTable
          columns={configColumns}
          rows={perfData.configurations}
          rowKey={(r) => r.name}
          highlight={(r) => r.isBest}
        />
      </Section>
    </div>
  );
}
