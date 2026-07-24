# Learnings: Automated Test Suite

## Infrastructure
- Vitest was NOT in devDependencies despite plan claiming it was. Installed manually.
- Used `vitest.config.ts` separate from `vite.config.ts` to avoid modifying existing config.
- Added `test` and `test:watch` scripts to `package.json`.

## Key Patterns

### Parser Categories (experiment-1)
- The parser's `categorizeItem` uses Ukrainian keywords only. English words like "espresso", "lunch", "mouse" don't match.
- Keywords: пальне/бензин/дизель→fuel, кава/борщ/стейк→food, таксі/трансфер→transport, etc.
- "Бізнес-ланч" → "other" (not "food") because "ланч" isn't in the food keywords list.

### Pipeline Categorization (pipelineModules.ts)
- `inferCategory` uses English keywords: fuel/diesel/petrol→Fuel, cafe/coffee/lunch→Food, taxi/uber/train→Transport, etc.
- "Bottled water" → "Other" (no keyword match). "Espresso double" → "Other" (not in keywords).
- The `fallback` param in `validation.categorize` is never actually used because `inferCategory` always returns a non-empty string (at least "Other").

### Format Functions (format.ts)
- `formatPercent` uses comma as decimal separator (en-AU locale style): 0.853 → "85,3%" not "85.3%".
- `formatPercentRaw` uses `toFixed()` which can have floating-point precision issues.

### Receipt Templates (pipelineModules.ts)
- `pickReceiptTemplate` is NOT deterministic for same input due to mutable `poolCounter` state.
- Templates don't have a `total` property — total is computed as `subtotal + cardFee`.

### RAG Search (experiment-2)
- Keyword search uses raw token matching (no stemming).
- Vector search uses TF-IDF with stemming and synonym bonus.
- Vector search handles synonym queries better (e.g., "поездка" → "командировка").

### Graph Engine (experiment-3)
- Conditional split evaluates predecessor status to determine branch.
- `cascadeSkip` recursively marks downstream nodes as skipped.
- Parallel segments detected by tracking max ready batch size.
