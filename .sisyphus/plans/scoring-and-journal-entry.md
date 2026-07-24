# Plan: Scoring System + Journal Entry Allocation

## TL;DR
Add compliance scoring (rules passed/total → percentage) and configurable journal entry generation (Xero/QuickBooks format) with accountant-configurable thresholds.

## Architecture

### Data Flow
```
Pipeline executes → Each rule gets score (1 pass / 0 fail)
                    ↓
          ComplianceSummary { totalRules, passedRules, score, threshold }
                    ↓
          If score% ≥ threshold% → Generate JournalEntry[]
          If score% < threshold% → No entry (flag for manual review)
```

### Types to Add
```typescript
// In types/pipeline.ts
interface RuleCheck {
  ruleId: string;
  ruleName: string;
  category: string;
  passed: boolean;
  score: 0 | 1;
  detail: string;
}

interface JournalEntryLine {
  accountCode: string;       // Xero/QuickBooks account code
  description: string;
  amount: number;
  type: "debit" | "credit";
  taxRate?: string;
  trackingCategory?: string;
}

interface JournalEntry {
  id: string;
  receiptId: string;
  merchant: string;
  date: string;
  total: number;
  lines: JournalEntryLine[];
  summary: string;           // "Expense allocation for {merchant}"
  createdAt: string;
}

interface ComplianceSummary {
  totalRules: number;
  passedRules: number;
  failedRules: number;
  score: number;             // 0.0 - 1.0
  percentage: number;        // 0 - 100
  threshold: number;         // configurable %, default 80
  isCompliant: boolean;      // percentage >= threshold
  ruleChecks: RuleCheck[];
}

// Update PipelineResult to include:
interface PipelineResult {
  // ... existing fields
  complianceSummary: ComplianceSummary;
  journalEntry: JournalEntry | null;  // null if below threshold
}
```

### PipelineContext Changes
```typescript
// New state
complianceThreshold: number;  // default 80
setComplianceThreshold: (threshold: number) => void;
lastJournalEntry: JournalEntry | null;
exportJournalEntry: () => void;  // Export to JSON for Xero/QB import
```

### Execution Engine Changes (`execute.ts`)
- Track each validation module as a "rule check"
- After execution, compute ComplianceSummary
- If percentage ≥ threshold, generate JournalEntry with accounting lines:
  - Debit: Expense account (based on category)
  - Credit: Accounts Payable / Corporate Card account
  - Lines split by category with proper account codes

### Default Account Code Mapping
```
Fuel → "6410" (Fuel & Oil)
Food → "6420" (Meals & Entertainment)
Transport → "6430" (Travel - Transport)
Accommodation → "6440" (Travel - Accommodation)
Training → "6450" (Training & Development)
Equipment → "6460" (Equipment)
Office → "6470" (Office Supplies)
Other → "6490" (Other Expenses)
Cash-out → "6510" (Cash-out - Needs Review)
Credit side → "2100" (Accounts Payable)
```

### UI Components

1. **ComplianceScoreCard** — shows score bar with threshold line, pass/fail status
2. **JournalEntryPanel** — shows generated journal entry lines with account codes
3. **ThresholdConfigurator** — slider/input for threshold (in ExpenseMap or NodeConfigPanel)
4. **Integrate into ExpenseMap.tsx** — show below policy compliance section
5. **Integrate into PipelineResultsPanel.tsx** — show compact version

### Research Paper Extension
- Add Section 4.6: "Compliance scoring and automated journal entry generation"
- Add Section 5.5: "Threshold configuration challenges"
- Update Experiment 3 results with scoring metrics

## Implementation Tasks

- [ ] 1. Update types/pipeline.ts — add RuleCheck, JournalEntryLine, JournalEntry, ComplianceSummary interfaces + update PipelineResult
- [ ] 2. Update utils/pipeline/execute.ts — add rule tracking, compliance scoring, journal entry generation logic
- [ ] 3. Update state/PipelineContext.tsx — add threshold state, setter, journal entry storage, export function
- [ ] 4. Create src/components/pipeline/ComplianceScoreCard.tsx — score display with threshold visualization
- [ ] 5. Create src/components/pipeline/JournalEntryPanel.tsx — journal entry viewer with account codes and export
- [ ] 6. Create src/components/pipeline/ThresholdConfigurator.tsx — threshold slider/input
- [ ] 7. Update ExpenseMap.tsx — integrate ComplianceScoreCard + JournalEntryPanel
- [ ] 8. Update PipelineResultsPanel.tsx — integrate compact scoring display
- [ ] 9. Extend docs/scientific-paper.md — add section about compliance scoring feature
