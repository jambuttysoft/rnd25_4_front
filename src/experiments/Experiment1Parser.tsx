import { useState } from "react";
import { MetricCard } from "../components/MetricCard";
import { ProgressBar } from "../components/ProgressBar";
import { StatusIndicator } from "../components/StatusIndicator";
import { RunButton } from "../components/RunButton";
import { DataTable, type Column } from "../components/DataTable";
import { Section, SectionHeader } from "../components/SectionHeader";
import { parserData, type SampleReceipt, type FieldMetrics } from "../data/parserData";
import { AU } from "../utils/format";
import type { CSSProperties } from "react";

const styles: Record<string, CSSProperties> = {
  summary: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "var(--space-4)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "var(--space-4)",
  },
  fieldCard: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--space-5)",
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-3)",
    boxShadow: "var(--shadow-sm)",
  },
  fieldName: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    fontWeight: 500,
    letterSpacing: "var(--tracking-wider)",
    textTransform: "uppercase" as const,
    color: "var(--color-ink-muted)",
  },
  fieldDesc: {
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-subtle)",
    lineHeight: 1.5,
    minHeight: 32,
  },
  fieldValue: {
    fontFamily: "var(--font-display)",
    fontSize: "var(--text-3xl)",
    color: "var(--color-ink-strong)",
    lineHeight: 1,
    letterSpacing: "var(--tracking-tight)",
  },
  fieldMetrics: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "var(--space-3)",
    paddingTop: "var(--space-3)",
    borderTop: "1px dashed var(--color-border)",
  },
  fieldMetricItem: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  fieldMetricLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-wide)",
    textTransform: "uppercase" as const,
  },
  fieldMetricValue: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-md)",
    fontWeight: 600,
    color: "var(--color-ink)",
    fontVariantNumeric: "tabular-nums",
  },
  winner: {
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
  },
  winnerVector: {
    background: "var(--color-accent-soft)",
    color: "var(--color-accent-deep)",
  },
  winnerKeyword: {
    background: "var(--color-highlight-soft)",
    color: "var(--color-highlight)",
  },
  winnerTie: {
    background: "var(--color-surface-sunken)",
    color: "var(--color-ink-muted)",
  },
};

const fieldLabels: Record<string, string> = {
  cash_out: "Cash-out",
  loyalty_points_spent: "Loyalty Points",
  card_fee_amount: "Card Acquirer Fee",
  net_goods_amount: "Net Goods Amount",
};

function FieldCard({ field }: { field: FieldMetrics }) {
  return (
    <div style={styles.fieldCard}>
      <div style={styles.fieldName}>{fieldLabels[field.field]}</div>
      <div style={styles.fieldDesc}>{field.description}</div>
      <div style={styles.fieldValue}>{AU.currency(field.mae)}</div>
      <div style={styles.fieldMetrics}>
        <div style={styles.fieldMetricItem}>
          <div style={styles.fieldMetricLabel}>Accuracy</div>
          <div style={styles.fieldMetricValue}>{AU.percent(field.accuracy)}</div>
        </div>
        <div style={styles.fieldMetricItem}>
          <div style={styles.fieldMetricLabel}>Precision</div>
          <div style={styles.fieldMetricValue}>{AU.percent(field.precision)}</div>
        </div>
        <div style={styles.fieldMetricItem}>
          <div style={styles.fieldMetricLabel}>Recall</div>
          <div style={styles.fieldMetricValue}>{AU.percent(field.recall)}</div>
        </div>
        <div style={styles.fieldMetricItem}>
          <div style={styles.fieldMetricLabel}>F1</div>
          <div style={styles.fieldMetricValue}>{AU.percent(field.f1)}</div>
        </div>
      </div>
    </div>
  );
}

const receiptColumns: Column<SampleReceipt>[] = [
  {
    key: "id",
    header: "Receipt",
    width: "140px",
    render: (r) => (
      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}>
        {r.id}
      </span>
    ),
  },
  {
    key: "merchant",
    header: "Merchant",
    render: (r) => r.merchant,
  },
  {
    key: "total",
    header: "Total",
    align: "right",
    mono: true,
    render: (r) => AU.currency(r.total),
  },
  {
    key: "errors",
    header: "Field Errors",
    align: "right",
    mono: true,
    render: (r) => (
      <span
        style={{
          color: r.errors.length > 2 ? "var(--color-error)" : "var(--color-warning)",
          fontWeight: 600,
        }}
      >
        {r.errors.length}
      </span>
    ),
  },
];

interface Experiment1Props {
  status: "idle" | "running" | "complete" | "error";
  onRun: () => void;
  onComplete: () => void;
}

export function Experiment1Parser({ status, onRun, onComplete }: Experiment1Props) {
  const [progress, setProgress] = useState(0);

  const handleRun = () => {
    onRun();
    setProgress(0);
    const start = performance.now();
    const duration = 1800;
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
          subtitle={parserData.subtitle}
          title={parserData.title}
          description={parserData.description}
          aside={
            <>
              <StatusIndicator status={status} label="Parser workflow" />
              <RunButton
                onClick={handleRun}
                running={status === "running"}
                label="Run parser benchmark"
                runningLabel="Parsing 50 receipts…"
              />
            </>
          }
        />
      </Section>

      {status === "running" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <ProgressBar value={progress} color="accent" />
        </div>
      )}

      <Section>
        <div className="eyebrow" style={{ paddingLeft: 4 }}>Aggregate metrics</div>
        <div style={styles.summary}>
          <MetricCard
            label="Successful parses"
            value={`${parserData.successfulParses} / ${parserData.totalReceipts}`}
            sublabel={`${AU.percent(parserData.successfulParses / parserData.totalReceipts)} of corpus parsed without any field error`}
            accent="success"
            size="lg"
          />
          <MetricCard
            label="Aggregate Precision"
            value={AU.percent(parserData.aggregate.precision)}
            sublabel="Across all 4 fields, 50 receipts"
            accent="accent"
            size="lg"
          />
          <MetricCard
            label="Aggregate Recall"
            value={AU.percent(parserData.aggregate.recall)}
            sublabel="Field-level detection rate"
            accent="highlight"
            size="lg"
          />
          <MetricCard
            label="Aggregate F1"
            value={AU.percent(parserData.aggregate.f1)}
            sublabel="Harmonic mean of precision and recall"
            accent="default"
            size="lg"
          />
        </div>
      </Section>

      <Section>
        <div className="eyebrow" style={{ paddingLeft: 4 }}>Per-field MAE & accuracy</div>
        <div style={styles.grid}>
          {parserData.fieldMetrics.map((f) => (
            <FieldCard key={f.field} field={f} />
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader
          subtitle="Sample receipts"
          title="Top error cases"
          description="Receipts with the largest deviation between expected and predicted field values."
        />
        <DataTable
          columns={[
            ...receiptColumns,
            {
              key: "details",
              header: "Field detail",
              render: (r) => (
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {r.errors.map((e) => (
                    <div
                      key={e.field}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "var(--text-xs)",
                        color: "var(--color-ink-muted)",
                      }}
                    >
                      <span style={{ color: "var(--color-ink-subtle)" }}>{fieldLabels[e.field]}:</span>{" "}
                      <span style={{ color: "var(--color-error)" }}>{AU.currency(e.expected)}</span>
                      <span style={{ color: "var(--color-ink-faint)" }}> → </span>
                      <span style={{ color: "var(--color-ink)" }}>{AU.currency(e.actual)}</span>
                      <span style={{ color: "var(--color-ink-faint)", marginLeft: 6 }}>
                        (Δ {AU.delta(e.actual, e.expected)})
                      </span>
                    </div>
                  ))}
                </div>
              ),
            },
          ]}
          rows={parserData.sampleReceipts}
          rowKey={(r) => r.id}
        />
      </Section>
    </div>
  );
}
