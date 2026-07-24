export type ExpenseCategory =
  | "Fuel"
  | "Food"
  | "Transport"
  | "Accommodation"
  | "Training"
  | "Equipment"
  | "Office"
  | "Other";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Fuel",
  "Food",
  "Transport",
  "Accommodation",
  "Training",
  "Equipment",
  "Office",
  "Other",
];

export const CATEGORY_COLOR_VARS: Record<ExpenseCategory, { fg: string; bg: string }> = {
  Fuel: { fg: "var(--cat-fuel)", bg: "var(--cat-fuel-soft)" },
  Food: { fg: "var(--cat-food)", bg: "var(--cat-food-soft)" },
  Transport: { fg: "var(--cat-transport)", bg: "var(--cat-transport-soft)" },
  Accommodation: { fg: "var(--cat-accommodation)", bg: "var(--cat-accommodation-soft)" },
  Training: { fg: "var(--cat-training)", bg: "var(--cat-training-soft)" },
  Equipment: { fg: "var(--cat-equipment)", bg: "var(--cat-equipment-soft)" },
  Office: { fg: "var(--cat-office)", bg: "var(--cat-office-soft)" },
  Other: { fg: "var(--cat-other)", bg: "var(--cat-other-soft)" },
};

export interface LineItem {
  id: string;
  description: string;
  amount: number;
  category?: ExpenseCategory;
}

export type OcrStatus = "pending" | "processing" | "complete" | "error";

export interface Receipt {
  id: string;
  filename: string;
  imageDataUrl?: string;
  uploadedAt: string;
  ocrStatus: OcrStatus;
  ocrLog: string[];
  merchant: string;
  date: string;
  total: number;
  lineItems: LineItem[];
  cashOut: boolean;
  loyaltyPointsSpent: number;
  cardFeeAmount: number;
  netGoodsAmount: number;
}

export type ModuleType = "input" | "validation" | "logic" | "output";

export type ModuleId =
  | "input.receipt"
  | "validation.cashout"
  | "validation.categorize"
  | "validation.policy"
  | "logic.ifthen"
  | "logic.loop"
  | "logic.aggregator"
  | "output.expenseMap";

export interface ModuleDefinition {
  id: ModuleId;
  type: ModuleType;
  label: string;
  shortLabel: string;
  description: string;
  defaultParams: Record<string, unknown>;
  paramSchema: ParamField[];
  inputs: number;
  outputs: number;
}

export interface ParamField {
  key: string;
  label: string;
  kind: "text" | "number" | "boolean" | "select" | "categories" | "kvList";
  options?: string[];
  help?: string;
  defaultValue?: unknown;
}

export interface PipelineNodeData {
  moduleId: ModuleId;
  label: string;
  params: Record<string, unknown>;
  status?: NodeStatus;
  resultSummary?: string;
  [key: string]: unknown;
}

export type NodeStatus = "idle" | "running" | "success" | "error" | "skipped";

export interface CategoryBucket {
  category: ExpenseCategory;
  total: number;
  count: number;
  itemIds: string[];
}

export interface PipelineResult {
  byCategory: CategoryBucket[];
  totalExpenses: number;
  totalItems: number;
  cashOutDetected: boolean;
  policyFlags: PolicyFlag[];
  receiptId: string;
  complianceSummary: ComplianceSummary;
  journalEntry: JournalEntry | null;
}

export interface PolicyFlag {
  rule: string;
  message: string;
  severity: "info" | "warning" | "error";
  receiptId: string;
}

export interface RuleCheck {
  ruleId: string;
  ruleName: string;
  category: string;
  passed: boolean;
  score: 0 | 1;
  detail: string;
}

export interface JournalEntryLine {
  accountCode: string;
  description: string;
  amount: number;
  type: "debit" | "credit";
  taxRate?: string;
  trackingCategory?: string;
}

export interface JournalEntry {
  id: string;
  receiptId: string;
  merchant: string;
  date: string;
  total: number;
  lines: JournalEntryLine[];
  summary: string;
  createdAt: string;
}

export interface ComplianceSummary {
  totalRules: number;
  passedRules: number;
  failedRules: number;
  score: number;
  percentage: number;
  threshold: number;
  isCompliant: boolean;
  ruleChecks: RuleCheck[];
}

export interface PipelineTemplateNode {
  id: string;
  moduleId: ModuleId;
  label: string;
  params: Record<string, unknown>;
  position: { x: number; y: number };
}

export interface PipelineTemplateEdge {
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface PipelineTemplate {
  id: string;
  name: string;
  description: string;
  nodes: PipelineTemplateNode[];
  edges: PipelineTemplateEdge[];
  isBuiltIn: boolean;
  createdAt: string;
  updatedAt: string;
}
