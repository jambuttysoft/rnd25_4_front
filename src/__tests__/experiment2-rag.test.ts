import { describe, it, expect } from "vitest";
import { createKeywordSearch, createVectorSearch } from "../experiments/experiment-2-rag/embedder";
import { POLICY_CORPUS } from "../experiments/experiment-2-rag/corpus";
import type { PolicyParagraph, SearchResult } from "../experiments/experiment-2-rag/types";


describe("Policy corpus", () => {
  it("should have paragraphs", () => {
    expect(POLICY_CORPUS.length).toBeGreaterThan(20);
  });

  it("each paragraph should have required fields", () => {
    for (const p of POLICY_CORPUS) {
      expect(typeof p.id).toBe("string");
      expect(typeof p.documentName).toBe("string");
      expect(typeof p.sectionNumber).toBe("string");
      expect(typeof p.title).toBe("string");
      expect(typeof p.text).toBe("string");
      expect(Array.isArray(p.tags)).toBe(true);
      expect(p.text.length).toBeGreaterThan(50);
    }
  });

  it("should have unique paragraph IDs", () => {
    const ids = POLICY_CORPUS.map((p) => p.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});


describe("KeywordSearch", () => {
  const engine = createKeywordSearch(POLICY_CORPUS);

  it("should return results for a relevant query", () => {
    const results = engine.search("отель лимит проживание");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].paragraphId).toBeDefined();
    expect(results[0].score).toBeGreaterThan(0);
  });

  it("should rank relevant paragraphs higher", () => {
    const results = engine.search("суточные командировка отель лимит");
    const topIds = results.slice(0, 3).map((r) => r.paragraphId);
    // TP-1 discusses daily allowances and hotel limits
    expect(topIds).toContain("TP-1");
  });

  it("should return results with correct structure", () => {
    const results = engine.search("корпоративная карта");
    for (const r of results) {
      expect(typeof r.paragraphId).toBe("string");
      expect(typeof r.score).toBe("number");
      expect(typeof r.rank).toBe("number");
      expect(r.method).toBe("keyword");
    }
  });

  it("should respect topK parameter", () => {
    const results = engine.search("расходы отчет документ", 3);
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it("should return empty results for gibberish query", () => {
    const results = engine.search("zzzxxxyyy123");
    expect(results).toHaveLength(0);
  });

  it("should find training/conference related paragraphs", () => {
    const results = engine.search("конференция обучение возмещение");
    expect(results.length).toBeGreaterThan(0);
    const topIds = results.slice(0, 3).map((r) => r.paragraphId);
    expect(topIds.some((id) => id.startsWith("TR"))).toBe(true);
  });

  it("should rank results by score descending", () => {
    const results = engine.search("корпоративные средства отчет");
    for (let i = 1; i < results.length; i++) {
      expect(results[i].score).toBeLessThanOrEqual(results[i - 1].score);
    }
  });
});


describe("VectorSearch", () => {
  const engine = createVectorSearch(POLICY_CORPUS);

  it("should return results for a relevant query", () => {
    const results = engine.search("отель лимит проживание");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].score).toBeGreaterThan(0);
  });

  it("should rank relevant paragraphs higher", () => {
    const results = engine.search("суточные командировка отель лимит");
    const topIds = results.slice(0, 3).map((r) => r.paragraphId);
    expect(topIds).toContain("TP-1");
  });

  it("should return results with correct structure", () => {
    const results = engine.search("корпоративная карта");
    for (const r of results) {
      expect(typeof r.paragraphId).toBe("string");
      expect(typeof r.score).toBe("number");
      expect(typeof r.rank).toBe("number");
      expect(r.method).toBe("vector");
    }
  });

  it("should respect topK parameter", () => {
    const results = engine.search("расходы отчет документ", 3);
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it("should find results for synonym queries (vector advantage)", () => {
    const results = engine.search("поездка компенсация расходы");
    expect(results.length).toBeGreaterThan(0);
    const topIds = results.slice(0, 5).map((r) => r.paragraphId);
    expect(topIds.some((id) => id.startsWith("TP") || id.startsWith("FB"))).toBe(true);
  });

  it("should handle empty corpus gracefully", () => {
    const emptyEngine = createVectorSearch([]);
    const results = emptyEngine.search("test query");
    expect(results).toHaveLength(0);
  });

  it("should rank results by score descending", () => {
    const results = engine.search("корпоративные средства отчет");
    for (let i = 1; i < results.length; i++) {
      expect(results[i].score).toBeLessThanOrEqual(results[i - 1].score);
    }
  });
});


describe("Vector vs Keyword search comparison", () => {
  const keywordEngine = createKeywordSearch(POLICY_CORPUS);
  const vectorEngine = createVectorSearch(POLICY_CORPUS);

  it("should both find results for direct term queries", () => {
    const kwResults = keywordEngine.search("отель лимит");
    const vecResults = vectorEngine.search("отель лимит");
    expect(kwResults.length).toBeGreaterThan(0);
    expect(vecResults.length).toBeGreaterThan(0);
  });

  it("vector search should handle synonym queries better", () => {
    const kwResults = keywordEngine.search("поездка компенсация расходы");
    const vecResults = vectorEngine.search("поездка компенсация расходы");
    expect(vecResults.length).toBeGreaterThanOrEqual(kwResults.length);
  });

  it("should return different method tags", () => {
    const kwResults = keywordEngine.search("документ отчет");
    const vecResults = vectorEngine.search("документ отчет");
    expect(kwResults[0]?.method).toBe("keyword");
    expect(vecResults[0]?.method).toBe("vector");
  });
});


describe("Search edge cases", () => {
  const keywordEngine = createKeywordSearch(POLICY_CORPUS);
  const vectorEngine = createVectorSearch(POLICY_CORPUS);

  it("should handle very short query", () => {
    const kwResults = keywordEngine.search("а");
    const vecResults = vectorEngine.search("а");
    expect(Array.isArray(kwResults)).toBe(true);
    expect(Array.isArray(vecResults)).toBe(true);
  });

  it("should handle query with only stop words", () => {
    const kwResults = keywordEngine.search("и в не что он на я");
    const vecResults = vectorEngine.search("и в не что он на я");
    expect(Array.isArray(kwResults)).toBe(true);
    expect(Array.isArray(vecResults)).toBe(true);
  });

  it("should handle numeric-only query", () => {
    const kwResults = keywordEngine.search("50000 рублей");
    expect(Array.isArray(kwResults)).toBe(true);
  });
});
