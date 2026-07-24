import { useState } from "react";
import { MetricCard } from "../components/MetricCard";
import { ProgressBar } from "../components/ProgressBar";
import { StatusIndicator } from "../components/StatusIndicator";
import { RunButton } from "../components/RunButton";
import { DataTable, type Column } from "../components/DataTable";
import { Section, SectionHeader } from "../components/SectionHeader";
import { ragData, type QueryResult, type Difficulty } from "../data/ragData";
import { AU } from "../utils/format";
import type { CSSProperties } from "react";

const styles: Record<string, CSSProperties> = {
  summary: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "var(--space-4)",
  },
  comparison: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "var(--space-6)",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--space-6)",
    boxShadow: "var(--shadow-sm)",
  },
  comparisonSide: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-3)",
  },
  comparisonLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    fontWeight: 500,
    letterSpacing: "var(--tracking-widest)",
    textTransform: "uppercase" as const,
    color: "var(--color-ink-muted)",
  },
  comparisonValue: {
    fontFamily: "var(--font-display)",
    fontSize: "var(--text-5xl)",
    fontWeight: 400,
    color: "var(--color-ink-strong)",
    lineHeight: 1,
    letterSpacing: "var(--tracking-tight)",
    fontVariantNumeric: "tabular-nums",
  },
  difficultyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "var(--space-4)",
  },
  difficultyCard: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--space-5)",
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-3)",
    boxShadow: "var(--shadow-sm)",
  },
  difficultyName: {
    fontFamily: "var(--font-display)",
    fontSize: "var(--text-2xl)",
    color: "var(--color-ink-strong)",
    lineHeight: 1,
    letterSpacing: "var(--tracking-tight)",
  },
  badge: {
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
  badgeEasy: { background: "var(--color-success-soft)", color: "var(--color-success)" },
  badgeMedium: { background: "var(--color-warning-soft)", color: "var(--color-warning)" },
  badgeHard: { background: "var(--color-error-soft)", color: "var(--color-error)" },
  badgeTie: { background: "var(--color-surface-sunken)", color: "var(--color-ink-muted)" },
  badgeVector: { background: "var(--color-accent-soft)", color: "var(--color-accent-deep)" },
  badgeKeyword: { background: "var(--color-highlight-soft)", color: "var(--color-highlight)" },
  deltas: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-2)",
  },
  deltaRow: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-3)",
  },
  deltaLabel: {
    width: 60,
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    textTransform: "uppercase" as const,
    letterSpacing: "var(--tracking-wider)",
  },
  deltaValue: {
    flex: 1,
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-md)",
    fontWeight: 600,
    color: "var(--color-ink)",
    fontVariantNumeric: "tabular-nums",
  },
  query: {
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-sm)",
    color: "var(--color-ink)",
    lineHeight: 1.4,
    maxWidth: 380,
  },
};

const diffBadgeStyle: Record<Difficulty, CSSProperties> = {
  easy: styles.badgeEasy,
  medium: styles.badgeMedium,
  hard: styles.badgeHard,
};

const diffLabel: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

function DifficultyCard({
  name,
  vector,
  keyword,
}: {
  name: string;
  vector: number;
  keyword: number;
}) {
  const diff = vector - keyword;
  return (
    <div style={styles.difficultyCard}>
      <div style={styles.difficultyName}>{name}</div>
      <div style={styles.deltas}>
        <div style={styles.deltaRow}>
          <span style={styles.deltaLabel}>Vector</span>
          <span style={styles.deltaValue}>{AU.percent(vector)}</span>
        </div>
        <ProgressBar
          value={vector}
          color="accent"
          showValue={false}
        />
        <div style={styles.deltaRow}>
          <span style={styles.deltaLabel}>Keyword</span>
          <span style={styles.deltaValue}>{AU.percent(keyword)}</span>
        </div>
        <ProgressBar
          value={keyword}
          color="highlight"
          showValue={false}
        />
        <div
          style={{
            marginTop: "var(--space-2)",
            paddingTop: "var(--space-3)",
            borderTop: "1px dashed var(--color-border)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            color: diff > 0 ? "var(--color-accent-deep)" : "var(--color-highlight)",
            fontWeight: 600,
          }}
        >
          {diff > 0 ? "Vector" : "Keyword"} {diff > 0 ? "+" : "−"}{Math.abs(Math.round(diff * 100))}%
        </div>
      </div>
    </div>
  );
}

const queryColumns: Column<QueryResult>[] = [
  {
    key: "id",
    header: "ID",
    width: "60px",
    render: (r) => (
      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--color-ink-muted)" }}>
        {r.id}
      </span>
    ),
  },
  {
    key: "difficulty",
    header: "Difficulty",
    width: "100px",
    render: (r) => (
      <span style={{ ...styles.badge, ...diffBadgeStyle[r.difficulty] }}>
        {diffLabel[r.difficulty]}
      </span>
    ),
  },
  {
    key: "query",
    header: "Query",
    render: (r) => (
      <div>
        <div style={styles.query}>{r.query}</div>
        <div
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-ink-subtle)",
            marginTop: 2,
            fontStyle: "italic",
          }}
        >
          {r.scenario}
        </div>
      </div>
    ),
  },
  {
    key: "vector",
    header: "Vector",
    align: "right",
    width: "90px",
    mono: true,
    render: (r) => (
      <span
        style={{
          color: r.vectorHitRate > r.keywordHitRate ? "var(--color-accent-deep)" : "var(--color-ink)",
          fontWeight: r.vectorHitRate > r.keywordHitRate ? 600 : 400,
        }}
      >
        {AU.percent(r.vectorHitRate)}
      </span>
    ),
  },
  {
    key: "keyword",
    header: "Keyword",
    align: "right",
    width: "100px",
    mono: true,
    render: (r) => (
      <span
        style={{
          color: r.keywordHitRate > r.vectorHitRate ? "var(--color-highlight)" : "var(--color-ink)",
          fontWeight: r.keywordHitRate > r.vectorHitRate ? 600 : 400,
        }}
      >
        {AU.percent(r.keywordHitRate)}
      </span>
    ),
  },
  {
    key: "winner",
    header: "Winner",
    width: "90px",
    align: "center",
    render: (r) => {
      const map = {
        vector: { style: styles.badgeVector, label: "Vector" },
        keyword: { style: styles.badgeKeyword, label: "Keyword" },
        tie: { style: styles.badgeTie, label: "Tie" },
      } as const;
      const cfg = map[r.winner];
      return <span style={{ ...styles.badge, ...cfg.style }}>{cfg.label}</span>;
    },
  },
];

interface Experiment2Props {
  status: "idle" | "running" | "complete" | "error";
  onRun: () => void;
  onComplete: () => void;
}

export function Experiment2Rag({ status, onRun, onComplete }: Experiment2Props) {
  const [progress, setProgress] = useState(0);

  const handleRun = () => {
    onRun();
    setProgress(0);
    const start = performance.now();
    const duration = 1400;
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
          subtitle={ragData.subtitle}
          title={ragData.title}
          description={ragData.description}
          aside={
            <>
              <StatusIndicator status={status} label="Search engines" />
              <RunButton
                onClick={handleRun}
                running={status === "running"}
                label="Run RAG evaluation"
                runningLabel="Evaluating 20 queries…"
              />
            </>
          }
        />
      </Section>

      {status === "running" && (
        <ProgressBar value={progress} color="accent" />
      )}

      <Section>
        <div className="eyebrow" style={{ paddingLeft: 4 }}>Head-to-head</div>
        <div style={styles.summary}>
          <MetricCard
            label="Vector hit rate"
            value={AU.percent(ragData.aggregate.vectorHitRate)}
            sublabel="TF-IDF + synonym expansion"
            accent="accent"
            size="lg"
          />
          <MetricCard
            label="Keyword hit rate"
            value={AU.percent(ragData.aggregate.keywordHitRate)}
            sublabel="Token overlap baseline"
            accent="highlight"
            size="lg"
          />
          <MetricCard
            label="Vector wins"
            value={ragData.aggregate.vectorWins}
            sublabel={`vs ${ragData.aggregate.keywordWins} keyword · ${ragData.aggregate.ties} ties`}
            accent="success"
            size="lg"
          />
          <MetricCard
            label="Avg latency"
            value={AU.latency(ragData.latency.vectorMs)}
            sublabel={`Keyword: ${AU.latency(ragData.latency.keywordMs)}`}
            accent="default"
            size="lg"
          />
        </div>
      </Section>

      <Section>
        <div className="eyebrow" style={{ paddingLeft: 4 }}>Hit rate by difficulty</div>
        <div style={styles.difficultyGrid}>
          <DifficultyCard
            name="Easy"
            vector={ragData.difficultyBreakdown.easy.vector}
            keyword={ragData.difficultyBreakdown.easy.keyword}
          />
          <DifficultyCard
            name="Medium"
            vector={ragData.difficultyBreakdown.medium.vector}
            keyword={ragData.difficultyBreakdown.medium.keyword}
          />
          <DifficultyCard
            name="Hard"
            vector={ragData.difficultyBreakdown.hard.vector}
            keyword={ragData.difficultyBreakdown.hard.keyword}
          />
        </div>
      </Section>

      <Section>
        <SectionHeader
          subtitle="Query-by-query"
          title="Per-query results"
          description="Hit rate in the top-5 retrieved paragraphs. Bold winner is the system with the higher hit rate on that query."
        />
        <DataTable
          columns={queryColumns}
          rows={ragData.queries}
          rowKey={(r) => r.id}
        />
      </Section>
    </div>
  );
}
