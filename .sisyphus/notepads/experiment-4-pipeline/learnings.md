# Experiment 4: Visual Pipeline Builder — Learnings

## Architecture
- **`@xyflow/react` v12** for the drag-and-drop canvas — types are strict: custom node types must be declared via the `nodeTypes` map, and `NodeProps<ModuleNode>` keeps the data shape strongly typed
- **In-memory state via React Context** (`PipelineContext`) — useState + useCallback for actions, no Zustand/Redux needed for a single-screen workflow
- **Pipeline execution = topological walk** — follow edges from roots, calling `runModule(node, ctx)` per node; results flow through the shared `ExecutionContext`
- **`PipelineResult` is computed once per Run** — categorised items + bucket map + flags are stored in a single object the UI renders directly

## Key Decisions
- **Module types use a type-coded accent bar** (Input=cyan, Validation=orange, Logic=purple, Output=green) on top of each node — keeps the visual language consistent with the existing token system
- **Cash-out detection uses a fallback** — if no line item matches `/cash|withdrawal|atm/i`, derive the amount from `total - netGoodsAmount - cardFeeAmount`. This handles mock data where the cash-out is a separate field rather than a line item
- **Filename → template mapping** in `pipelineModules.ts` — a `Record<seed, idx>` ensures sample buttons produce deterministic, named templates (e.g. "grand-harbour-2nts.jpg" → Grand Harbour Hotel). Falls back to a hash-based random pick for arbitrary user uploads
- **Pipeline node IDs use a `pn-` prefix** to distinguish from React Flow's internal IDs and avoid collisions with the `preset-` suffix used by the preset chain

## Patterns
- **Step badges (`STEP 0X — …`)** create a visual narrative across the page — every section reuses the same uppercase mono treatment
- **Status pill on each module node** (idle/running/success/error) doubles as a live indicator during chain execution
- **MiniMap node colors are derived from `data.moduleId` prefix** — matches the accent bar logic
- **`gridAutoRows: "minmax(640px, auto)"`** on the builder grid is essential — without it the React Flow container collapses to 0 height
- **`onConnect` uses `addEdge` with an animated style** — gives edges a subtle dashed motion that reinforces the "data flowing" metaphor

## Issues Encountered

1. **React Flow container height = 0** — the initial grid used `alignItems: "start"` which made rows shrink-fit. Fixed by switching to `alignItems: "stretch"` and giving the grid a min row height
2. **React warned about `border` shorthand + `borderColor`** — replaced with `borderWidth` + `borderStyle` + `borderColor` separately
3. **Mock data used a sequential counter** that didn't match sample filenames — fixed with a deterministic filename-to-template map
4. **Initial state of chain** had empty `nodeTypes` → nodes rendered as default React Flow boxes. Resolved by registering `{ module: ModuleNodeComponent }` explicitly
5. **`RfInstance` generic type** is too strict for the `screenToFlowPosition` ref — used a narrow inline type instead

## Files Created

```
src/types/pipeline.ts                     — domain types
src/data/pipelineModules.ts               — module defs, sample templates, category keywords
src/utils/pipeline/execute.ts             — chain execution engine
src/state/PipelineContext.tsx             — global state + actions
src/components/pipeline/
  PipelineBuilder.tsx                     — top-level layout
  UploadStep.tsx                          — Step 1
  ReceiptDetail.tsx                       — Step 2
  ModuleToolbox.tsx                       — Step 3 sidebar
  PipelineCanvas.tsx                      — Step 3 React Flow canvas
  NodeConfigPanel.tsx                     — Step 3 right panel
  ExpenseMap.tsx                          — Step 4
  nodes/ModuleNode.tsx                    — custom React Flow node
```
