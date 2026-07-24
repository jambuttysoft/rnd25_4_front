// ============================================================
// Experiment 3: Graph Execution Performance — Types
// Latency Benchmark — визуальный пайплайн проверки чеков
// ============================================================

/** Типы узлов графа выполнения */
export type NodeType =
  | 'ocr_parse'
  | 'rag_policy_check'
  | 'math_validation'
  | 'semantic_audit'
  | 'conditional_split'
  | 'merge'
  | 'report';

/** Узел графа выполнения */
export interface GraphNode {
  id: string;
  type: NodeType;
  config: Record<string, unknown>;
  simulatedLatencyMs: number;   // симулированная задержка выполнения
  simulatedFailRate: number;    // вероятность ошибки (0-1)
}

/** Ребро графа выполнения */
export interface GraphEdge {
  source: string;
  target: string;
  condition?: string;           // для conditional_split: "success" | "failure"
}

/** Ориентированный граф выполнения */
export interface ExecutionGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/** Результат выполнения одного узла */
export interface NodeResult {
  nodeId: string;
  nodeType: NodeType;
  status: 'success' | 'failure' | 'skipped';
  startTime: number;
  endTime: number;
  latencyMs: number;
  output?: Record<string, unknown>;
  error?: string;
}

/** Сводный результат выполнения всего графа */
export interface ExecutionResult {
  graphId: string;
  status: 'completed' | 'failed' | 'partial';
  totalLatencyMs: number;
  nodeResults: NodeResult[];
  path: string[];               // порядок выполнения узлов
  parallelSegments: number;     // сколько узлов выполнено параллельно
}

/** Конфигурация бенчмарка */
export interface BenchmarkConfig {
  name: string;
  graphs: ExecutionGraph[];
  iterations: number;
  concurrency: number;
}

/** Результат бенчмарка (агрегированные метрики) */
export interface BenchmarkResult {
  name: string;
  totalIterations: number;
  avgLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  p50LatencyMs: number;
  p90LatencyMs: number;
  p99LatencyMs: number;
  throughput: number;           // receipt/sec
  failureRate: number;
  parallelSpeedup: number;
}

/** Сырые замеры одной итерации */
export interface IterationSample {
  iteration: number;
  latencyMs: number;
  status: 'completed' | 'failed' | 'partial';
  parallelSegments: number;
  path: string[];
}
