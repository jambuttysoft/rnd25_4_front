import type { CSSProperties } from "react";
import { useMemo } from "react";
import { usePipeline } from "../../state/PipelineContext";
import { ragData, type Difficulty, type QueryResult } from "../../data/ragData";
import { AU } from "../../utils/format";
import type { ExpenseCategory } from "../../types/pipeline";

const CATEGORY_QUERY_KEYWORDS: Record<ExpenseCategory, string[]> = {
  Fuel: ["fuel", "car", "transport", "drive", "petrol", "gas", "vehicle"],
  Food: ["lunch", "meal", "per diem", "food", "dining", "restaurant", "breakfast"],
  Transport: ["taxi", "transport", "travel", "airport", "flight", "trip", "uber", "ride"],
  Accommodation: ["hotel", "accommodation", "rent", "lodging", "stay"],
  Training: ["training", "course", "reimbursement", "conference", "workshop", "learn"],
  Equipment: ["laptop", "monitor", "keyboard", "equipment", "computer", "device", "hardware"],
  Office: ["office", "supplies", "stationery", "desk"],
  Other: [],
};

const styles: Record<string, CSSProperties> = {
  wrap: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--space-7)",
    boxShadow: "var(--shadow-sm)",
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-7)",
    animation: "fadeInUp 600ms var(--ease-out) both",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "var(--space-4)",
    paddingBottom: "var(--space-5)",
    borderBottom: "1px solid var(--color-border)",
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
  title: {
    fontFamily: "var(--font-display)",
    fontSize: "var(--text-2xl)",
    color: "var(--color-ink-strong)",
    lineHeight: 1.1,
    letterSpacing: "var(--tracking-tight)",
  },
  subtitle: {
    fontSize: "var(--text-sm)",
    color: "var(--color-ink-muted)",
    lineHeight: 1.5,
    maxWidth: 560,
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-4)",
  },
  sectionLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-widest)",
    textTransform: "uppercase" as const,
    fontWeight: 500,
    paddingLeft: 4,
  },
  perfRow: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: "var(--space-3)",
  },
  perfCard: {
    background: "var(--color-surface-sunken)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-4)",
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-2)",
    minHeight: 140,
    position: "relative",
  },
  perfCardCentered: {
    alignItems: "center",
    justifyContent: "center",
  },
  perfLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-wider)",
    textTransform: "uppercase" as const,
  },
  perfValue: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-2xl)",
    fontWeight: 600,
    color: "var(--color-ink-strong)",
    lineHeight: 1,
    letterSpacing: "var(--tracking-tight)",
    fontVariantNumeric: "tabular-nums" as const,
  },
  perfValueAccent: {
    color: "var(--color-accent-deep)",
  },
  perfValueWarning: {
    color: "var(--color-warning)",
  },
  perfSub: {
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-subtle)",
    lineHeight: 1.4,
  },
  circular: {
    position: "relative",
    width: 56,
    height: 56,
    borderRadius: "50%",
  },
  circularInner: {
    position: "absolute",
    top: 5,
    left: 5,
    right: 5,
    bottom: 5,
    borderRadius: "50%",
    background: "var(--color-surface)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-sm)",
    fontWeight: 600,
    color: "var(--color-ink-strong)",
    fontVariantNumeric: "tabular-nums" as const,
  },
  perfCardRow: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-3)",
  },
  perfCardText: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  winBar: {
    display: "flex",
    height: 36,
    width: "100%",
    borderRadius: "var(--radius-md)",
    overflow: "hidden",
    border: "1px solid var(--color-border)",
    background: "var(--color-surface-sunken)",
  },
  winSegment: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--color-paper)",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-sm)",
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums" as const,
    transition: "all var(--duration-slow) var(--ease-out)",
    minWidth: 0,
    overflow: "hidden",
    whiteSpace: "nowrap" as const,
  },
  winLegend: {
    display: "flex",
    gap: "var(--space-5)",
    marginTop: "var(--space-2)",
    flexWrap: "wrap" as const,
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-2)",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  diffGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "var(--space-4)",
  },
  diffCard: {
    background: "var(--color-surface-sunken)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-5)",
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-3)",
  },
  diffName: {
    fontFamily: "var(--font-display)",
    fontSize: "var(--text-2xl)",
    color: "var(--color-ink-strong)",
    lineHeight: 1,
    letterSpacing: "var(--tracking-tight)",
  },
  diffBars: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-3)",
  },
  diffBarRow: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  diffBarLabel: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    textTransform: "uppercase" as const,
    letterSpacing: "var(--tracking-wider)",
  },
  diffBarValue: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-sm)",
    fontWeight: 600,
    color: "var(--color-ink-strong)",
    fontVariantNumeric: "tabular-nums" as const,
  },
  diffTrack: {
    height: 10,
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-full)",
    overflow: "hidden",
  },
  diffFill: {
    height: "100%",
    borderRadius: "var(--radius-full)",
    transition: "width var(--duration-slow) var(--ease-out)",
  },
  queryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "var(--space-3)",
  },
  queryCard: {
    background: "var(--color-surface-sunken)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-4)",
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-3)",
  },
  queryCardHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "var(--space-2)",
  },
  queryId: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    fontWeight: 600,
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-wider)",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 8px",
    borderRadius: "var(--radius-full)",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "var(--tracking-wider)",
  },
  badgeEasy: {
    background: "var(--color-success-soft)",
    color: "var(--color-success)",
    border: "1px solid var(--color-success)",
  },
  badgeMedium: {
    background: "var(--color-warning-soft)",
    color: "var(--color-warning)",
    border: "1px solid var(--color-warning)",
  },
  badgeHard: {
    background: "var(--color-error-soft)",
    color: "var(--color-error)",
    border: "1px solid var(--color-error)",
  },
  badgeVector: {
    background: "var(--color-accent-soft)",
    color: "var(--color-accent-deep)",
    border: "1px solid var(--color-accent-deep)",
  },
  badgeKeyword: {
    background: "var(--color-warning-soft)",
    color: "var(--color-warning)",
    border: "1px solid var(--color-warning)",
  },
  badgeTie: {
    background: "var(--color-surface-sunken)",
    color: "var(--color-ink-muted)",
    border: "1px solid var(--color-border-strong)",
  },
  queryText: {
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-sm)",
    color: "var(--color-ink)",
    lineHeight: 1.45,
    fontWeight: 500,
  },
  queryScenario: {
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-subtle)",
    fontStyle: "italic",
    lineHeight: 1.4,
  },
  queryBars: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  queryBar: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  queryBarHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    textTransform: "uppercase" as const,
    letterSpacing: "var(--tracking-wider)",
  },
  queryBarValue: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    fontWeight: 600,
    color: "var(--color-ink-strong)",
    fontVariantNumeric: "tabular-nums" as const,
  },
  queryBarTrack: {
    height: 6,
    background: "var(--color-surface)",
    borderRadius: "var(--radius-full)",
    overflow: "hidden",
    border: "1px solid var(--color-border)",
  },
  queryBarFill: {
    height: "100%",
    borderRadius: "var(--radius-full)",
    transition: "width var(--duration-slow) var(--ease-out)",
  },
  empty: {
    padding: "var(--space-7) var(--space-5)",
    textAlign: "center",
    color: "var(--color-ink-muted)",
    fontStyle: "italic",
    background: "var(--color-surface-sunken)",
    borderRadius: "var(--radius-md)",
    border: "1px dashed var(--color-border-strong)",
  },
  receiptTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--space-2)",
    padding: "4px 10px",
    background: "var(--color-accent-soft)",
    color: "var(--color-accent-deep)",
    borderRadius: "var(--radius-full)",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "var(--tracking-wider)",
    border: "1px solid var(--color-accent-deep)",
  },
  categoryChips: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "var(--space-2)",
  },
  categoryChip: {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 8px",
    borderRadius: "var(--radius-sm)",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "var(--tracking-wider)",
  },
  latencyRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "var(--space-3)",
  },
  latencyCard: {
    background: "var(--color-surface-sunken)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-4)",
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  latencyLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-wider)",
    textTransform: "uppercase" as const,
  },
  latencyValue: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-3xl)",
    fontWeight: 600,
    color: "var(--color-ink-strong)",
    lineHeight: 1,
    letterSpacing: "var(--tracking-tight)",
    fontVariantNumeric: "tabular-nums" as const,
  },
  latencySub: {
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-subtle)",
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

const winnerStyle: Record<"vector" | "keyword" | "tie", CSSProperties> = {
  vector: styles.badgeVector,
  keyword: styles.badgeKeyword,
  tie: styles.badgeTie,
};

const winnerLabel: Record<"vector" | "keyword" | "tie", string> = {
  vector: "Vector",
  keyword: "Keyword",
  tie: "Tie",
};

const CATEGORY_COLOR_VARS: Record<ExpenseCategory, { fg: string; bg: string }> = {
  Fuel: { fg: "var(--cat-fuel)", bg: "var(--cat-fuel-soft)" },
  Food: { fg: "var(--cat-food)", bg: "var(--cat-food-soft)" },
  Transport: { fg: "var(--cat-transport)", bg: "var(--cat-transport-soft)" },
  Accommodation: { fg: "var(--cat-accommodation)", bg: "var(--cat-accommodation-soft)" },
  Training: { fg: "var(--cat-training)", bg: "var(--cat-training-soft)" },
  Equipment: { fg: "var(--cat-equipment)", bg: "var(--cat-equipment-soft)" },
  Office: { fg: "var(--cat-office)", bg: "var(--cat-office-soft)" },
  Other: { fg: "var(--cat-other)", bg: "var(--cat-other-soft)" },
};

function CircularProgress({
  value,
  color = "var(--color-accent-deep)",
  trackColor = "var(--color-border)",
  size = 56,
  thickness = 5,
  label,
}: {
  value: number;
  color?: string;
  trackColor?: string;
  size?: number;
  thickness?: number;
  label: string;
}) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <div
      style={{
        ...styles.circular,
        width: size,
        height: size,
        background: `conic-gradient(${color} 0% ${pct * 100}%, ${trackColor} ${pct * 100}% 100%)`,
      }}
      role="img"
      aria-label={`${label}: ${Math.round(pct * 100)} percent`}
    >
      <div
        style={{
          ...styles.circularInner,
          top: thickness,
          left: thickness,
          right: thickness,
          bottom: thickness,
        }}
      >
        {Math.round(pct * 100)}%
      </div>
    </div>
  );
}

function PerfCard({
  label,
  value,
  sub,
  variant = "default",
  hasCircle = false,
}: {
  label: string;
  value: string;
  sub?: string;
  variant?: "default" | "accent" | "warning";
  hasCircle?: boolean;
}) {
  const valueStyle =
    variant === "accent"
      ? { ...styles.perfValue, ...styles.perfValueAccent }
      : variant === "warning"
        ? { ...styles.perfValue, ...styles.perfValueWarning }
        : styles.perfValue;
  return (
    <div style={styles.perfCard}>
      <span style={styles.perfLabel}>{label}</span>
      {hasCircle ? (
        <div style={styles.perfCardRow}>
          <CircularProgress
            value={
              variant === "warning"
                ? ragData.aggregate.keywordHitRate
                : ragData.aggregate.vectorHitRate
            }
            color={
              variant === "warning" ? "var(--color-warning)" : "var(--color-accent-deep)"
            }
            label={label}
          />
          <div style={styles.perfCardText}>
            <span style={valueStyle}>{value}</span>
            {sub && <span style={styles.perfSub}>{sub}</span>}
          </div>
        </div>
      ) : (
        <>
          <span style={valueStyle}>{value}</span>
          {sub && <span style={styles.perfSub}>{sub}</span>}
        </>
      )}
    </div>
  );
}

function DifficultyBar({
  name,
  vector,
  keyword,
}: {
  name: string;
  vector: number;
  keyword: number;
}) {
  return (
    <div style={styles.diffCard}>
      <div style={styles.diffName}>{name}</div>
      <div style={styles.diffBars}>
        <div style={styles.diffBarRow}>
          <div style={styles.diffBarLabel}>
            <span>Vector</span>
            <span style={styles.diffBarValue}>{AU.percent(vector)}</span>
          </div>
          <div style={styles.diffTrack}>
            <div
              style={{
                ...styles.diffFill,
                width: `${vector * 100}%`,
                background: "var(--color-accent-deep)",
              }}
            />
          </div>
        </div>
        <div style={styles.diffBarRow}>
          <div style={styles.diffBarLabel}>
            <span>Keyword</span>
            <span style={styles.diffBarValue}>{AU.percent(keyword)}</span>
          </div>
          <div style={styles.diffTrack}>
            <div
              style={{
                ...styles.diffFill,
                width: `${keyword * 100}%`,
                background: "var(--color-warning)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function QueryCard({ q, matchingCategories }: { q: QueryResult; matchingCategories: ExpenseCategory[] }) {
  return (
    <div style={styles.queryCard}>
      <div style={styles.queryCardHead}>
        <span style={styles.queryId}>{q.id}</span>
        <span style={{ ...styles.badge, ...diffBadgeStyle[q.difficulty] }}>
          {diffLabel[q.difficulty]}
        </span>
        <span style={{ ...styles.badge, ...winnerStyle[q.winner] }}>
          {winnerLabel[q.winner]}
        </span>
      </div>
      <div>
        <div style={styles.queryText}>{q.query}</div>
        <div style={{ ...styles.queryScenario, marginTop: 2 }}>{q.scenario}</div>
      </div>
      {matchingCategories.length > 0 && (
        <div style={styles.categoryChips}>
          {matchingCategories.map((cat) => {
            const colors = CATEGORY_COLOR_VARS[cat];
            return (
              <span
                key={cat}
                style={{
                  ...styles.categoryChip,
                  background: colors.bg,
                  color: colors.fg,
                  border: `1px solid ${colors.fg}`,
                }}
              >
                {cat}
              </span>
            );
          })}
        </div>
      )}
      <div style={styles.queryBars}>
        <div style={styles.queryBar}>
          <div style={styles.queryBarHead}>
            <span>Vector</span>
            <span style={styles.queryBarValue}>{AU.percent(q.vectorHitRate)}</span>
          </div>
          <div style={styles.queryBarTrack}>
            <div
              style={{
                ...styles.queryBarFill,
                width: `${q.vectorHitRate * 100}%`,
                background: "var(--color-accent-deep)",
              }}
            />
          </div>
        </div>
        <div style={styles.queryBar}>
          <div style={styles.queryBarHead}>
            <span>Keyword</span>
            <span style={styles.queryBarValue}>{AU.percent(q.keywordHitRate)}</span>
          </div>
          <div style={styles.queryBarTrack}>
            <div
              style={{
                ...styles.queryBarFill,
                width: `${q.keywordHitRate * 100}%`,
                background: "var(--color-warning)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function RagInsights() {
  const { selectedReceipt, lastResult } = usePipeline();

  const receiptCategories = useMemo<ExpenseCategory[]>(() => {
    if (!lastResult?.byCategory) return [];
    return lastResult.byCategory.map((b) => b.category);
  }, [lastResult]);

  const matchedQueries = useMemo(() => {
    if (receiptCategories.length === 0) return [] as Array<{ q: QueryResult; cats: ExpenseCategory[] }>;
    const allKeywords = receiptCategories.flatMap(
      (c) => CATEGORY_QUERY_KEYWORDS[c] ?? [],
    );
    if (allKeywords.length === 0) return [] as Array<{ q: QueryResult; cats: ExpenseCategory[] }>;
    const lowerKeywords = allKeywords.map((k) => k.toLowerCase());
    return ragData.queries
      .map((q) => {
        const qLower = q.query.toLowerCase();
        const matchedCats = receiptCategories.filter((cat) => {
          const kws = CATEGORY_QUERY_KEYWORDS[cat] ?? [];
          return kws.some((kw) => qLower.includes(kw.toLowerCase()));
        });
        const anyMatch = lowerKeywords.some((kw) => qLower.includes(kw));
        return anyMatch ? { q, cats: matchedCats } : null;
      })
      .filter((entry): entry is { q: QueryResult; cats: ExpenseCategory[] } => entry !== null);
  }, [receiptCategories]);

  const { aggregate, difficultyBreakdown, latency, corpus, queries } = ragData;
  const totalQueries = queries.length;
  const vectorWins = aggregate.vectorWins;
  const keywordWins = aggregate.keywordWins;
  const ties = aggregate.ties;

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.headerText}>
          <span style={styles.eyebrow}>Step 03a — RAG Relevance</span>
          <h3 style={styles.title}>Policy search evaluation</h3>
          <p style={styles.subtitle}>
            {ragData.description} The 20 queries below are the ground truth we use to
            judge retrieval quality — and we now show which ones apply to the current
            receipt.
          </p>
        </div>
        {selectedReceipt && (
          <span style={styles.receiptTag}>
            ◉ {selectedReceipt.filename}
          </span>
        )}
      </div>

      <div style={styles.section}>
        <span style={styles.sectionLabel}>Performance overview</span>
        <div style={styles.perfRow}>
          <PerfCard
            label="Vector hit rate"
            value={AU.percent(aggregate.vectorHitRate)}
            sub="TF-IDF + synonym"
            variant="accent"
            hasCircle
          />
          <PerfCard
            label="Keyword hit rate"
            value={AU.percent(aggregate.keywordHitRate)}
            sub="Token overlap"
            variant="warning"
            hasCircle
          />
          <PerfCard
            label="Vector precision"
            value={AU.percent(aggregate.vectorPrecision)}
            sub="Top-5 precision"
            variant="accent"
          />
          <PerfCard
            label="Keyword precision"
            value={AU.percent(aggregate.keywordPrecision)}
            sub="Top-5 precision"
            variant="warning"
          />
          <PerfCard
            label="Corpus size"
            value={`${corpus.documents} docs`}
            sub={`${corpus.paragraphs} paragraphs`}
          />
        </div>
      </div>

      <div style={styles.section}>
        <span style={styles.sectionLabel}>Win distribution</span>
        <div style={styles.winBar}>
          <div
            style={{
              ...styles.winSegment,
              width: `${(vectorWins / totalQueries) * 100}%`,
              background: "var(--color-accent-deep)",
              fontSize: vectorWins / totalQueries < 0.2 ? 0 : undefined,
            }}
            title={`Vector wins: ${vectorWins}`}
          >
            {vectorWins}
          </div>
          <div
            style={{
              ...styles.winSegment,
              width: `${(ties / totalQueries) * 100}%`,
              background: "var(--color-ink-muted)",
              color: "var(--color-paper)",
            }}
            title={`Ties: ${ties}`}
          >
            {ties}
          </div>
          <div
            style={{
              ...styles.winSegment,
              width: `${(keywordWins / totalQueries) * 100}%`,
              background: "var(--color-warning)",
              fontSize: keywordWins / totalQueries < 0.2 ? 0 : undefined,
            }}
            title={`Keyword wins: ${keywordWins}`}
          >
            {keywordWins}
          </div>
        </div>
        <div style={styles.winLegend}>
          <div style={styles.legendItem}>
            <span
              style={{
                ...styles.legendSwatch,
                background: "var(--color-accent-deep)",
              }}
            />
            Vector wins · {vectorWins}
          </div>
          <div style={styles.legendItem}>
            <span
              style={{
                ...styles.legendSwatch,
                background: "var(--color-ink-muted)",
              }}
            />
            Ties · {ties}
          </div>
          <div style={styles.legendItem}>
            <span
              style={{
                ...styles.legendSwatch,
                background: "var(--color-warning)",
              }}
            />
            Keyword wins · {keywordWins}
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <span style={styles.sectionLabel}>Difficulty breakdown</span>
        <div style={styles.diffGrid}>
          <DifficultyBar
            name="Easy"
            vector={difficultyBreakdown.easy.vector}
            keyword={difficultyBreakdown.easy.keyword}
          />
          <DifficultyBar
            name="Medium"
            vector={difficultyBreakdown.medium.vector}
            keyword={difficultyBreakdown.medium.keyword}
          />
          <DifficultyBar
            name="Hard"
            vector={difficultyBreakdown.hard.vector}
            keyword={difficultyBreakdown.hard.keyword}
          />
        </div>
      </div>

      <div style={styles.section}>
        <span style={styles.sectionLabel}>Query relevance to this receipt</span>
        {receiptCategories.length === 0 ? (
          <div style={styles.empty}>
            Upload and process a receipt to see policy relevance.
          </div>
        ) : matchedQueries.length === 0 ? (
          <div style={styles.empty}>
            No policy queries match the categories on this receipt
            {receiptCategories.length > 0 ? ` (${receiptCategories.join(", ")})` : ""}.
          </div>
        ) : (
          <>
            <div style={styles.categoryChips}>
              <span style={styles.perfLabel}>Active categories:</span>
              {receiptCategories.map((cat) => {
                const colors = CATEGORY_COLOR_VARS[cat];
                return (
                  <span
                    key={cat}
                    style={{
                      ...styles.categoryChip,
                      background: colors.bg,
                      color: colors.fg,
                      border: `1px solid ${colors.fg}`,
                    }}
                  >
                    {cat}
                  </span>
                );
              })}
            </div>
            <div style={styles.queryGrid}>
              {matchedQueries.map(({ q, cats }) => (
                <QueryCard key={q.id} q={q} matchingCategories={cats} />
              ))}
            </div>
          </>
        )}
      </div>

      <div style={styles.section}>
        <span style={styles.sectionLabel}>Latency</span>
        <div style={styles.latencyRow}>
          <div style={styles.latencyCard}>
            <span style={styles.latencyLabel}>Vector search</span>
            <span style={{ ...styles.latencyValue, color: "var(--color-accent-deep)" }}>
              {AU.latency(latency.vectorMs)}
            </span>
            <span style={styles.latencySub}>TF-IDF cosine similarity</span>
          </div>
          <div style={styles.latencyCard}>
            <span style={styles.latencyLabel}>Keyword search</span>
            <span style={{ ...styles.latencyValue, color: "var(--color-warning)" }}>
              {AU.latency(latency.keywordMs)}
            </span>
            <span style={styles.latencySub}>Token overlap baseline</span>
          </div>
        </div>
      </div>
    </div>
  );
}
