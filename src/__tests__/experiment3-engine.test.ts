import { describe, it, expect } from "vitest";
import { ExecutionEngine } from "../experiments/experiment-3-perf/engine";
import type {
  ExecutionGraph,
  GraphNode,
  GraphEdge,
} from "../experiments/experiment-3-perf/types";


function makeLinearGraph(nodeCount: number, latencyMs: number = 1): ExecutionGraph {
  const nodes: GraphNode[] = Array.from({ length: nodeCount }, (_, i) => ({
    id: `n${i + 1}`,
    type: i === 0 ? "ocr_parse" : i === nodeCount - 1 ? "report" : "math_validation",
    config: {},
    simulatedLatencyMs: latencyMs,
    simulatedFailRate: 0,
  }));
  const edges: GraphEdge[] = Array.from({ length: nodeCount - 1 }, (_, i) => ({
    source: `n${i + 1}`,
    target: `n${i + 2}`,
  }));
  return { nodes, edges };
}

function makeParallelGraph(latencyMs: number = 1): ExecutionGraph {
  return {
    nodes: [
      { id: "n1", type: "ocr_parse", config: {}, simulatedLatencyMs: latencyMs, simulatedFailRate: 0 },
      { id: "n2", type: "rag_policy_check", config: {}, simulatedLatencyMs: latencyMs, simulatedFailRate: 0 },
      { id: "n3", type: "math_validation", config: {}, simulatedLatencyMs: latencyMs, simulatedFailRate: 0 },
      { id: "n4", type: "report", config: {}, simulatedLatencyMs: latencyMs, simulatedFailRate: 0 },
    ],
    edges: [
      { source: "n1", target: "n2" },
      { source: "n1", target: "n3" },
      { source: "n2", target: "n4" },
      { source: "n3", target: "n4" },
    ],
  };
}

function makeConditionalGraph(latencyMs: number = 1): ExecutionGraph {
  return {
    nodes: [
      { id: "n1", type: "ocr_parse", config: {}, simulatedLatencyMs: latencyMs, simulatedFailRate: 0 },
      { id: "n2", type: "conditional_split", config: {}, simulatedLatencyMs: latencyMs, simulatedFailRate: 0 },
      { id: "n3", type: "rag_policy_check", config: {}, simulatedLatencyMs: latencyMs, simulatedFailRate: 0 },
      { id: "n4", type: "math_validation", config: {}, simulatedLatencyMs: latencyMs, simulatedFailRate: 0 },
      { id: "n5", type: "merge", config: {}, simulatedLatencyMs: latencyMs, simulatedFailRate: 0 },
      { id: "n6", type: "report", config: {}, simulatedLatencyMs: latencyMs, simulatedFailRate: 0 },
    ],
    edges: [
      { source: "n1", target: "n2" },
      { source: "n2", target: "n3", condition: "success" },
      { source: "n2", target: "n4", condition: "failure" },
      { source: "n3", target: "n5" },
      { source: "n4", target: "n5" },
      { source: "n5", target: "n6" },
    ],
  };
}


describe("ExecutionEngine", () => {
  const engine = new ExecutionEngine();

  it("should execute an empty graph", async () => {
    const result = await engine.execute({ nodes: [], edges: [] });
    expect(result.status).toBe("completed");
    expect(result.nodeResults).toHaveLength(0);
    expect(result.path).toHaveLength(0);
  });

  it("should execute a single-node graph", async () => {
    const graph: ExecutionGraph = {
      nodes: [
        { id: "n1", type: "ocr_parse", config: {}, simulatedLatencyMs: 1, simulatedFailRate: 0 },
      ],
      edges: [],
    };
    const result = await engine.execute(graph);
    expect(result.status).toBe("completed");
    expect(result.nodeResults).toHaveLength(1);
    expect(result.nodeResults[0].status).toBe("success");
    expect(result.path).toEqual(["n1"]);
  });

  it("should execute a linear chain in order", async () => {
    const graph = makeLinearGraph(5, 1);
    const result = await engine.execute(graph);
    expect(result.status).toBe("completed");
    expect(result.path).toEqual(["n1", "n2", "n3", "n4", "n5"]);
    expect(result.nodeResults).toHaveLength(5);
    for (const r of result.nodeResults) {
      expect(r.status).toBe("success");
    }
  });

  it("should detect parallel segments", async () => {
    const graph = makeParallelGraph(1);
    const result = await engine.execute(graph);
    expect(result.parallelSegments).toBeGreaterThanOrEqual(2);
  });

  it("should execute parallel graph to completion", async () => {
    const graph = makeParallelGraph(1);
    const result = await engine.execute(graph);
    expect(result.status).toBe("completed");
    expect(result.nodeResults.length).toBe(4);
  });

  it("should handle conditional split (success path)", async () => {
    const graph = makeConditionalGraph(1);
    const result = await engine.execute(graph);
    expect(result.status).toBe("completed");
    const executedIds = result.nodeResults.map((r) => r.nodeId);
    expect(executedIds).toContain("n3");
  });

  it("should handle conditional split (skipping failure branch)", async () => {
    const graph = makeConditionalGraph(1);
    const result = await engine.execute(graph);
    const skippedIds = result.nodeResults
      .filter((r) => r.status === "skipped")
      .map((r) => r.nodeId);
    expect(skippedIds).toContain("n4");
  });

  it("should handle node failure with 100% fail rate", async () => {
    const graph: ExecutionGraph = {
      nodes: [
        { id: "n1", type: "ocr_parse", config: {}, simulatedLatencyMs: 1, simulatedFailRate: 1.0 },
        { id: "n2", type: "report", config: {}, simulatedLatencyMs: 1, simulatedFailRate: 0 },
      ],
      edges: [
        { source: "n1", target: "n2" },
      ],
    };
    const result = await engine.execute(graph);
    expect(result.nodeResults[0].status).toBe("failure");
    expect(result.nodeResults.length).toBe(2);
  });

  it("should record total latency", async () => {
    const graph = makeLinearGraph(3, 1);
    const start = Date.now();
    const result = await engine.execute(graph);
    const elapsed = Date.now() - start;
    expect(result.totalLatencyMs).toBeGreaterThanOrEqual(0);
    expect(result.totalLatencyMs).toBeLessThanOrEqual(elapsed + 100);
  });

  it("should assign correct nodeType to results", async () => {
    const graph: ExecutionGraph = {
      nodes: [
        { id: "n1", type: "ocr_parse", config: {}, simulatedLatencyMs: 1, simulatedFailRate: 0 },
        { id: "n2", type: "math_validation", config: {}, simulatedLatencyMs: 1, simulatedFailRate: 0 },
      ],
      edges: [{ source: "n1", target: "n2" }],
    };
    const result = await engine.execute(graph);
    expect(result.nodeResults[0].nodeType).toBe("ocr_parse");
    expect(result.nodeResults[1].nodeType).toBe("math_validation");
  });

  it("should handle complex diamond graph", async () => {
    const graph: ExecutionGraph = {
      nodes: [
        { id: "n1", type: "ocr_parse", config: {}, simulatedLatencyMs: 1, simulatedFailRate: 0 },
        { id: "n2", type: "rag_policy_check", config: {}, simulatedLatencyMs: 1, simulatedFailRate: 0 },
        { id: "n3", type: "math_validation", config: {}, simulatedLatencyMs: 1, simulatedFailRate: 0 },
        { id: "n4", type: "semantic_audit", config: {}, simulatedLatencyMs: 1, simulatedFailRate: 0 },
        { id: "n5", type: "report", config: {}, simulatedLatencyMs: 1, simulatedFailRate: 0 },
      ],
      edges: [
        { source: "n1", target: "n2" },
        { source: "n1", target: "n3" },
        { source: "n2", target: "n4" },
        { source: "n3", target: "n4" },
        { source: "n4", target: "n5" },
      ],
    };
    const result = await engine.execute(graph);
    expect(result.status).toBe("completed");
    expect(result.nodeResults.length).toBe(5);
    const n5Result = result.nodeResults.find((r) => r.nodeId === "n5");
    expect(n5Result?.status).toBe("success");
  });

  it("should handle merge node correctly", async () => {
    const graph = makeConditionalGraph(1);
    const result = await engine.execute(graph);
    const mergeResult = result.nodeResults.find((r) => r.nodeId === "n5");
    expect(mergeResult).toBeDefined();
    expect(mergeResult!.status).toBe("success");
  });
});


describe("Graph templates from benchmark", () => {
  const engine = new ExecutionEngine();

  it("should execute Sequential Chain template", async () => {
    const graph: ExecutionGraph = {
      nodes: [
        { id: "n1", type: "ocr_parse", config: {}, simulatedLatencyMs: 1, simulatedFailRate: 0 },
        { id: "n2", type: "rag_policy_check", config: {}, simulatedLatencyMs: 1, simulatedFailRate: 0 },
        { id: "n3", type: "math_validation", config: {}, simulatedLatencyMs: 1, simulatedFailRate: 0 },
        { id: "n4", type: "semantic_audit", config: {}, simulatedLatencyMs: 1, simulatedFailRate: 0 },
        { id: "n5", type: "report", config: {}, simulatedLatencyMs: 1, simulatedFailRate: 0 },
      ],
      edges: [
        { source: "n1", target: "n2" },
        { source: "n2", target: "n3" },
        { source: "n3", target: "n4" },
        { source: "n4", target: "n5" },
      ],
    };
    const result = await engine.execute(graph);
    expect(result.status).toBe("completed");
    expect(result.path).toEqual(["n1", "n2", "n3", "n4", "n5"]);
    expect(result.parallelSegments).toBe(1);
  });

  it("should execute Parallel Branching template", async () => {
    const graph = makeParallelGraph(1);
    const result = await engine.execute(graph);
    expect(result.status).toBe("completed");
    expect(result.parallelSegments).toBeGreaterThanOrEqual(2);
  });

  it("should execute Complex + Conditional template", async () => {
    const graph = makeConditionalGraph(1);
    const result = await engine.execute(graph);
    expect(result.status).toBe("completed");
  });

  it("should execute Deep Chain template (10 nodes)", async () => {
    const graph = makeLinearGraph(10, 1);
    const result = await engine.execute(graph);
    expect(result.status).toBe("completed");
    expect(result.path).toHaveLength(10);
  });
});


describe("Execution timing", () => {
  const engine = new ExecutionEngine();

  it("should measure latency for sequential graph", async () => {
    const graph = makeLinearGraph(5, 5);
    const result = await engine.execute(graph);
    expect(result.totalLatencyMs).toBeGreaterThanOrEqual(0);
    expect(result.totalLatencyMs).toBeLessThan(5000);
  });

  it("should be faster for parallel than sequential (same total work)", async () => {
    const sequential: ExecutionGraph = {
      nodes: [
        { id: "n1", type: "ocr_parse", config: {}, simulatedLatencyMs: 10, simulatedFailRate: 0 },
        { id: "n2", type: "math_validation", config: {}, simulatedLatencyMs: 10, simulatedFailRate: 0 },
        { id: "n3", type: "rag_policy_check", config: {}, simulatedLatencyMs: 10, simulatedFailRate: 0 },
      ],
      edges: [
        { source: "n1", target: "n2" },
        { source: "n2", target: "n3" },
      ],
    };

    const parallel: ExecutionGraph = {
      nodes: [
        { id: "n1", type: "ocr_parse", config: {}, simulatedLatencyMs: 10, simulatedFailRate: 0 },
        { id: "n2", type: "math_validation", config: {}, simulatedLatencyMs: 10, simulatedFailRate: 0 },
        { id: "n3", type: "rag_policy_check", config: {}, simulatedLatencyMs: 10, simulatedFailRate: 0 },
        { id: "n4", type: "report", config: {}, simulatedLatencyMs: 1, simulatedFailRate: 0 },
      ],
      edges: [
        { source: "n1", target: "n2" },
        { source: "n1", target: "n3" },
        { source: "n2", target: "n4" },
        { source: "n3", target: "n4" },
      ],
    };

    const seqResult = await engine.execute(sequential);
    const parResult = await engine.execute(parallel);

    expect(seqResult.status).toBe("completed");
    expect(parResult.status).toBe("completed");
  });
});
