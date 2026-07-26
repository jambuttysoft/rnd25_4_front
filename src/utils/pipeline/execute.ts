import { inferCategory } from "../../data/pipelineModules";
import type {
  CategoryBucket,
  ComplianceSummary,
  ExpenseCategory,
  JournalEntry,
  JournalEntryLine,
  LineItem,
  PipelineResult,
  PolicyFlag,
  Receipt,
  RuleCheck,
} from "../../types/pipeline";
import { EXPENSE_CATEGORIES } from "../../types/pipeline";

export interface ChainNode {
  id: string;
  moduleId: string;
  params: Record<string, unknown>;
  result?: unknown;
}

export interface ChainEdge {
  source: string;
  target: string;
  sourceHandle?: string;
}

export interface ChainDefinition {
  nodes: ChainNode[];
  edges: ChainEdge[];
}

export interface ExecutionContext {
  receipt: Receipt;
  flags: PolicyFlag[];
  categorized: LineItem[];
  cashOut: boolean;
  cashOutAmount: number;
  /** Why the cashout flag tripped. */
  cashOutReason: "none" | "explicit" | "implied" | "card_change";
  byCategory: Map<ExpenseCategory, CategoryBucket>;
  totalExpenses: number;
  cashOutChannel: boolean;
  normalChannel: boolean;
  ruleChecks: RuleCheck[];
  threshold: number;
}

function comparePolicyValue(actual: number, rule: string): { ok: boolean; severity: PolicyFlag["severity"] } {
  if (rule === "block") return { ok: false, severity: "error" };
  if (rule === "warn") return { ok: true, severity: "warning" };
  return { ok: true, severity: "info" };
}

export function executeChain(chain: ChainDefinition, receipt: Receipt, threshold?: number): PipelineResult {
  const ctx: ExecutionContext = {
    receipt,
    flags: [],
    categorized: receipt.lineItems.map((li) => ({ ...li })),
    cashOut: receipt.cashOut,
    cashOutAmount: 0,
    cashOutReason: "none",
    byCategory: new Map(),
    totalExpenses: 0,
    cashOutChannel: false,
    normalChannel: true,
    ruleChecks: [],
    threshold: threshold ?? 80,
  };

  const moduleMap = new Map(chain.nodes.map((n) => [n.id, n]));

  const visited = new Set<string>();
  const visit = (id: string) => {
    if (visited.has(id)) return;
    visited.add(id);
    const node = moduleMap.get(id);
    if (!node) return;
    runModule(node, ctx);
    const out = chain.edges.filter((e) => e.source === id);
    out.forEach((e) => visit(e.target));
  };

  const roots = chain.nodes.filter((n) => !chain.edges.some((e) => e.target === n.id));
  roots.forEach((n) => visit(n.id));

  for (const item of ctx.categorized) {
    const cat = (item.category as ExpenseCategory) ?? "Other";
    const bucket = ctx.byCategory.get(cat) ?? {
      category: cat,
      total: 0,
      count: 0,
      itemIds: [],
    };
    bucket.total += item.amount;
    bucket.count += 1;
    bucket.itemIds.push(item.id);
    ctx.byCategory.set(cat, bucket);
  }
  ctx.totalExpenses = Array.from(ctx.byCategory.values()).reduce((a, b) => a + b.total, 0);

  const ordered: CategoryBucket[] = EXPENSE_CATEGORIES.map((c) => ctx.byCategory.get(c) ?? {
    category: c,
    total: 0,
    count: 0,
    itemIds: [],
  }).filter((b) => b.count > 0);

  const result: PipelineResult = {
    byCategory: ordered,
    totalExpenses: +ctx.totalExpenses.toFixed(2),
    totalItems: ctx.categorized.length,
    cashOutDetected: ctx.cashOut,
    cashOutAmount: +ctx.cashOutAmount.toFixed(2),
    cashOutReason: ctx.cashOutReason,
    policyFlags: ctx.flags,
    receiptId: receipt.id,
    complianceSummary: {} as ComplianceSummary,
    journalEntry: null,
  };

  const passedRules = ctx.ruleChecks.filter((r) => r.passed).length;
  const totalRules = ctx.ruleChecks.length;
  const score = totalRules > 0 ? passedRules / totalRules : 1;
  const percentage = Math.round(score * 100);

  result.complianceSummary = {
    totalRules,
    passedRules,
    failedRules: totalRules - passedRules,
    score,
    percentage,
    threshold: ctx.threshold,
    isCompliant: percentage >= ctx.threshold,
    ruleChecks: ctx.ruleChecks,
  };

  result.journalEntry = generateJournalEntry(result, receipt);

  return result;
}

function runModule(node: ChainNode, ctx: ExecutionContext): void {
  switch (node.moduleId) {
    case "input.receipt":
      return;
    case "validation.cashout": {
      const threshold = Number(node.params.threshold ?? 0);
      const cashOutLines = ctx.receipt.lineItems.filter((li) =>
        /cash|withdrawal|atm/i.test(li.description),
      );
      const explicitAmount = cashOutLines.reduce((a, li) => a + li.amount, 0);
      const impliedAmount = ctx.receipt.cashOut
        ? Math.max(0, ctx.receipt.total - ctx.receipt.netGoodsAmount - ctx.receipt.cardFeeAmount)
        : 0;
      // Variant 3: card payment + cash change (till dispensed cash as "change")
      const changeAmount = ctx.receipt.changeAmount ?? 0;
      const paidByCard = ctx.receipt.paidByCard ?? 0;
      const cardChangeAmount = paidByCard > 0 && changeAmount > 0 ? changeAmount : 0;
      ctx.cashOutAmount = Math.max(explicitAmount, impliedAmount, cardChangeAmount);
      // Determine reason
      if (cardChangeAmount > 0 && cardChangeAmount >= explicitAmount && cardChangeAmount >= impliedAmount) {
        ctx.cashOutReason = "card_change";
      } else if (explicitAmount > 0 && explicitAmount >= impliedAmount) {
        ctx.cashOutReason = "explicit";
      } else if (impliedAmount > 0) {
        ctx.cashOutReason = "implied";
      } else {
        ctx.cashOutReason = ctx.cashOut ? "explicit" : "none";
      }
      ctx.cashOut = ctx.cashOut || cardChangeAmount > 0;
      if (ctx.cashOut && ctx.cashOutAmount >= threshold) {
        const suffix = ctx.cashOutReason === "card_change" ? " (card+change)" : "";
        ctx.flags.push({
          rule: "cashout.detected",
          message: `Cash-out of $${ctx.cashOutAmount.toFixed(2)} detected on ${ctx.receipt.merchant}.${suffix}`,
          severity: "warning",
          receiptId: ctx.receipt.id,
        });
      }
      ctx.ruleChecks.push({
        ruleId: "cashout",
        ruleName: "Cash-out Detection",
        category: "validation",
        passed: !(ctx.cashOut && ctx.cashOutAmount >= threshold),
        score: ctx.cashOut && ctx.cashOutAmount >= threshold ? 0 : 1,
        detail: ctx.cashOut && ctx.cashOutAmount >= threshold
          ? `Cash-out detected${ctx.cashOutReason === "card_change" ? " (card+change)" : ""}: $${ctx.cashOutAmount.toFixed(2)}`
          : "No cash-out detected",
      });
      return;
    }
    case "validation.categorize": {
      const fallback = (node.params.fallback as string) ?? "Other";
      ctx.categorized = ctx.receipt.lineItems.map((li) => {
        if (li.category) return li;
        const cat = inferCategory(li.description) || fallback;
        return { ...li, category: cat as ExpenseCategory };
      });
      return;
    }
    case "validation.policy": {
      const maxMeal = Number(node.params.maxMeal ?? 35);
      const maxHotelNight = Number(node.params.maxHotelNight ?? 250);
      const maxFuelLitres = Number(node.params.maxFuelLitres ?? 60);
      const requireAbove = Number(node.params.requireReceiptAbove ?? 25);
      let mealFail = false;
      let hotelFail = false;
      let fuelFail = false;
      let receiptFail = false;
      ctx.categorized.forEach((li) => {
        const cat = (li.category ?? "Other") as string;
        if (cat === "Food" && li.amount > maxMeal) {
          mealFail = true;
          ctx.flags.push({
            rule: "policy.meal",
            message: `Meal exceeds policy ($${li.amount.toFixed(2)} > $${maxMeal}).`,
            severity: "warning",
            receiptId: ctx.receipt.id,
          });
        }
        if (cat === "Accommodation" && li.amount > maxHotelNight) {
          hotelFail = true;
          ctx.flags.push({
            rule: "policy.hotel",
            message: `Hotel night exceeds policy ($${li.amount.toFixed(2)} > $${maxHotelNight}).`,
            severity: "warning",
            receiptId: ctx.receipt.id,
          });
        }
        if (cat === "Fuel") {
          const litres = parseFloat(li.description.match(/([\d.]+)\s*L/)?.[1] ?? "0");
          if (litres > maxFuelLitres) {
            fuelFail = true;
            ctx.flags.push({
              rule: "policy.fuel",
              message: `Fuel volume exceeds policy (${litres}L > ${maxFuelLitres}L).`,
              severity: "warning",
              receiptId: ctx.receipt.id,
            });
          }
        }
      });
      if (ctx.receipt.total >= requireAbove && !ctx.receipt.filename) {
        receiptFail = true;
        ctx.flags.push({
          rule: "policy.receipt",
          message: "Receipt required for amounts above policy threshold.",
          severity: "info",
          receiptId: ctx.receipt.id,
        });
      }
      ctx.ruleChecks.push({
        ruleId: "policy.meal",
        ruleName: "Meal Policy",
        category: "policy",
        passed: !mealFail,
        score: mealFail ? 0 : 1,
        detail: mealFail ? `Meal(s) exceed policy limit of $${maxMeal}` : "All meals within policy",
      });
      ctx.ruleChecks.push({
        ruleId: "policy.hotel",
        ruleName: "Hotel Policy",
        category: "policy",
        passed: !hotelFail,
        score: hotelFail ? 0 : 1,
        detail: hotelFail ? `Hotel night(s) exceed policy limit of $${maxHotelNight}` : "All accommodation within policy",
      });
      ctx.ruleChecks.push({
        ruleId: "policy.fuel",
        ruleName: "Fuel Policy",
        category: "policy",
        passed: !fuelFail,
        score: fuelFail ? 0 : 1,
        detail: fuelFail ? `Fuel exceeds policy limit of ${maxFuelLitres}L` : "Fuel within policy",
      });
      ctx.ruleChecks.push({
        ruleId: "policy.receipt",
        ruleName: "Receipt Requirement",
        category: "policy",
        passed: !receiptFail,
        score: receiptFail ? 0 : 1,
        detail: receiptFail ? "Receipt required for amounts above threshold" : "Receipt requirement met",
      });
      return;
    }
    case "logic.ifthen": {
      const field = String(node.params.field ?? "cashOut");
      const equals = String(node.params.equals ?? "true");
      const value = String((ctx as unknown as Record<string, unknown>)[field] ?? "");
      ctx.cashOutChannel = value === equals;
      ctx.normalChannel = value !== equals;
      return;
    }
    case "logic.loop": {
      return;
    }
    case "logic.aggregator": {
      return;
    }
    case "output.expenseMap": {
      return;
    }
    default:
      return;
  }
}

export const CATEGORY_ACCOUNT_CODES: Record<string, string> = {
  Fuel: "6410",
  Food: "6420",
  Transport: "6430",
  Accommodation: "6440",
  Training: "6450",
  Equipment: "6460",
  Office: "6470",
  Other: "6490",
};

export const CHART_OF_ACCOUNTS: Record<string, string> = {
  "1100": "Petty cash",
  "2100": "Accounts payable",
  "6410": "Motor vehicle expenses",
  "6420": "Meal and entertainment expenses",
  "6430": "Travel expenses",
  "6440": "Accommodation expenses",
  "6450": "Training and conference expenses",
  "6460": "Equipment expenses",
  "6470": "Office expenses",
  "6490": "General expenses",
  "6500": "Owner drawings (A/W)",
  "6510": "Cash drawings — cash-out review",
};

export const DEFAULT_CASH_OUT_ACCOUNT_CODE = "6500";

const CASH_OUT_KEYWORD_RE = /cash|withdrawal|atm/i;

export function computeCashOutAmount(receipt: Receipt): number {
  const changeAmount = receipt.changeAmount ?? 0;
  const paidByCard = receipt.paidByCard ?? 0;
  const cardChangeAmount = paidByCard > 0 && changeAmount > 0 ? changeAmount : 0;
  const explicitAmount = receipt.lineItems
    .filter((li) => CASH_OUT_KEYWORD_RE.test(li.description))
    .reduce((sum, li) => sum + (li.amount ?? 0), 0);
  const impliedAmount = receipt.cashOut
    ? Math.max(0, receipt.total - receipt.netGoodsAmount - receipt.cardFeeAmount)
    : 0;
  return Math.max(cardChangeAmount, explicitAmount, impliedAmount);
}

export function getAccountName(code: string): string {
  return CHART_OF_ACCOUNTS[code] ?? `Account ${code}`;
}

export function generateJournalEntry(
  result: PipelineResult,
  receipt: Receipt,
  cashOutAccountCode: string = DEFAULT_CASH_OUT_ACCOUNT_CODE,
): JournalEntry | null {
  if (!result.complianceSummary.isCompliant) return null;

  const lines: JournalEntryLine[] = [];

  for (const bucket of result.byCategory) {
    const accountCode = CATEGORY_ACCOUNT_CODES[bucket.category] || "6490";
    lines.push({
      accountCode,
      description: `${bucket.category} expenses - ${receipt.merchant}`,
      amount: +bucket.total.toFixed(2),
      type: "debit",
      trackingCategory: bucket.category,
    });
  }

  const cashOutAmount = +(result.cashOutAmount ?? computeCashOutAmount(receipt)).toFixed(2);
  if (result.cashOutDetected && cashOutAmount > 0) {
    const accountLabel = CHART_OF_ACCOUNTS[cashOutAccountCode] ?? "Cash withdrawal";
    lines.push({
      accountCode: cashOutAccountCode,
      description: `${accountLabel} - ${receipt.merchant}`,
      amount: cashOutAmount,
      type: "debit",
      taxRate: "GST Free",
    });
  }

  const totalDebits = +lines.reduce((a, l) => a + l.amount, 0).toFixed(2);
  lines.push({
    accountCode: "2100",
    description: `Accounts payable - ${receipt.merchant}`,
    amount: totalDebits,
    type: "credit",
  });

  return {
    id: `je-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    receiptId: receipt.id,
    merchant: receipt.merchant,
    date: receipt.date,
    total: totalDebits,
    lines,
    summary: `Expense allocation for ${receipt.merchant} - ${receipt.date}`,
    createdAt: new Date().toISOString(),
  };
}

export function topologicalOrder(nodes: ChainNode[], edges: ChainEdge[]): ChainNode[] {
  const inDeg = new Map<string, number>(nodes.map((n) => [n.id, 0] as [string, number]));
  edges.forEach((e) => inDeg.set(e.target, (inDeg.get(e.target) ?? 0) + 1));
  const queue = nodes.filter((n) => inDeg.get(n.id) === 0);
  const order: ChainNode[] = [];
  while (queue.length) {
    const n = queue.shift()!;
    order.push(n);
    edges
      .filter((e) => e.source === n.id)
      .forEach((e) => {
        const d = (inDeg.get(e.target) ?? 0) - 1;
        inDeg.set(e.target, d);
        if (d === 0) {
          const next = nodes.find((x) => x.id === e.target);
          if (next) queue.push(next);
        }
      });
  }
  return order.length === nodes.length ? order : nodes;
}

export function buildResultSummary(moduleId: string, ctx: ExecutionContext, result: PipelineResult): string {
  switch (moduleId) {
    case "input.receipt":
      return `${ctx.receipt.merchant} · $${ctx.receipt.total.toFixed(2)}`;
    case "validation.cashout":
      if (!ctx.cashOut) return "No cash-out";
      if (ctx.cashOutReason === "card_change") return `Flag: $${ctx.cashOutAmount.toFixed(2)} cash-out (card+change)`;
      return ctx.cashOut
        ? `Flag: $${ctx.cashOutAmount.toFixed(2)} cash-out`
        : "No cash-out";
    case "validation.categorize":
      return `${ctx.categorized.length} items categorised`;
    case "validation.policy":
      return ctx.flags.length === 0
        ? "Compliant"
        : `${ctx.flags.length} flag${ctx.flags.length === 1 ? "" : "s"}`;
    case "logic.ifthen":
      return ctx.cashOutChannel ? "Branch: cash-out" : "Branch: normal";
    case "logic.loop":
      return `Iterate × ${ctx.categorized.length}`;
    case "logic.aggregator":
      return `${result.byCategory.length} categories`;
    case "output.expenseMap":
      return `$${result.totalExpenses.toFixed(2)} total · ${result.totalItems} items`;
    default:
      return "—";
  }
}
