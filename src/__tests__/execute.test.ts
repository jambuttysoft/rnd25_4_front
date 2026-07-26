import { describe, it, expect } from "vitest";
import {
  executeChain,
  topologicalOrder,
  buildResultSummary,
  getAccountName,
  type ChainNode,
  type ChainEdge,
  type ChainDefinition,
  type ExecutionContext,
} from "../utils/pipeline/execute";
import type { Receipt, PipelineResult } from "../types/pipeline";


function makeReceipt(overrides: Partial<Receipt> = {}): Receipt {
  return {
    id: "rcp-test-0001",
    filename: "test-receipt.jpg",
    uploadedAt: "2026-07-22T10:00:00Z",
    ocrStatus: "complete",
    ocrLog: [],
    merchant: "Test Merchant",
    date: "2026-07-22",
    total: 100.0,
    lineItems: [
      { id: "li-1", description: "Lunch set", amount: 28.5, category: "Food" },
      { id: "li-2", description: "Espresso", amount: 5.5, category: "Food" },
      { id: "li-3", description: "Bottled water", amount: 4.0, category: "Food" },
    ],
    cashOut: false,
    loyaltyPointsSpent: 0,
    cardFeeAmount: 1.62,
    netGoodsAmount: 98.38,
    ...overrides,
  };
}

function makeSimpleChain(modules: { id: string; moduleId: string; params?: Record<string, unknown> }[]): ChainDefinition {
  const nodes: ChainNode[] = modules.map((m) => ({
    id: m.id,
    moduleId: m.moduleId,
    params: m.params ?? {},
  }));
  const edges: ChainEdge[] = [];
  for (let i = 0; i < modules.length - 1; i++) {
    edges.push({ source: modules[i].id, target: modules[i + 1].id });
  }
  return { nodes, edges };
}


describe("executeChain", () => {
  it("should return empty result with no modules", () => {
    const receipt = makeReceipt();
    const result = executeChain({ nodes: [], edges: [] }, receipt);
    expect(result.totalItems).toBe(3);
    expect(result.totalExpenses).toBe(38.0);
    expect(result.byCategory).toHaveLength(1);
    expect(result.cashOutDetected).toBe(false);
    expect(result.policyFlags).toHaveLength(0);
    expect(result.receiptId).toBe("rcp-test-0001");
  });

  it("should execute input.receipt module without errors", () => {
    const chain = makeSimpleChain([
      { id: "n1", moduleId: "input.receipt" },
    ]);
    const result = executeChain(chain, makeReceipt());
    expect(result.totalItems).toBe(3);
    expect(result.totalExpenses).toBe(38.0);
  });

  it("should categorize line items with validation.categorize", () => {
    const receipt = makeReceipt({
      lineItems: [
        { id: "li-1", description: "Unleaded petrol 38.4L", amount: 72.18 },
        { id: "li-2", description: "Lunch set", amount: 4.5 },
        { id: "li-3", description: "Car wash", amount: 12.0 },
      ],
    });
    const chain = makeSimpleChain([
      { id: "n1", moduleId: "input.receipt" },
      { id: "n2", moduleId: "validation.categorize", params: { fallback: "Other" } },
    ]);
    const result = executeChain(chain, receipt);
    const categories = result.byCategory.map((b) => b.category);
    expect(categories).toContain("Fuel");
    expect(categories).toContain("Other");
  });

  it("should detect cash-out with validation.cashout module", () => {
    const receipt = makeReceipt({ cashOut: true });
    const chain = makeSimpleChain([
      { id: "n1", moduleId: "input.receipt" },
      { id: "n2", moduleId: "validation.cashout", params: { threshold: 0 } },
    ]);
    const result = executeChain(chain, receipt);
    expect(result.cashOutDetected).toBe(true);
    expect(result.policyFlags.length).toBeGreaterThanOrEqual(1);
    expect(result.policyFlags[0].rule).toBe("cashout.detected");
  });

  it("should not flag cash-out below threshold", () => {
    const receipt = makeReceipt({ cashOut: true });
    const chain = makeSimpleChain([
      { id: "n1", moduleId: "input.receipt" },
      { id: "n2", moduleId: "validation.cashout", params: { threshold: 999 } },
    ]);
    const result = executeChain(chain, receipt);
    expect(result.cashOutDetected).toBe(true);
    expect(result.policyFlags).toHaveLength(0);
  });

  it("should flag meal exceeding policy limit", () => {
    const receipt = makeReceipt({
      lineItems: [
        { id: "li-1", description: "Expensive dinner", amount: 50.0, category: "Food" },
      ],
    });
    const chain = makeSimpleChain([
      { id: "n1", moduleId: "input.receipt" },
      { id: "n2", moduleId: "validation.categorize", params: { fallback: "Other" } },
      { id: "n3", moduleId: "validation.policy", params: { maxMeal: 35 } },
    ]);
    const result = executeChain(chain, receipt);
    const mealFlags = result.policyFlags.filter((f) => f.rule === "policy.meal");
    expect(mealFlags).toHaveLength(1);
    expect(mealFlags[0].severity).toBe("warning");
  });

  it("should flag hotel exceeding policy limit", () => {
    const receipt = makeReceipt({
      lineItems: [
        { id: "li-1", description: "Room 2 nights", amount: 600.0, category: "Accommodation" },
      ],
    });
    const chain = makeSimpleChain([
      { id: "n1", moduleId: "input.receipt" },
      { id: "n2", moduleId: "validation.categorize", params: { fallback: "Other" } },
      { id: "n3", moduleId: "validation.policy", params: { maxHotelNight: 250 } },
    ]);
    const result = executeChain(chain, receipt);
    const hotelFlags = result.policyFlags.filter((f) => f.rule === "policy.hotel");
    expect(hotelFlags).toHaveLength(1);
  });

  it("should flag fuel exceeding volume policy", () => {
    const receipt = makeReceipt({
      lineItems: [
        { id: "li-1", description: "Unleaded petrol 80.5L", amount: 150.0, category: "Fuel" },
      ],
    });
    const chain = makeSimpleChain([
      { id: "n1", moduleId: "input.receipt" },
      { id: "n2", moduleId: "validation.categorize", params: { fallback: "Other" } },
      { id: "n3", moduleId: "validation.policy", params: { maxFuelLitres: 60 } },
    ]);
    const result = executeChain(chain, receipt);
    const fuelFlags = result.policyFlags.filter((f) => f.rule === "policy.fuel");
    expect(fuelFlags).toHaveLength(1);
  });

  it("should not flag fuel below volume policy", () => {
    const receipt = makeReceipt({
      lineItems: [
        { id: "li-1", description: "Unleaded petrol 38.4L", amount: 72.18, category: "Fuel" },
      ],
    });
    const chain = makeSimpleChain([
      { id: "n1", moduleId: "input.receipt" },
      { id: "n2", moduleId: "validation.categorize", params: { fallback: "Other" } },
      { id: "n3", moduleId: "validation.policy", params: { maxFuelLitres: 60 } },
    ]);
    const result = executeChain(chain, receipt);
    const fuelFlags = result.policyFlags.filter((f) => f.rule === "policy.fuel");
    expect(fuelFlags).toHaveLength(0);
  });

  it("should route via ifthen based on cashOut field", () => {
    const receipt = makeReceipt({ cashOut: true });
    const chain = makeSimpleChain([
      { id: "n1", moduleId: "input.receipt" },
      { id: "n2", moduleId: "logic.ifthen", params: { field: "cashOut", equals: "true" } },
    ]);
    const result = executeChain(chain, receipt);
    expect(result.cashOutDetected).toBe(true);
  });

  it("should handle complete preset chain with all modules", () => {
    const receipt = makeReceipt({
      cashOut: true,
      lineItems: [
        { id: "li-1", description: "Unleaded petrol 38.4L", amount: 72.18, category: "Fuel" },
        { id: "li-2", description: "Lunch set", amount: 28.5, category: "Food" },
        { id: "li-3", description: "Bottled water", amount: 4.5, category: "Food" },
      ],
    });
    const chain: ChainDefinition = {
      nodes: [
        { id: "n1", moduleId: "input.receipt", params: {} },
        { id: "n2", moduleId: "validation.cashout", params: { threshold: 0 } },
        { id: "n3", moduleId: "validation.categorize", params: { fallback: "Other" } },
        { id: "n4", moduleId: "validation.policy", params: { maxMeal: 35, maxHotelNight: 250, maxFuelLitres: 60 } },
        { id: "n5", moduleId: "logic.loop", params: { over: "lineItems" } },
        { id: "n6", moduleId: "logic.aggregator", params: { groupBy: "category" } },
        { id: "n7", moduleId: "output.expenseMap", params: { format: "treemap" } },
      ],
      edges: [
        { source: "n1", target: "n2" },
        { source: "n2", target: "n3" },
        { source: "n3", target: "n4" },
        { source: "n4", target: "n5" },
        { source: "n5", target: "n6" },
        { source: "n6", target: "n7" },
      ],
    };
    const result = executeChain(chain, receipt);
    expect(result.cashOutDetected).toBe(true);
    expect(result.byCategory.length).toBeGreaterThanOrEqual(1);
    expect(result.totalItems).toBe(3);
    expect(result.totalExpenses).toBe(105.18);
  });

  it("should aggregate totals correctly across categories", () => {
    const receipt = makeReceipt({
      lineItems: [
        { id: "li-1", description: "Unleaded petrol", amount: 72.18, category: "Fuel" },
        { id: "li-2", description: "Lunch set", amount: 28.5, category: "Food" },
        { id: "li-3", description: "Taxi ride", amount: 35.0, category: "Transport" },
      ],
    });
    const chain = makeSimpleChain([
      { id: "n1", moduleId: "input.receipt" },
      { id: "n2", moduleId: "validation.categorize", params: { fallback: "Other" } },
    ]);
    const result = executeChain(chain, receipt);
    expect(result.byCategory).toHaveLength(3);
    const total = result.byCategory.reduce((sum, b) => sum + b.total, 0);
    expect(total).toBeCloseTo(135.68, 2);
  });

  it("should handle receipt with empty line items", () => {
    const receipt = makeReceipt({ lineItems: [] });
    const chain = makeSimpleChain([
      { id: "n1", moduleId: "input.receipt" },
    ]);
    const result = executeChain(chain, receipt);
    expect(result.totalItems).toBe(0);
    expect(result.totalExpenses).toBe(0);
    expect(result.byCategory).toHaveLength(0);
  });

  it("should generate a journal entry when compliance score meets threshold", () => {
    const receipt = makeReceipt({
      lineItems: [
        { id: "li-1", description: "Lunch set", amount: 28.5, category: "Food" },
        { id: "li-2", description: "Espresso", amount: 5.5, category: "Food" },
      ],
    });
    const chain = makeSimpleChain([
      { id: "n1", moduleId: "input.receipt" },
      { id: "n2", moduleId: "validation.categorize", params: { fallback: "Other" } },
    ]);
    const result = executeChain(chain, receipt, 80);
    expect(result.complianceSummary.isCompliant).toBe(true);
    expect(result.journalEntry).not.toBeNull();
    expect(result.journalEntry?.lines.length).toBeGreaterThan(0);
    const creditLine = result.journalEntry?.lines.find((l) => l.type === "credit");
    expect(creditLine).toBeDefined();
  });

  it("should return null journal entry when compliance score is below threshold", () => {
    const receipt = makeReceipt({
      lineItems: [
        { id: "li-1", description: "Lunch set", amount: 28.5, category: "Food" },
      ],
    });
    const chain = makeSimpleChain([
      { id: "n1", moduleId: "input.receipt" },
      { id: "n2", moduleId: "validation.categorize", params: { fallback: "Other" } },
    ]);
    const result = executeChain(chain, receipt, 1000);
    expect(result.complianceSummary.isCompliant).toBe(false);
    expect(result.journalEntry).toBeNull();
  });

  it("should handle fallback category for uncategorized items", () => {
    const receipt = makeReceipt({
      lineItems: [
        { id: "li-1", description: "Mystery item", amount: 25.0 },
      ],
    });
    const chain = makeSimpleChain([
      { id: "n1", moduleId: "input.receipt" },
      { id: "n2", moduleId: "validation.categorize", params: { fallback: "Other" } },
    ]);
    const result = executeChain(chain, receipt);
    expect(result.byCategory[0].category).toBe("Other");
    expect(result.byCategory[0].total).toBe(25.0);
  });

  it("should respect custom fallback category", () => {
    const receipt = makeReceipt({
      lineItems: [
        { id: "li-1", description: "Unknown thing", amount: 15.0 },
      ],
    });
    const chain = makeSimpleChain([
      { id: "n1", moduleId: "input.receipt" },
      { id: "n2", moduleId: "validation.categorize", params: { fallback: "Other" } },
    ]);
    const result = executeChain(chain, receipt);
    expect(result.byCategory[0].category).toBe("Other");
  });

  it("should detect card+change cashout variant", () => {
    const receipt = makeReceipt({
      total: 7.30,
      lineItems: [
        { id: "li-1", description: "Bread loaf", amount: 4.5, category: "Food" },
        { id: "li-2", description: "Bottled water 6-pack", amount: 2.8, category: "Food" },
      ],
      cashOut: false,
      paidByCard: 7.30,
      changeAmount: 20.00,
      netGoodsAmount: -12.70,
    });
    const chain = makeSimpleChain([
      { id: "n1", moduleId: "input.receipt" },
      { id: "n2", moduleId: "validation.cashout", params: { threshold: 0 } },
    ]);
    const result = executeChain(chain, receipt);
    expect(result.cashOutDetected).toBe(true);
    expect(result.cashOutReason).toBe("card_change");
    expect(result.policyFlags.length).toBeGreaterThanOrEqual(1);
    const flag = result.policyFlags.find((f) => f.rule === "cashout.detected");
    expect(flag).toBeDefined();
    expect(flag!.message).toContain("card+change");
  });

  it("should not flag card+change when changeAmount is 0", () => {
    const receipt = makeReceipt({
      total: 50.00,
      lineItems: [
        { id: "li-1", description: "Office supplies", amount: 50.0, category: "Office" },
      ],
      cashOut: false,
      paidByCard: 50.00,
      changeAmount: 0,
    });
    const chain = makeSimpleChain([
      { id: "n1", moduleId: "input.receipt" },
      { id: "n2", moduleId: "validation.cashout", params: { threshold: 0 } },
    ]);
    const result = executeChain(chain, receipt);
    expect(result.cashOutDetected).toBe(false);
    expect(result.cashOutReason).toBe("none");
  });

  it("should preserve explicit cashout reason priority", () => {
    const receipt = makeReceipt({
      total: 87.30,
      lineItems: [
        { id: "li-1", description: "Bread loaf", amount: 4.5, category: "Food" },
        { id: "li-2", description: "Bottled water", amount: 2.8, category: "Food" },
        { id: "li-3", description: "Cash withdrawal $80", amount: 80.0, category: "Other" },
      ],
      cashOut: true,
      paidByCard: 7.30,
      changeAmount: 20.00,
      netGoodsAmount: 7.30,
    });
    const chain = makeSimpleChain([
      { id: "n1", moduleId: "input.receipt" },
      { id: "n2", moduleId: "validation.cashout", params: { threshold: 0 } },
    ]);
    const result = executeChain(chain, receipt);
    expect(result.cashOutDetected).toBe(true);
    expect(result.cashOutReason).toBe("explicit");
  });
});


describe("topologicalOrder", () => {
  it("should return nodes in order for a linear chain", () => {
    const nodes: ChainNode[] = [
      { id: "a", moduleId: "input.receipt", params: {} },
      { id: "b", moduleId: "validation.categorize", params: {} },
      { id: "c", moduleId: "output.expenseMap", params: {} },
    ];
    const edges: ChainEdge[] = [
      { source: "a", target: "b" },
      { source: "b", target: "c" },
    ];
    const order = topologicalOrder(nodes, edges);
    expect(order.map((n) => n.id)).toEqual(["a", "b", "c"]);
  });

  it("should handle parallel branches", () => {
    const nodes: ChainNode[] = [
      { id: "a", moduleId: "input.receipt", params: {} },
      { id: "b", moduleId: "validation.categorize", params: {} },
      { id: "c", moduleId: "validation.policy", params: {} },
      { id: "d", moduleId: "output.expenseMap", params: {} },
    ];
    const edges: ChainEdge[] = [
      { source: "a", target: "b" },
      { source: "a", target: "c" },
      { source: "b", target: "d" },
      { source: "c", target: "d" },
    ];
    const order = topologicalOrder(nodes, edges);
    expect(order.map((n) => n.id)).toEqual(["a", "b", "c", "d"]);
  });

  it("should handle single node graph", () => {
    const nodes: ChainNode[] = [
      { id: "a", moduleId: "input.receipt", params: {} },
    ];
    const order = topologicalOrder(nodes, []);
    expect(order.map((n) => n.id)).toEqual(["a"]);
  });

  it("should handle empty graph", () => {
    const order = topologicalOrder([], []);
    expect(order).toEqual([]);
  });

  it("should handle diamond dependency", () => {
    const nodes: ChainNode[] = [
      { id: "a", moduleId: "input.receipt", params: {} },
      { id: "b", moduleId: "validation.categorize", params: {} },
      { id: "c", moduleId: "validation.policy", params: {} },
      { id: "d", moduleId: "output.expenseMap", params: {} },
    ];
    const edges: ChainEdge[] = [
      { source: "a", target: "b" },
      { source: "a", target: "c" },
      { source: "b", target: "d" },
      { source: "c", target: "d" },
    ];
    const order = topologicalOrder(nodes, edges);
    const idxA = order.findIndex((n) => n.id === "a");
    const idxB = order.findIndex((n) => n.id === "b");
    const idxC = order.findIndex((n) => n.id === "c");
    const idxD = order.findIndex((n) => n.id === "d");
    expect(idxA).toBeLessThan(idxB);
    expect(idxA).toBeLessThan(idxC);
    expect(idxB).toBeLessThan(idxD);
    expect(idxC).toBeLessThan(idxD);
  });
});


describe("buildResultSummary", () => {
  const receipt = makeReceipt();
  const result: PipelineResult = {
    byCategory: [{ category: "Food", total: 38.0, count: 3, itemIds: ["li-1", "li-2", "li-3"] }],
    totalExpenses: 38.0,
    totalItems: 3,
    cashOutDetected: false,
    cashOutReason: "none" as const,
    policyFlags: [],
    receiptId: "rcp-test-0001",
    complianceSummary: {
      totalRules: 0,
      passedRules: 0,
      failedRules: 0,
      score: 1,
      percentage: 100,
      threshold: 80,
      isCompliant: true,
      ruleChecks: [],
    },
    journalEntry: null,
  };

  const ctx: ExecutionContext = {
    receipt,
    flags: [],
    categorized: receipt.lineItems.map((li) => ({ ...li })),
    cashOut: false,
    cashOutAmount: 0,
    cashOutReason: "none" as const,
    byCategory: new Map(),
    totalExpenses: 38.0,
    cashOutChannel: false,
    normalChannel: true,
    ruleChecks: [],
    threshold: 80,
  };

  it("should summarize input.receipt", () => {
    const summary = buildResultSummary("input.receipt", ctx, result);
    expect(summary).toBe("Test Merchant · $100.00");
  });

  it("should summarize validation.cashout with no cash-out", () => {
    const summary = buildResultSummary("validation.cashout", ctx, result);
    expect(summary).toBe("No cash-out");
  });

  it("should summarize validation.cashout with cash-out", () => {
    const cashCtx = { ...ctx, cashOut: true, cashOutAmount: 60 };
    const summary = buildResultSummary("validation.cashout", cashCtx, result);
    expect(summary).toBe("Flag: $60.00 cash-out");
  });

  it("should summarize validation.categorize", () => {
    const summary = buildResultSummary("validation.categorize", ctx, result);
    expect(summary).toBe("3 items categorised");
  });

  it("should summarize validation.policy with no flags", () => {
    const summary = buildResultSummary("validation.policy", ctx, result);
    expect(summary).toBe("Compliant");
  });

  it("should summarize validation.policy with flags", () => {
    const flaggedCtx = { ...ctx, flags: [{ rule: "policy.meal", message: "x", severity: "warning" as const, receiptId: "r1" }] };
    const summary = buildResultSummary("validation.policy", flaggedCtx, result);
    expect(summary).toBe("1 flag");
  });

  it("should summarize validation.policy with multiple flags", () => {
    const flaggedCtx = {
      ...ctx,
      flags: [
        { rule: "policy.meal", message: "x", severity: "warning" as const, receiptId: "r1" },
        { rule: "policy.hotel", message: "y", severity: "warning" as const, receiptId: "r1" },
      ],
    };
    const summary = buildResultSummary("validation.policy", flaggedCtx, result);
    expect(summary).toBe("2 flags");
  });

  it("should summarize logic.ifthen for normal branch", () => {
    const summary = buildResultSummary("logic.ifthen", ctx, result);
    expect(summary).toBe("Branch: normal");
  });

  it("should summarize logic.ifthen for cash-out branch", () => {
    const cashCtx = { ...ctx, cashOutChannel: true, normalChannel: false };
    const summary = buildResultSummary("logic.ifthen", cashCtx, result);
    expect(summary).toBe("Branch: cash-out");
  });

  it("should summarize logic.loop", () => {
    const summary = buildResultSummary("logic.loop", ctx, result);
    expect(summary).toBe("Iterate × 3");
  });

  it("should summarize logic.aggregator", () => {
    const summary = buildResultSummary("logic.aggregator", ctx, result);
    expect(summary).toBe("1 categories");
  });

  it("should summarize output.expenseMap", () => {
    const summary = buildResultSummary("output.expenseMap", ctx, result);
    expect(summary).toBe("$38.00 total · 3 items");
  });

  it("should return dash for unknown module", () => {
    const summary = buildResultSummary("unknown.module", ctx, result);
    expect(summary).toBe("—");
  });

  it("should summarise validation.cashout with card_change reason", () => {
    const cashCtx: ExecutionContext = {
      ...ctx,
      cashOut: true,
      cashOutAmount: 20,
      cashOutReason: "card_change",
    };
    const summary = buildResultSummary("validation.cashout", cashCtx, result);
    expect(summary).toBe("Flag: $20.00 cash-out (card+change)");
  });
});


describe("getAccountName", () => {
  it("returns the human name for known expense account codes", () => {
    expect(getAccountName("6410")).toBe("Motor vehicle expenses");
    expect(getAccountName("6420")).toBe("Meal and entertainment expenses");
    expect(getAccountName("6440")).toBe("Accommodation expenses");
  });

  it("returns the liability name for accounts payable", () => {
    expect(getAccountName("2100")).toBe("Accounts payable");
  });

  it("returns the cash-out review name for code 6510", () => {
    expect(getAccountName("6510")).toBe("Cash drawings — cash-out review");
  });

  it("falls back to a generic label for unknown codes", () => {
    expect(getAccountName("9999")).toBe("Account 9999");
    expect(getAccountName("")).toBe("Account ");
  });
});
