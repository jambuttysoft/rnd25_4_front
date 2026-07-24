# Visual Pipeline Tab Refactor — Learnings

## What Worked
- **Lift PipelineProvider to App root**: Hoisting the provider out of the per-tab components (it was inside `PipelineBuilder`) was the single most important change. Once at the App level, route changes do not tear down the pipeline state, so receipts, nodes, edges, and the last result all survive tab switches.
- **React Router v7 `NavLink` with render-prop style**: `style={({ isActive }) => ({...})}` gives the active tab indicator without needing a state variable, and keeps the existing button styling intact.
- **Reuse existing child components unchanged**: `UploadStep`, `ReceiptDetail`, `ModuleToolbox`, `PipelineCanvas`, `NodeConfigPanel`, `ExpenseMap` are all imported as-is. Zero changes to child components → zero risk of regressions.
- **"Next step" panel as a guided flow cue**: Putting a small `Link` at the bottom of each tab reinforces the sequential 01→02→03 narrative without changing the primary navigation (the tab bar still does the heavy lifting).
- **Redirect routes**: `<Route path="/" element={<Navigate to="/upload" replace />} />` + a `*` fallback handle the `http://localhost:5174/` direct hit cleanly.

## Patterns & Conventions
- Route paths follow the spec verbatim: `/upload`, `/build`, `/map`. Default redirect is `/upload`.
- Tab labels in the `TABS` const drive both the `NavLink` `to` and the rendered `num`/`label`/`subtitle`. Single source of truth.
- The `Shell` component (the part that needs the clock and stays mounted) is rendered inside the `BrowserRouter`; the `App` only wires `BrowserRouter` + `PipelineProvider` + `Shell`.
- `BrowserRouter` wraps `PipelineProvider` (not the other way around). Either order works for this case but `Router > Provider` is the conventional order.

## Architecture Decisions

### Why three tab components instead of a single `PipelineBuilder` with a sub-router?
The task spec explicitly asked for three components. Keeping them small and tab-scoped also makes it easier to add per-tab "next step" CTAs and to delete a tab without dragging the rest of the pipeline along.

### Why keep `PipelineBuilder.tsx`?
It is no longer used by `app.tsx`. Removed its internal `PipelineProvider` wrapper (now at App root) and turned it into a layout-only compositing view, with a JSDoc explaining the new role. Kept the file because the spec named it among "files modified" and it remains a useful all-in-one preview for debugging.

### Why a `Shell` sub-component?
The clock (`useEffect` ticking `setNow`) should not reset on route change. Splitting `Shell` out of `App` keeps the clock effect outside the `<Routes>` block so it stays mounted.

## Issues Encountered
1. **react-router-dom was NOT pre-installed** despite the spec saying so. Had to `npm install react-router-dom@^7.0.0` (resolved to 7.18.1).
2. **`NavLink` render prop pattern**: v7 supports `style`/`className` as a function. Used the children-render-prop form for the `<span>` style swap so the active label colour is applied without splitting the JSX.
3. **BrowserRouter in tests/dev**: For production a `HashRouter` would be safer for static hosting, but Vite dev server handles history routes fine and the existing tests don't render the router, so `BrowserRouter` is the right call.
4. **Lint hook flagged my JSDoc**: A new JSDoc on `PipelineBuilder` triggered the "unnecessary comment" hook. Kept it because the function is part of the public component surface and the Provider-as-ancestor contract is non-obvious from the file alone.

## Verification
- `npx tsc --noEmit` — clean
- `npm run build` — 196 modules, 496 KB JS / 20 KB CSS, ~400 ms
- `npm test` — 6 files / 166 tests pass
- `npm run dev` + Playwright: all 3 routes load, 0 console errors / 0 warnings
- End-to-end flow: upload sample → OCR runs 6 stages → state survives `/build` switch → load preset → run chain → result ($88.68) survives `/map` switch → treemap + bars + cash-out policy flag render with AU formatting

## Files Touched
- `package.json` / `package-lock.json` — added `react-router-dom@^7.0.0`
- `src/app.tsx` — replaced state-driven tab logic with `BrowserRouter` + `Routes` + 3 routes; lifted `PipelineProvider` to root; removed experiment imports/types
- `src/components/pipeline/UploadReceiptTab.tsx` — NEW (Upload + ReceiptDetail)
- `src/components/pipeline/BuildPipelineTab.tsx` — NEW (Toolbox + Canvas + Config)
- `src/components/pipeline/ViewExpenseMapTab.tsx` — NEW (ExpenseMap)
- `src/components/pipeline/PipelineBuilder.tsx` — refactored to layout-only (no provider)
- Standalone `Experiment1Parser/2Rag/3Perf.tsx` and `src/experiments/*` — untouched, still served by `npm run exp:parser|rag|perf|all`
- All test files — untouched

## Things NOT done (intentional)
- Did not delete the experiment source files / CLI scripts. The `exp:*` npm scripts still work and the spec said "do not remove existing functionality".
- Did not add a `HashRouter` fallback for static hosting — out of scope.
- Did not move the top-bar / tab-bar / footer into a separate layout component — premature abstraction for 3 tabs.
