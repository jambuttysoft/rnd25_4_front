import { describe, it, expect } from "vitest";
import {
  formatAUD,
  formatNumber,
  formatInteger,
  formatPercent,
  formatPercentRaw,
  formatDateAU,
  formatDateStringAU,
  formatTimeAU,
  formatLatency,
  formatThroughput,
  formatDelta,
  AU,
} from "../utils/format";


describe("formatAUD", () => {
  it("should format positive value as $XX.XX", () => {
    expect(formatAUD(42.5)).toBe("$42.50");
  });

  it("should format zero", () => {
    expect(formatAUD(0)).toBe("$0.00");
  });

  it("should format negative value with minus sign", () => {
    expect(formatAUD(-15.3)).toBe("−$15.30");
  });

  it("should format with signed option (positive)", () => {
    expect(formatAUD(25, { signed: true })).toBe("+$25.00");
  });

  it("should format with signed option (negative)", () => {
    expect(formatAUD(-25, { signed: true })).toBe("−$25.00");
  });

  it("should format with signed option (zero)", () => {
    expect(formatAUD(0, { signed: true })).toBe("$0.00");
  });

  it("should return dash for NaN", () => {
    expect(formatAUD(NaN)).toBe("—");
  });

  it("should return dash for Infinity", () => {
    expect(formatAUD(Infinity)).toBe("—");
  });

  it("should return dash for -Infinity", () => {
    expect(formatAUD(-Infinity)).toBe("—");
  });

  it("should format large values", () => {
    expect(formatAUD(1234567.89)).toBe("$1,234,567.89");
  });
});


describe("formatNumber", () => {
  it("should format with default 2 fraction digits", () => {
    expect(formatNumber(42.567)).toBe("42.57");
  });

  it("should format with 0 fraction digits", () => {
    expect(formatNumber(42.567, 0)).toBe("43");
  });

  it("should format with 3 fraction digits", () => {
    expect(formatNumber(42.5, 3)).toBe("42.500");
  });

  it("should return dash for NaN", () => {
    expect(formatNumber(NaN)).toBe("—");
  });

  it("should return dash for Infinity", () => {
    expect(formatNumber(Infinity)).toBe("—");
  });
});


describe("formatInteger", () => {
  it("should format integer", () => {
    expect(formatInteger(42)).toBe("42");
  });

  it("should round to integer", () => {
    expect(formatInteger(42.7)).toBe("43");
  });

  it("should return dash for NaN", () => {
    expect(formatInteger(NaN)).toBe("—");
  });
});


describe("formatPercent", () => {
  it("should format 0.85 as 85%", () => {
    expect(formatPercent(0.85)).toBe("85%");
  });

  it("should format 1.0 as 100%", () => {
    expect(formatPercent(1.0)).toBe("100%");
  });

  it("should format with fraction digits using comma separator", () => {
    expect(formatPercent(0.853, 1)).toBe("85,3%");
  });

  it("should format 0 as 0%", () => {
    expect(formatPercent(0)).toBe("0%");
  });

  it("should return dash for NaN", () => {
    expect(formatPercent(NaN)).toBe("—");
  });
});


describe("formatPercentRaw", () => {
  it("should format 85.3 as 85.3%", () => {
    expect(formatPercentRaw(85.3)).toBe("85.3%");
  });

  it("should format with custom fraction digits", () => {
    expect(formatPercentRaw(85.34, 2)).toBe("85.34%");
  });

  it("should return dash for NaN", () => {
    expect(formatPercentRaw(NaN)).toBe("—");
  });
});


describe("formatDateAU", () => {
  it("should format date in DD/MM/YYYY", () => {
    const date = new Date(2026, 6, 22);
    const result = formatDateAU(date);
    expect(result).toBe("22/07/2026");
  });
});


describe("formatDateStringAU", () => {
  it("should format ISO string", () => {
    const result = formatDateStringAU("2026-07-22T14:30:00Z");
    expect(result).toMatch(/22\/07\/2026/);
  });

  it("should return original string for invalid date", () => {
    expect(formatDateStringAU("not-a-date")).toBe("not-a-date");
  });
});


describe("formatTimeAU", () => {
  it("should format time in HH:MM:SS", () => {
    const date = new Date(2026, 6, 22, 14, 30, 45);
    const result = formatTimeAU(date);
    expect(result).toBe("14:30:45");
  });
});


describe("formatLatency", () => {
  it("should format sub-millisecond", () => {
    const result = formatLatency(0.5);
    expect(result).toContain("0.50");
    expect(result).toContain("ms");
  });

  it("should format 5-10ms with one decimal", () => {
    const result = formatLatency(5.67);
    expect(result).toContain("5.7");
    expect(result).toContain("ms");
  });

  it("should format 10ms+ as rounded integer", () => {
    const result = formatLatency(42.7);
    expect(result).toContain("43");
    expect(result).toContain("ms");
  });

  it("should return dash for NaN", () => {
    expect(formatLatency(NaN)).toBe("—");
  });
});


describe("formatThroughput", () => {
  it("should format throughput", () => {
    const result = formatThroughput(42.56);
    expect(result).toContain("42.56");
    expect(result).toContain("t/s");
  });

  it("should return dash for NaN", () => {
    expect(formatThroughput(NaN)).toBe("—");
  });
});


describe("formatDelta", () => {
  it("should format positive delta", () => {
    const result = formatDelta(105, 100);
    expect(result).toContain("+");
    expect(result).toContain("5.00");
  });

  it("should format negative delta", () => {
    const result = formatDelta(95, 100);
    expect(result).toContain("−");
    expect(result).toContain("5.00");
  });

  it("should format zero delta", () => {
    const result = formatDelta(100, 100);
    expect(result).toContain("0.00");
  });

  it("should return dash for NaN", () => {
    expect(formatDelta(NaN, 100)).toBe("—");
  });
});


describe("AU convenience object", () => {
  it("should expose all formatters", () => {
    expect(typeof AU.currency).toBe("function");
    expect(typeof AU.number).toBe("function");
    expect(typeof AU.integer).toBe("function");
    expect(typeof AU.percent).toBe("function");
    expect(typeof AU.percentRaw).toBe("function");
    expect(typeof AU.date).toBe("function");
    expect(typeof AU.dateString).toBe("function");
    expect(typeof AU.time).toBe("function");
    expect(typeof AU.latency).toBe("function");
    expect(typeof AU.throughput).toBe("function");
    expect(typeof AU.delta).toBe("function");
  });

  it("AU.currency should match formatAUD", () => {
    expect(AU.currency(42.5)).toBe("$42.50");
  });

  it("AU.percent should match formatPercent", () => {
    expect(AU.percent(0.85)).toBe("85%");
  });
});
