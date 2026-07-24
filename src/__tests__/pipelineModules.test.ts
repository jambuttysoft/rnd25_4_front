import { describe, it, expect } from "vitest";
import {
  inferCategory,
  pickReceiptTemplate,
  makeReceiptFromTemplate,
  MODULES,
  MODULE_LIST,
} from "../data/pipelineModules";
import type { ModuleId } from "../types/pipeline";


describe("inferCategory", () => {
  it("should infer Fuel category", () => {
    expect(inferCategory("Unleaded petrol 38.4L")).toBe("Fuel");
    expect(inferCategory("Diesel 50L")).toBe("Fuel");
    expect(inferCategory("Gasoline refill")).toBe("Fuel");
  });

  it("should infer Food category", () => {
    expect(inferCategory("Lunch set")).toBe("Food");
    expect(inferCategory("Coffee beans 250g")).toBe("Food");
    expect(inferCategory("Restaurant meal")).toBe("Food");
    expect(inferCategory("Cafe breakfast")).toBe("Food");
  });

  it("should infer Transport category", () => {
    expect(inferCategory("Airport taxi ride")).toBe("Transport");
    expect(inferCategory("Uber ride")).toBe("Transport");
    expect(inferCategory("Train ticket")).toBe("Transport");
    expect(inferCategory("Parking fee")).toBe("Transport");
    expect(inferCategory("Toll charge")).toBe("Transport");
  });

  it("should infer Accommodation category", () => {
    expect(inferCategory("Hotel room 2 nights")).toBe("Accommodation");
    expect(inferCategory("Motel stay")).toBe("Accommodation");
    expect(inferCategory("Airbnb rental")).toBe("Accommodation");
  });

  it("should infer Training category", () => {
    expect(inferCategory("React workshop")).toBe("Training");
    expect(inferCategory("Conference attendance")).toBe("Training");
    expect(inferCategory("Course materials")).toBe("Training");
  });

  it("should infer Equipment category", () => {
    expect(inferCategory("Laptop charger")).toBe("Equipment");
    expect(inferCategory("USB-C cable")).toBe("Equipment");
    expect(inferCategory("Monitor stand")).toBe("Equipment");
  });

  it("should infer Office category", () => {
    expect(inferCategory("A4 paper 5x500 sheets")).toBe("Office");
    expect(inferCategory("Stationery supplies")).toBe("Office");
  });

  it("should infer Other for unrecognized descriptions", () => {
    expect(inferCategory("Mystery purchase")).toBe("Other");
    expect(inferCategory("XYZ123")).toBe("Other");
  });

  it("should be case-insensitive", () => {
    expect(inferCategory("PETROL")).toBe("Fuel");
    expect(inferCategory("LUNCH")).toBe("Food");
    expect(inferCategory("TAXI")).toBe("Transport");
  });
});


describe("pickReceiptTemplate", () => {
  it("should return known template for ampol receipt", () => {
    const t = pickReceiptTemplate("ampol-receipt-2026-07-12.jpg");
    expect(t.merchant).toBe('Ampol Fuel & Go');
  });

  it("should return known template for cafe receipt", () => {
    const t = pickReceiptTemplate("cafe-lumiere-lunch.png");
    expect(t.merchant).toBe("Café Lumière");
  });

  it("should return known template for taxi receipt", () => {
    const t = pickReceiptTemplate("metro-taxi-jul15.png");
    expect(t.merchant).toBe("Metro Taxi Co.");
  });

  it("should return known template for hotel receipt", () => {
    const t = pickReceiptTemplate("grand-harbour-2nts.jpg");
    expect(t.merchant).toBe("Grand Harbour Hotel");
  });

  it("should return known template for techpro receipt", () => {
    const t = pickReceiptTemplate("techpro-workshop.png");
    expect(t.merchant).toBe("TechPro Training");
  });

  it("should return a template for unknown filenames", () => {
    const t = pickReceiptTemplate("unknown-receipt-xyz.jpg");
    expect(t).toBeDefined();
    expect(typeof t.merchant).toBe("string");
    expect(typeof t.lineItems).toBe("object");
    expect(Array.isArray(t.lineItems)).toBe(true);
  });

  it("should return a valid template with merchant and lineItems", () => {
    const t1 = pickReceiptTemplate("test-file.jpg");
    expect(typeof t1.merchant).toBe("string");
    expect(t1.lineItems.length).toBeGreaterThan(0);
  });
});


describe("makeReceiptFromTemplate", () => {
  it("should create receipt with correct structure", () => {
    const r = makeReceiptFromTemplate("ampol-receipt-2026-07-12.jpg", "rcp-0001");
    expect(r.id).toBe("rcp-0001");
    expect(r.filename).toBe("ampol-receipt-2026-07-12.jpg");
    expect(r.merchant).toBe("Ampol Fuel & Go");
    expect(r.date).toBe("2026-07-12");
    expect(r.lineItems.length).toBe(3);
    expect(r.cashOut).toBe(true);
    expect(r.loyaltyPointsSpent).toBe(320);
    expect(r.cardFeeAmount).toBe(1.62);
  });

  it("should compute total as subtotal + cardFee", () => {
    const r = makeReceiptFromTemplate("cafe-lumiere-lunch.png", "rcp-0002");
    expect(r.total).toBe(38.76);
  });

  it("should compute net goods amount excluding cash-out", () => {
    const r = makeReceiptFromTemplate("ampol-receipt-2026-07-12.jpg", "rcp-0003");
    expect(r.netGoodsAmount).toBeLessThan(r.total);
  });

  it("should set ocrStatus to pending initially", () => {
    const r = makeReceiptFromTemplate("test.jpg", "rcp-0004");
    expect(r.ocrStatus).toBe("pending");
  });

  it("should include imageDataUrl when provided", () => {
    const r = makeReceiptFromTemplate("test.jpg", "rcp-0005", "data:image/png;base64,abc123");
    expect(r.imageDataUrl).toBe("data:image/png;base64,abc123");
  });

  it("should set line item IDs correctly", () => {
    const r = makeReceiptFromTemplate("cafe-lumiere-lunch.png", "rcp-0006");
    r.lineItems.forEach((li, i) => {
      expect(li.id).toBe(`rcp-0006-li-${i}`);
    });
  });

  it("should assign categories to line items", () => {
    const r = makeReceiptFromTemplate("ampol-receipt-2026-07-12.jpg", "rcp-0007");
    const categories = r.lineItems.map((li) => li.category);
    expect(categories).toContain("Fuel");
    expect(categories).toContain("Food");
  });
});


describe("MODULES", () => {
  it("should have all 8 module types", () => {
    const expectedIds: ModuleId[] = [
      "input.receipt",
      "validation.cashout",
      "validation.categorize",
      "validation.policy",
      "logic.ifthen",
      "logic.loop",
      "logic.aggregator",
      "output.expenseMap",
    ];
    for (const id of expectedIds) {
      expect(MODULES[id]).toBeDefined();
      expect(MODULES[id].id).toBe(id);
    }
  });

  it("should have MODULE_LIST with 8 entries", () => {
    expect(MODULE_LIST).toHaveLength(8);
  });

  it("each module should have required fields", () => {
    for (const mod of MODULE_LIST) {
      expect(typeof mod.id).toBe("string");
      expect(typeof mod.label).toBe("string");
      expect(typeof mod.shortLabel).toBe("string");
      expect(typeof mod.description).toBe("string");
      expect(typeof mod.inputs).toBe("number");
      expect(typeof mod.outputs).toBe("number");
      expect(Array.isArray(mod.paramSchema)).toBe(true);
      expect(typeof mod.defaultParams).toBe("object");
    }
  });

  it("input module should have 0 inputs", () => {
    expect(MODULES["input.receipt"].inputs).toBe(0);
  });

  it("output module should have 0 outputs", () => {
    expect(MODULES["output.expenseMap"].outputs).toBe(0);
  });
});
