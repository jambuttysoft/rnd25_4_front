import type {
  GraphNode,
  GraphEdge,
  ExecutionGraph,
  NodeResult,
  ExecutionResult,
} from './types.js';

// ============================================================
// Experiment 3: Async Graph Execution Engine
// Kahn's topological sort + parallel batch execution
// ============================================================

export class ExecutionEngine {
  /**
   * Execute an execution graph asynchronously.
   * Uses Kahn's algorithm for topological ordering with parallel batch execution.
   * Handles conditional_split (branch selection) and merge (fan-in synchronization).
   */
  async execute(graph: ExecutionGraph): Promise<ExecutionResult> {
    const startTime = Date.now();
    const nodeMap = new Map(graph.nodes.map(n => [n.id, n]));
    const adj = this.buildAdjacency(graph.edges);     // source → outgoing edges
    const revAdj = this.buildReverseAdjacency(graph.edges); // target → incoming edges
    const inDegree = new Map<string, number>();
    for (const node of graph.nodes) {
      inDegree.set(node.id, (revAdj.get(node.id) ?? []).length);
    }

    const skipped = new Set<string>();
    const results: NodeResult[] = [];
    const path: string[] = [];
    let maxParallel = 0;

    let ready = graph.nodes.filter(n => (inDegree.get(n.id) ?? 0) === 0);

    while (ready.length > 0) {
      maxParallel = Math.max(maxParallel, ready.length);
      const batch = ready;
      ready = [];

      const batchResults = await Promise.all(
        batch.map(n => this.simulateNode(n))
      );

      // Post-process conditional_split: determine branch based on
      // predecessor status (e.g. OCR success/failure → route accordingly)
      for (const result of batchResults) {
        if (result.nodeType === 'conditional_split') {
          const incoming = revAdj.get(result.nodeId) ?? [];
          const anyPredFailed = incoming.some(e => {
            const pred = results.find(r => r.nodeId === e.source) ??
                         batchResults.find(r => r.nodeId === e.source);
            return pred?.status === 'failure';
          });
          result.output = { decision: anyPredFailed ? 'failure' : 'success' };
          result.status = 'success';
        }
      }

      const nextReady: GraphNode[] = [];

      for (const result of batchResults) {
        results.push(result);
        path.push(result.nodeId);

        if (result.nodeType === 'conditional_split') {
          this.handleConditionalSplit(
            result,
            adj.get(result.nodeId) ?? [],
            nodeMap,
            inDegree,
            skipped,
            nextReady,
            adj,
            revAdj,
          );
        } else {
          this.propagateNormal(
            result.nodeId,
            adj.get(result.nodeId) ?? [],
            nodeMap,
            inDegree,
            skipped,
            nextReady,
          );
        }
      }

      ready = nextReady;
    }

    // Record skipped nodes in results
    for (const nodeId of skipped) {
      const node = nodeMap.get(nodeId)!;
      results.push({
        nodeId: node.id,
        nodeType: node.type,
        status: 'skipped',
        startTime: 0,
        endTime: 0,
        latencyMs: 0,
      });
    }

    const totalLatencyMs = Date.now() - startTime;
    const lastResultStatuses = results
      .filter(r => r.status !== 'skipped')
      .map(r => r.status);

    let overallStatus: 'completed' | 'failed' | 'partial';
    if (lastResultStatuses.every(s => s === 'success')) {
      overallStatus = 'completed';
    } else if (lastResultStatuses.every(s => s === 'failure')) {
      overallStatus = 'failed';
    } else {
      overallStatus = 'partial';
    }

    return {
      graphId: `graph-${Date.now()}`,
      status: overallStatus,
      totalLatencyMs,
      nodeResults: results,
      path,
      parallelSegments: maxParallel,
    };
  }

  private buildAdjacency(edges: GraphEdge[]): Map<string, GraphEdge[]> {
    const map = new Map<string, GraphEdge[]>();
    for (const e of edges) {
      const list = map.get(e.source) ?? [];
      list.push(e);
      map.set(e.source, list);
    }
    return map;
  }

  private buildReverseAdjacency(edges: GraphEdge[]): Map<string, GraphEdge[]> {
    const map = new Map<string, GraphEdge[]>();
    for (const e of edges) {
      const list = map.get(e.target) ?? [];
      list.push(e);
      map.set(e.target, list);
    }
    return map;
  }

  /**
   * Simulate node execution with configurable latency and failure rate.
   */
  private async simulateNode(node: GraphNode): Promise<NodeResult> {
    const startTime = Date.now();

    // Simulated processing delay
    await new Promise<void>(resolve => {
      setTimeout(resolve, node.simulatedLatencyMs);
    });

    const endTime = Date.now();
    const actualLatency = endTime - startTime;

    // Simulated random failure
    const roll = Math.random();
    const failed = roll < node.simulatedFailRate;

    if (failed) {
      return {
        nodeId: node.id,
        nodeType: node.type,
        status: 'failure',
        startTime,
        endTime,
        latencyMs: actualLatency,
        error: `Simulated failure (roll=${roll.toFixed(4)}, threshold=${node.simulatedFailRate})`,
      };
    }

    return {
      nodeId: node.id,
      nodeType: node.type,
      status: 'success',
      startTime,
      endTime,
      latencyMs: actualLatency,
      output: { decision: 'success', ...node.config },
    };
  }

  /**
   * Handle conditional_split: determine which branches to follow.
   * Active branches have their targets' in-degree decremented normally.
   * Inactive branches have their targets recursively marked as skipped.
   */
  private handleConditionalSplit(
    result: NodeResult,
    outgoingEdges: GraphEdge[],
    nodeMap: Map<string, GraphNode>,
    inDegree: Map<string, number>,
    skipped: Set<string>,
    nextReady: GraphNode[],
    adj: Map<string, GraphEdge[]>,
    revAdj: Map<string, GraphEdge[]>,
  ): void {
    for (const edge of outgoingEdges) {
      const shouldFollow = this.evaluateSplitCondition(result, edge);

      if (shouldFollow) {
        const targetDeg = (inDegree.get(edge.target) ?? 1) - 1;
        inDegree.set(edge.target, targetDeg);
        if (targetDeg === 0 && !skipped.has(edge.target)) {
          const targetNode = nodeMap.get(edge.target);
          if (targetNode) nextReady.push(targetNode);
        }
      } else {
        // Skipped branch: mark target and all transitive dependents as skipped
        this.cascadeSkip(
          edge.target,
          adj,
          revAdj,
          nodeMap,
          inDegree,
          skipped,
          nextReady,
        );
      }
    }
  }

  /**
   * Evaluate whether a conditional_split edge should be followed.
   * Edge condition "success" → follow if node succeeded.
   * Edge condition "failure" → follow if node failed.
   * No condition → always follow.
   */
  private evaluateSplitCondition(
    result: NodeResult,
    edge: GraphEdge,
  ): boolean {
    if (!edge.condition) return true;
    const decision = result.output?.decision as string | undefined;
    if (edge.condition === 'success') return decision !== 'failure';
    if (edge.condition === 'failure') return decision === 'failure';
    return true;
  }

  /**
   * Recursively skip a node and all its dependents.
   * A dependent is skipped when ALL its incoming edges come from skipped nodes.
   * Otherwise, only in-degree is decremented, and the node may still become ready
   * via its other incoming edges.
   */
  private cascadeSkip(
    nodeId: string,
    adj: Map<string, GraphEdge[]>,
    revAdj: Map<string, GraphEdge[]>,
    nodeMap: Map<string, GraphNode>,
    inDegree: Map<string, number>,
    skipped: Set<string>,
    nextReady: GraphNode[],
  ): void {
    if (skipped.has(nodeId)) return;
    skipped.add(nodeId);

    const outgoing = adj.get(nodeId) ?? [];
    for (const edge of outgoing) {
      if (skipped.has(edge.target)) continue;

      const newDeg = (inDegree.get(edge.target) ?? 1) - 1;
      inDegree.set(edge.target, newDeg);

      const allIncomingSkipped = (revAdj.get(edge.target) ?? []).every(
        e => skipped.has(e.source),
      );

      if (allIncomingSkipped) {
        // Entire subgraph downstream of skipped node is also skipped
        this.cascadeSkip(
          edge.target,
          adj,
          revAdj,
          nodeMap,
          inDegree,
          skipped,
          nextReady,
        );
      } else if (newDeg === 0) {
        // Node has remaining active incoming edges → ready to execute
        const targetNode = nodeMap.get(edge.target);
        if (targetNode) nextReady.push(targetNode);
      }
    }
  }

  /**
   * Process outgoing edges of a normally-executed (non-conditional) node.
   * Decrement in-degree of each target. Target becomes ready when degree hits 0.
   */
  private propagateNormal(
    _nodeId: string,
    outgoingEdges: GraphEdge[],
    nodeMap: Map<string, GraphNode>,
    inDegree: Map<string, number>,
    skipped: Set<string>,
    nextReady: GraphNode[],
  ): void {
    for (const edge of outgoingEdges) {
      if (skipped.has(edge.target)) continue;

      const newDeg = (inDegree.get(edge.target) ?? 1) - 1;
      inDegree.set(edge.target, newDeg);

      if (newDeg === 0) {
        const targetNode = nodeMap.get(edge.target);
        if (targetNode) nextReady.push(targetNode);
      }
    }
  }
}
