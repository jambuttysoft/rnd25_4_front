export interface GraphConfig {
  name: string;
  description: string;
  nodes: number;
  edges: number;
  pattern: "sequential" | "parallel" | "conditional" | "deep";
  iterations: number;
  avgLatencyMs: number;
  p50LatencyMs: number;
  p90LatencyMs: number;
  p99LatencyMs: number;
  throughputTps: number;
  failureRate: number;
  speedup: number;
  isBest: boolean;
}

export interface PerfExperimentData {
  title: string;
  subtitle: string;
  description: string;
  targetLatencyMs: number;
  configurations: GraphConfig[];
  generatedAt: string;
}

export const perfData: PerfExperimentData = {
  title: "Graph Performance",
  subtitle: "Experiment 03",
  description:
    "End-to-end latency of a directed acyclic graph orchestrator across four topologies — sequential chain, parallel branching, complex with conditional routing, and deep chain. Each configuration runs 100 iterations with deterministic simulated latencies (20–80 ms per node).",
  targetLatencyMs: 4000,
  configurations: [
    {
      name: "Sequential Chain",
      description: "Five nodes in a linear pipeline — OCR → policy check → math validation → audit → report. The baseline configuration without parallelism.",
      nodes: 5,
      edges: 4,
      pattern: "sequential",
      iterations: 100,
      avgLatencyMs: 246.2,
      p50LatencyMs: 249,
      p90LatencyMs: 292,
      p99LatencyMs: 322,
      throughputTps: 4.06,
      failureRate: 0.0,
      speedup: 1.0,
      isBest: false,
    },
    {
      name: "Parallel Branching",
      description: "OCR forks into parallel policy and math checks, which merge at the audit stage. Two branches execute concurrently via Kahn's algorithm.",
      nodes: 5,
      edges: 5,
      pattern: "parallel",
      iterations: 100,
      avgLatencyMs: 210,
      p50LatencyMs: 209,
      p90LatencyMs: 255,
      p99LatencyMs: 291,
      throughputTps: 4.76,
      failureRate: 0.0,
      speedup: 1.17,
      isBest: true,
    },
    {
      name: "Complex + Conditional",
      description: "Seven-node graph with a conditional split that routes between full validation and a simplified audit path on OCR failure (5% fail rate).",
      nodes: 7,
      edges: 7,
      pattern: "conditional",
      iterations: 100,
      avgLatencyMs: 218,
      p50LatencyMs: 219,
      p90LatencyMs: 259,
      p99LatencyMs: 275,
      throughputTps: 4.6,
      failureRate: 0.02,
      speedup: 1.13,
      isBest: false,
    },
    {
      name: "Deep Chain",
      description: "Ten-node linear pipeline with alternating node types. Stress-tests orchestrator overhead versus pure sequential execution.",
      nodes: 10,
      edges: 9,
      pattern: "deep",
      iterations: 100,
      avgLatencyMs: 501,
      p50LatencyMs: 499,
      p90LatencyMs: 568,
      p99LatencyMs: 624,
      throughputTps: 1.99,
      failureRate: 0.0,
      speedup: 0.49,
      isBest: false,
    },
  ],
  generatedAt: "2026-07-22T15:00:00.000Z",
};
