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
  /** Amount shown on the "Change" / "CHANGE" line of the receipt. 0 if no change line. */
  changeAmount?: number;
  /** Amount actually paid by card. 0 if paid in cash only. Often equals total for card-only payment. */
  paidByCard?: number;
  /** ISO 3166-1 alpha-2 country code of the supplier. "AU" by default. */
  country?: string;
  /** Australian Business Number (11-digit). Required for AU tax invoices over $82.50. */
  abn?: string;
  /** Currency code the receipt was issued in. "AUD" by default. */
  currency?: string;
}

export type ModuleType = "input" | "validation" | "logic" | "output";

export type ModuleId =
  | "input.receipt"
  | "validation.cashout"
  | "validation.categorize"
  | "validation.policy"
  | "validation.abn"
  | "validation.foreign_no_abn"
  | "logic.ifthen"
  | "logic.threshold"
  | "logic.compliance_split"
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

export interface WorkflowNodeData {
  moduleId: ModuleId;
  label: string;
  params: Record<string, unknown>;
  status?: NodeStatus;
  resultSummary?: string;
  [key: string]: unknown;
}

export type PipelineNodeData = WorkflowNodeData;

export type NodeStatus = "idle" | "running" | "success" | "error" | "skipped";

export interface CategoryBucket {
  category: ExpenseCategory;
  total: number;
  count: number;
  itemIds: string[];
}

export interface WorkflowResult {
  byCategory: CategoryBucket[];
  totalExpenses: number;
  totalItems: number;
  cashOutDetected: boolean;
  /** Computed cash-out amount (max of explicit / implied / card_change variants). */
  cashOutAmount: number;
  /** Reason / variant of the cash-out detection, used by the UI to show context. */
  cashOutReason: "none" | "explicit" | "implied" | "card_change";
  policyFlags: PolicyFlag[];
  receiptId: string;
  complianceSummary: ComplianceSummary;
  journalEntry: JournalEntry | null;
}

export type PipelineResult = WorkflowResult;

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

export interface WorkflowTemplateNode {
  id: string;
  moduleId: ModuleId;
  label: string;
  params: Record<string, unknown>;
  position: { x: number; y: number };
}

export type PipelineTemplateNode = WorkflowTemplateNode;

export interface WorkflowTemplateEdge {
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export type PipelineTemplateEdge = WorkflowTemplateEdge;

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowTemplateNode[];
  edges: WorkflowTemplateEdge[];
  isBuiltIn: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PipelineTemplate = WorkflowTemplate;
