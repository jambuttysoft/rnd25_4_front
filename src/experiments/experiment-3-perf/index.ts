import type {
  NodeType,
  GraphNode,
  GraphEdge,
  ExecutionGraph,
  BenchmarkResult,
  IterationSample,
} from './types.js';
import { ExecutionEngine } from './engine.js';

// ============================================================
// Experiment 3: Graph Execution Performance — Benchmark
// 4 graph configurations × 100 iterations each
// ============================================================

// Deterministic PRNG (mulberry32) for reproducible iterations
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomInRange(rng: () => number, min: number, max: number): number {
  return Math.round(min + rng() * (max - min));
}

// ---- Graph Definitions ----

interface NodeTemplate {
  id: string;
  type: NodeType;
  latencyRange: [number, number];
  failRate: number;
}

interface EdgeTemplate {
  source: string;
  target: string;
  condition?: string;
}

interface GraphTemplate {
  name: string;
  nodes: NodeTemplate[];
  edges: EdgeTemplate[];
}

function buildGraph(template: GraphTemplate, rng: () => number): ExecutionGraph {
  const nodes: GraphNode[] = template.nodes.map(n => ({
    id: n.id,
    type: n.type,
    config: {},
    simulatedLatencyMs: randomInRange(rng, n.latencyRange[0], n.latencyRange[1]),
    simulatedFailRate: n.failRate,
  }));
  const edges: GraphEdge[] = template.edges.map(e => ({
    source: e.source,
    target: e.target,
    condition: e.condition,
  }));
  return { nodes, edges };
}

const GRAPH_TEMPLATES: GraphTemplate[] = [
  {
    name: 'Sequential Chain',
    nodes: [
      { id: 'n1', type: 'ocr_parse', latencyRange: [20, 80], failRate: 0.0 },
      { id: 'n2', type: 'rag_policy_check', latencyRange: [20, 80], failRate: 0.0 },
      { id: 'n3', type: 'math_validation', latencyRange: [20, 80], failRate: 0.0 },
      { id: 'n4', type: 'semantic_audit', latencyRange: [20, 80], failRate: 0.0 },
      { id: 'n5', type: 'report', latencyRange: [20, 80], failRate: 0.0 },
    ],
    edges: [
      { source: 'n1', target: 'n2' },
      { source: 'n2', target: 'n3' },
      { source: 'n3', target: 'n4' },
      { source: 'n4', target: 'n5' },
    ],
  },
  {
    name: 'Parallel Branching',
    nodes: [
      { id: 'n1', type: 'ocr_parse', latencyRange: [20, 80], failRate: 0.0 },
      { id: 'n2', type: 'rag_policy_check', latencyRange: [20, 80], failRate: 0.0 },
      { id: 'n3', type: 'math_validation', latencyRange: [20, 80], failRate: 0.0 },
      { id: 'n4', type: 'semantic_audit', latencyRange: [20, 80], failRate: 0.0 },
      { id: 'n5', type: 'report', latencyRange: [20, 80], failRate: 0.0 },
    ],
    edges: [
      { source: 'n1', target: 'n2' },
      { source: 'n1', target: 'n3' },
      { source: 'n2', target: 'n4' },
      { source: 'n3', target: 'n4' },
      { source: 'n4', target: 'n5' },
    ],
  },
  {
    name: 'Complex + Conditional',
    nodes: [
      { id: 'n1', type: 'ocr_parse', latencyRange: [20, 80], failRate: 0.05 },
      { id: 'n2', type: 'conditional_split', latencyRange: [5, 15], failRate: 0.0 },
      { id: 'n3', type: 'rag_policy_check', latencyRange: [20, 80], failRate: 0.0 },
      { id: 'n4', type: 'math_validation', latencyRange: [20, 80], failRate: 0.0 },
      { id: 'n5', type: 'semantic_audit', latencyRange: [20, 80], failRate: 0.0 },
      { id: 'n6', type: 'merge', latencyRange: [2, 5], failRate: 0.0 },
      { id: 'n7', type: 'report', latencyRange: [20, 80], failRate: 0.0 },
    ],
    edges: [
      { source: 'n1', target: 'n2' },
      { source: 'n2', target: 'n3', condition: 'success' },
      { source: 'n2', target: 'n5', condition: 'failure' },
      { source: 'n3', target: 'n4' },
      { source: 'n4', target: 'n6' },
      { source: 'n5', target: 'n6' },
      { source: 'n6', target: 'n7' },
    ],
  },
  {
    name: 'Deep Chain',
    nodes: Array.from({ length: 10 }, (_, i) => ({
      id: `n${i + 1}`,
      type: (i === 0 ? 'ocr_parse' :
             i === 9 ? 'report' :
             ['rag_policy_check', 'math_validation', 'semantic_audit'][i % 3]) as NodeType,
      latencyRange: [20, 80] as [number, number],
      failRate: 0.0,
    })),
    edges: Array.from({ length: 9 }, (_, i) => ({
      source: `n${i + 1}`,
      target: `n${i + 2}`,
    })),
  },
];

// ---- Benchmark Runner ----

function computePercentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil(p * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
}

async function runIteration(
  engine: ExecutionEngine,
  templateIndex: number,
  iteration: number,
): Promise<IterationSample> {
  const rng = mulberry32(templateIndex * 10000 + iteration);
  const template = GRAPH_TEMPLATES[templateIndex];
  const graph = buildGraph(template, rng);

  const start = Date.now();
  const result = await engine.execute(graph);
  const elapsed = Date.now() - start;

  return {
    iteration,
    latencyMs: elapsed,
    status: result.status,
    parallelSegments: result.parallelSegments,
    path: result.path,
  };
}

async function benchmarkConfig(
  engine: ExecutionEngine,
  templateIndex: number,
  iterations: number,
): Promise<{ samples: IterationSample[]; result: BenchmarkResult }> {
  const samples: IterationSample[] = [];
  const template = GRAPH_TEMPLATES[templateIndex];

  for (let iter = 0; iter < iterations; iter++) {
    const sample = await runIteration(engine, templateIndex, iter);
    samples.push(sample);
  }

  const latencies = samples.map(s => s.latencyMs).sort((a, b) => a - b);
  const totalLatency = latencies.reduce((s, v) => s + v, 0);
  const avg = totalLatency / samples.length;
  const min = latencies[0];
  const max = latencies[latencies.length - 1];
  const p50 = computePercentile(latencies, 0.50);
  const p90 = computePercentile(latencies, 0.90);
  const p99 = computePercentile(latencies, 0.99);
  const throughput = 1000 / avg; // receipts/sec

  const failed = samples.filter(s => s.status !== 'completed').length;
  const failureRate = failed / samples.length;

  return {
    samples,
    result: {
      name: template.name,
      totalIterations: iterations,
      avgLatencyMs: avg,
      minLatencyMs: min,
      maxLatencyMs: max,
      p50LatencyMs: p50,
      p90LatencyMs: p90,
      p99LatencyMs: p99,
      throughput,
      failureRate,
      parallelSpeedup: 0, // filled later
    },
  };
}

// ---- Output Formatting ----

function padRight(s: string, len: number): string {
  return s.length >= len ? s : s + ' '.repeat(len - s.length);
}

function padLeft(s: string, len: number): string {
  return s.length >= len ? s : ' '.repeat(len - s.length) + s;
}

function fmtMs(val: number): string {
  return `${Math.round(val)}ms`;
}

function fmtRate(val: number): string {
  return val.toFixed(2);
}

function printHeader(): void {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║   ЭКСПЕРИМЕНТ 3: ПРОИЗВОДИТЕЛЬНОСТЬ ГРАФА ВЫПОЛНЕНИЯ          ║');
  console.log('║        Graph Execution Performance — Latency Benchmark          ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log();
  console.log('Конфигурации графов:');
  for (let i = 0; i < GRAPH_TEMPLATES.length; i++) {
    const t = GRAPH_TEMPLATES[i];
    const nodeCount = t.nodes.length;
    const edgeCount = t.edges.length;
    const hasParallel = t.name.includes('Parallel') || t.name.includes('Complex');
    const hasConditional = t.name.includes('Conditional');
    let desc = `${nodeCount} узлов, ${edgeCount} рёбер`;
    if (hasConditional) desc += ', условное ветвление';
    else if (hasParallel) desc += ', параллельно';
    else desc += ', последовательно';
    console.log(`  ${i + 1}. ${t.name} (${desc})`);
  }
  console.log();
}

function printResultsTable(benchResults: BenchmarkResult[]): void {
  console.log(`Результаты (${benchResults[0].totalIterations} итераций каждая):`);
  console.log();

  const sepTop    = '┌──────────────────────────┬──────────┬────────┬────────┬───────┬────────┐';
  const sepHeader = '│ Конфигурация             │ Среднее  │ p50    │ p90    │ p99   │ t/s    │';
  const sepMid    = '├──────────────────────────┼──────────┼────────┼────────┼───────┼────────┤';
  const sepBot    = '└──────────────────────────┴──────────┴────────┴────────┴───────┴────────┘';

  console.log(sepTop);
  console.log(sepHeader);
  console.log(sepMid);

  for (const r of benchResults) {
    const name = padRight(r.name, 24);
    const avg = padLeft(fmtMs(r.avgLatencyMs), 8);
    const p50 = padLeft(fmtMs(r.p50LatencyMs), 6);
    const p90 = padLeft(fmtMs(r.p90LatencyMs), 6);
    const p99 = padLeft(fmtMs(r.p99LatencyMs), 5);
    const tps = padLeft(fmtRate(r.throughput), 6);
    console.log(`│ ${name}│ ${avg} │ ${p50} │ ${p90} │ ${p99} │ ${tps} │`);
  }

  console.log(sepBot);
  console.log();
}

function printSpeedup(benchResults: BenchmarkResult[]): void {
  const baseline = benchResults[0]; // Sequential Chain

  console.log('Ускорение за счёт параллелизации:');

  for (let i = 1; i < benchResults.length; i++) {
    const speedup = baseline.avgLatencyMs / benchResults[i].avgLatencyMs;
    console.log(`  ${benchResults[i].name} vs ${baseline.name}: ${speedup.toFixed(2)}x`);
  }
  console.log();
}

// ---- Main ----

async function main(): Promise<void> {
  const engine = new ExecutionEngine();
  const ITERATIONS = 100;

  printHeader();

  console.log(`Запуск бенчмарков (${ITERATIONS} итераций каждый)...`);
  console.log();

  const benchResults: BenchmarkResult[] = [];

  for (let i = 0; i < GRAPH_TEMPLATES.length; i++) {
    const template = GRAPH_TEMPLATES[i];
    process.stdout.write(`  [${i + 1}/${GRAPH_TEMPLATES.length}] ${template.name}... `);

    const startTime = Date.now();
    const { result } = await benchmarkConfig(engine, i, ITERATIONS);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    result.parallelSpeedup = i === 0 ? 1.0 : benchResults[0].avgLatencyMs / result.avgLatencyMs;
    benchResults.push(result);

    console.log(`завершено за ${elapsed}s (avg=${fmtMs(result.avgLatencyMs)})`);
  }

  console.log();
  printResultsTable(benchResults);
  printSpeedup(benchResults);

  // Summary
  const bestLatency = Math.min(...benchResults.map(r => r.p50LatencyMs));
  const bestConfig = benchResults.find(r => r.p50LatencyMs === bestLatency);

  console.log('Выводы:');
  console.log(`  Лучшая конфигурация: ${bestConfig?.name} (p50=${fmtMs(bestLatency)})`);
  console.log(`  Целевой порог ≤4с достигается${bestLatency <= 4000 ? '' : ' не'} при параллельном выполнении.`);

  const deepChain = benchResults[3];
  if (deepChain) {
    const overhead = deepChain.avgLatencyMs - benchResults[0].avgLatencyMs;
    console.log(`  Накопление задержки (Deep Chain): +${fmtMs(overhead)} (x${(deepChain.avgLatencyMs / benchResults[0].avgLatencyMs).toFixed(1)} vs Sequential)`);
  }

  const parSpeedup = benchResults[1]?.parallelSpeedup ?? 0;
  if (parSpeedup > 1.1) {
    console.log(`  Параллелизация даёт ускорение в ${parSpeedup.toFixed(2)}x при 2-х параллельных ветках.`);
  }

  console.log();
  console.log('--- JSON Results (for programmatic consumption) ---');
  console.log(JSON.stringify(benchResults, null, 2));
}

main().catch(err => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});
