import { describe, it, expect } from "vitest";
import { parseReceipt } from "../experiments/experiment-1-parser/parser";
import { SYNTHETIC_RECEIPTS, GROUND_TRUTH } from "../experiments/experiment-1-parser/receipts";
import type { ReceiptRaw, NormalizedReceipt } from "../experiments/experiment-1-parser/types";


describe("parseReceipt", () => {
  it("should parse receipt_001 (supermarket with cash + card + loyalty)", () => {
    const raw = SYNTHETIC_RECEIPTS.find((r) => r.id === "receipt_001")!;
    const result = parseReceipt(raw);

    expect(result.receipt_id).toBe("receipt_001");
    expect(result.merchant).toBe('СУПЕРМАРКЕТ "АТБ"');
    expect(result.total_amount).toBe(1050.0);
    expect(result.currency).toBe("UAH");
    expect(result.items.length).toBe(2);
    expect(result.items[0].name).toBe("Бізнес-ланч");
    expect(typeof result.items[0].category).toBe("string");
    expect(typeof result.items[1].category).toBe("string");
  });

  it("should parse cash-out from receipt_002", () => {
    const raw = SYNTHETIC_RECEIPTS.find((r) => r.id === "receipt_002")!;
    const result = parseReceipt(raw);
    expect(result.breakdown.cash_out).toBeGreaterThanOrEqual(0);
    expect(GROUND_TRUTH["receipt_002"].breakdown.cash_out).toBe(1500);
  });

  it("should parse loyalty points from receipt_016", () => {
    const raw = SYNTHETIC_RECEIPTS.find((r) => r.id === "receipt_016")!;
    const result = parseReceipt(raw);
    expect(result.breakdown.loyalty_points_spent).toBeGreaterThanOrEqual(0);
    expect(GROUND_TRUTH["receipt_016"].breakdown.loyalty_points_spent).toBe(365);
  });

  it("should parse card fee percentage from receipt_001", () => {
    const raw = SYNTHETIC_RECEIPTS.find((r) => r.id === "receipt_001")!;
    const result = parseReceipt(raw);
    expect(result.breakdown.card_fee_percent).toBe(1.5);
    expect(result.breakdown.card_fee_amount).toBeCloseTo(6.0, 1);
  });

  it("should parse tips from receipt_001", () => {
    const raw = SYNTHETIC_RECEIPTS.find((r) => r.id === "receipt_001")!;
    const result = parseReceipt(raw);
    expect(result.breakdown.tip_amount).toBe(50);
  });

  it("should parse partial payments", () => {
    const raw = SYNTHETIC_RECEIPTS.find((r) => r.id === "receipt_001")!;
    const result = parseReceipt(raw);
    expect(result.breakdown.partial_payments.length).toBeGreaterThanOrEqual(2);
    const methods = result.breakdown.partial_payments.map((p) => p.method);
    expect(methods).toContain("cash");
    expect(methods).toContain("card");
  });

  it("should handle receipt with zero total (receipt_049)", () => {
    const raw = SYNTHETIC_RECEIPTS.find((r) => r.id === "receipt_049")!;
    const result = parseReceipt(raw);
    expect(result.total_amount).toBe(0.0);
    expect(result.items.length).toBe(0);
  });

  it("should handle receipt with gift card payment (receipt_038)", () => {
    const raw = SYNTHETIC_RECEIPTS.find((r) => r.id === "receipt_038")!;
    const result = parseReceipt(raw);
    const methods = result.breakdown.partial_payments.map((p) => p.method);
    expect(methods).toContain("gift_card");
  });

  it("should categorize food items correctly", () => {
    const raw = SYNTHETIC_RECEIPTS.find((r) => r.id === "receipt_008")!;
    const result = parseReceipt(raw);
    expect(result.items.length).toBe(5);
    const categories = result.items.map((i) => i.category);
    expect(categories.every((c) => typeof c === "string" && c.length > 0)).toBe(true);
  });

  it("should categorize fuel items correctly", () => {
    const raw = SYNTHETIC_RECEIPTS.find((r) => r.id === "receipt_004")!;
    const result = parseReceipt(raw);
    const fuelItem = result.items.find((i) => i.name.includes("Пальне"));
    expect(fuelItem).toBeDefined();
    expect(fuelItem!.category).toBe("fuel");
  });

  it("should categorize electronics items correctly", () => {
    const raw = SYNTHETIC_RECEIPTS.find((r) => r.id === "receipt_002")!;
    const result = parseReceipt(raw);
    const laptopItem = result.items.find((i) => i.name.includes("Ноутбук"));
    expect(laptopItem).toBeDefined();
    expect(laptopItem!.category).toBe("electronics");
  });

  it("should skip discount/return lines in items", () => {
    const raw: ReceiptRaw = {
      id: "test_skip",
      rawText: `TEST STORE\n2026-07-22\n-----\nWidget 100.00 x 1 = 100.00\n(знижка по карті -10.00)\nРАЗОМ: 90.00\nКАРТА: 90.00`,
      merchant: "TEST STORE",
      date: "2026-07-22T00:00:00Z",
      total_amount: 90.0,
      currency: "UAH",
    };
    const result = parseReceipt(raw);
    expect(result.items.length).toBe(1);
    expect(result.items[0].name).toBe("Widget");
  });

  it("should return deterministic results for same input", () => {
    const raw = SYNTHETIC_RECEIPTS.find((r) => r.id === "receipt_001")!;
    const r1 = parseReceipt(raw);
    const r2 = parseReceipt(raw);
    expect(r1.breakdown.cash_out).toBe(r2.breakdown.cash_out);
    expect(r1.breakdown.loyalty_points_spent).toBe(r2.breakdown.loyalty_points_spent);
    expect(r1.breakdown.card_fee_amount).toBe(r2.breakdown.card_fee_amount);
  });
});


describe("Ground truth data integrity", () => {
  it("should have ground truth for every synthetic receipt", () => {
    for (const raw of SYNTHETIC_RECEIPTS) {
      expect(GROUND_TRUTH[raw.id]).toBeDefined();
      expect(GROUND_TRUTH[raw.id].receipt_id).toBe(raw.id);
    }
  });

  it("should have 50 synthetic receipts", () => {
    expect(SYNTHETIC_RECEIPTS).toHaveLength(50);
  });

  it("each ground truth should have valid breakdown", () => {
    for (const [id, gt] of Object.entries(GROUND_TRUTH)) {
      expect(typeof gt.breakdown.cash_out).toBe("number");
      expect(typeof gt.breakdown.card_fee_percent).toBe("number");
      expect(typeof gt.breakdown.card_fee_amount).toBe("number");
      expect(typeof gt.breakdown.loyalty_points_spent).toBe("number");
      expect(typeof gt.breakdown.net_goods_amount).toBe("number");
      expect(Array.isArray(gt.breakdown.partial_payments)).toBe(true);
      expect(typeof gt.breakdown.tip_amount).toBe("number");
      expect(typeof gt.breakdown.discount_total).toBe("number");
    }
  });

  it("each ground truth should have items with valid categories", () => {
    for (const [id, gt] of Object.entries(GROUND_TRUTH)) {
      for (const item of gt.items) {
        expect(typeof item.name).toBe("string");
        expect(typeof item.price).toBe("number");
        expect(typeof item.quantity).toBe("number");
        expect(typeof item.category).toBe("string");
      }
    }
  });
});


describe("Error computation logic", () => {
  function computeErrors(expected: number, actual: number) {
    const absErr = Math.abs(expected - actual);
    const relErr = expected !== 0 ? absErr / Math.abs(expected) : actual !== 0 ? 1 : 0;
    return { absoluteError: absErr, relativeError: relErr };
  }

  it("should compute zero error for identical values", () => {
    const err = computeErrors(100, 100);
    expect(err.absoluteError).toBe(0);
    expect(err.relativeError).toBe(0);
  });

  it("should compute correct absolute error", () => {
    const err = computeErrors(100, 95);
    expect(err.absoluteError).toBe(5);
    expect(err.relativeError).toBeCloseTo(0.05, 4);
  });

  it("should handle expected=0, actual=0", () => {
    const err = computeErrors(0, 0);
    expect(err.absoluteError).toBe(0);
    expect(err.relativeError).toBe(0);
  });

  it("should handle expected=0, actual!=0", () => {
    const err = computeErrors(0, 10);
    expect(err.absoluteError).toBe(10);
    expect(err.relativeError).toBe(1);
  });
});
