# Experiment 3: Graph Execution Performance — Learnings

## Architecture

- **Kahn's algorithm** for topological sort with parallel batch execution — nodes with in-degree=0 in the same batch execute via Promise.all
- **conditional_split** nodes evaluate predecessor status (not own status) to determine branch routing — post-processing step after node execution checks all incoming edges for failures
- **cascadeSkip** recursively marks downstream nodes as skipped when their sole incoming edge is from a skipped/failed node, but does NOT skip nodes that have other active incoming paths

## Key Decisions

- `evaluateSplitCondition` checks `result.output.decision` (not `result.status`) because conditional_split's own status is always forced to 'success' after predecessor evaluation
- `simulatedLatencyMs` randomized per-iteration using deterministic mulberry32 PRNG for reproducibility
- Percentile calculation uses `Math.ceil(p * N) - 1` (standard rank-based method)

## Patterns

- ESM `.js` extensions in imports required for tsx
- Unicode box-drawing characters for table output (matching experiment-1 style)
- `randomInRange(rng, min, max)` for latency randomization per iteration

## Issues Encountered

1. TypeScript hint: unused `nodeId` parameter in `propagateNormal` — prefixed with `_`
2. Import cleanup: `ExecutionResult` unused in index.ts (type inferred from engine return)
3. Inline `-e` eval with tsx fails for ESM imports — use proper file execution
