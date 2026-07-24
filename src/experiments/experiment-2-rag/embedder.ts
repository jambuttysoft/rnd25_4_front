// ============================================================
// Experiment 2: RAG Relevance for Corporate Policies — Embedder
// ============================================================

import type { PolicyParagraph, SearchResult } from './types.js';

const SYNONYM_MAP: Record<string, string[]> = {
  'командировка': ['поездка', 'бизнес-трип', 'отъезд', 'выезд'],
  'отель': ['гостиница', 'проживание', 'размещение'],
  'самолет': ['авиабилет', 'перелет', 'авиаперевозка'],
  'еда': ['питание', 'обед', 'бизнес-ланч', 'ресторан'],
  'деньги': ['средства', 'финансирование', 'бюджет', 'компенсация'],
  'документ': ['отчет', 'квитанция', 'чек', 'счет'],
  'машина': ['автомобиль', 'транспорт', 'такси'],
  'покупка': ['приобретение', 'закупка', 'расход'],
  'работа': ['задача', 'проект', 'задание'],
  'руководитель': ['начальник', 'директор', 'менеджер'],
};

function buildSynonymLookup(): Map<string, string> {
  const lookup = new Map<string, string>();
  for (const [root, synonyms] of Object.entries(SYNONYM_MAP)) {
    lookup.set(root, root);
    for (const s of synonyms) {
      lookup.set(s, root);
    }
  }
  return lookup;
}

const SYNONYM_LOOKUP = buildSynonymLookup();

const RUSSIAN_STOP_WORDS = new Set([
  'и', 'в', 'во', 'не', 'что', 'он', 'на', 'я', 'с', 'со', 'как', 'а', 'то', 'все', 'она',
  'так', 'но', 'его', 'по', 'из', 'у', 'же', 'за', 'бы', 'от', 'до', 'это', 'или', 'мы',
  'к', 'вы', 'да', 'ни', 'них', 'быть', 'есть', 'был', 'была', 'были', 'для', 'под', 'над',
  'без', 'при', 'очень', 'еще', 'её', 'меня', 'нам', 'вас', 'вам', 'о', 'об', 'тот', 'том',
  'может', 'могут', 'можно', 'если', 'только', 'когда', 'один', 'кто', 'себя', 'тут', 'там',
  'теперь', 'даже', 'нет', 'этот', 'эта', 'эти', 'этого', 'этом', 'также', 'будет', 'чем',
]);

function stemWord(word: string): string {
  if (word.length < 4) return word;
  let s = word.toLowerCase();

  const suffixes = [
    'тельствами', 'тельством', 'тельствах', 'тельству', 'тельства', 'тельство',
    'естей', 'остей', 'естям', 'остям', 'естях', 'остях', 'есть', 'ость',
    'ениями', 'аниями', 'ением', 'анием', 'ениях', 'аниях', 'ение', 'ание', 'ения', 'ения',
    'иями', 'ией', 'иях', 'ию', 'ия', 'ие',
    'ыми', 'ого', 'ему', 'ыми', 'ыми', 'ому', 'его', 'ых', 'ий', 'ый', 'ой',
    'ами', 'ами', 'ем', 'ом', 'ах', 'ях', 'ам', 'ям', 'ов', 'ев', 'ей',
    'а', 'я', 'ы', 'и', 'у', 'ю', 'е', 'о', 'ь', 'ъ',
  ];

  for (const suffix of suffixes) {
    if (s.endsWith(suffix) && s.length - suffix.length >= 3) {
      s = s.slice(0, s.length - suffix.length);
      break;
    }
  }

  return s;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^а-яёa-z0-9\-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !RUSSIAN_STOP_WORDS.has(w));
}

function tokenizeWithStemming(text: string): string[] {
  return tokenize(text).map(stemWord);
}

class KeywordSearch {
  private docTokens: Map<string, string[]>;
  private idfCache: Map<string, number>;

  constructor(private corpus: PolicyParagraph[]) {
    this.docTokens = new Map();
    this.idfCache = new Map();
    this.buildIndex();
  }

  private buildIndex(): void {
    for (const doc of this.corpus) {
      this.docTokens.set(doc.id, tokenize(doc.text));
    }

    const N = this.corpus.length;
    const allTokens = new Set<string>();
    for (const tokens of this.docTokens.values()) {
      for (const t of tokens) {
        allTokens.add(t);
      }
    }

    for (const t of allTokens) {
      let df = 0;
      for (const tokens of this.docTokens.values()) {
        if (tokens.includes(t)) df++;
      }
      this.idfCache.set(t, Math.log((N + 1) / (df + 1)) + 1);
    }
  }

  private computeScore(queryTokens: string[], docId: string): number {
    const docTokens = this.docTokens.get(docId);
    if (!docTokens || docTokens.length === 0) return 0;

    const tfMap = new Map<string, number>();
    for (const t of docTokens) {
      tfMap.set(t, (tfMap.get(t) || 0) + 1);
    }

    let score = 0;
    const docLen = docTokens.length;
    for (const qt of queryTokens) {
      if (tfMap.has(qt)) {
        const tf = tfMap.get(qt)! / docLen;
        const idf = this.idfCache.get(qt) || 1;
        score += tf * idf;
      }
    }
    return score;
  }

  search(query: string, topK: number = 5): SearchResult[] {
    const queryTokens = tokenize(query);
    const results: { paragraphId: string; score: number }[] = [];

    for (const doc of this.corpus) {
      const score = this.computeScore(queryTokens, doc.id);
      if (score > 0) {
        results.push({ paragraphId: doc.id, score });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK).map((r, i) => ({
      paragraphId: r.paragraphId,
      score: r.score,
      rank: i + 1,
      method: 'keyword' as const,
    }));
  }
}

class VectorSearch {
  private docVectors: Map<string, number[]>;
  private vocabulary: string[];
  private idf: number[];
  private docTokens: Map<string, string[]>;

  constructor(private corpus: PolicyParagraph[]) {
    this.docTokens = new Map();
    this.docVectors = new Map();
    this.vocabulary = [];
    this.idf = [];
    this.buildIndex();
  }

  private buildIndex(): void {
    for (const doc of this.corpus) {
      this.docTokens.set(doc.id, tokenizeWithStemming(doc.text));
    }

    const tokenSet = new Set<string>();
    for (const tokens of this.docTokens.values()) {
      for (const t of tokens) tokenSet.add(t);
    }
    this.vocabulary = [...tokenSet].sort();

    const N = this.corpus.length;
    this.idf = this.vocabulary.map(term => {
      let df = 0;
      for (const tokens of this.docTokens.values()) {
        if (tokens.includes(term)) df++;
      }
      return Math.log((N + 1) / (df + 1)) + 1;
    });

    for (const doc of this.corpus) {
      const tokens = this.docTokens.get(doc.id)!;
      const tf = new Array(this.vocabulary.length).fill(0);
      const totalTerms = tokens.length || 1;

      for (const t of tokens) {
        const idx = this.vocabulary.indexOf(t);
        if (idx >= 0) tf[idx]++;
      }

      const vector = tf.map((f, i) => (f / totalTerms) * this.idf[i]);
      this.docVectors.set(doc.id, vector);
    }
  }

  private computeQueryVector(query: string): number[] {
    const tokens = tokenizeWithStemming(query);
    const tf = new Array(this.vocabulary.length).fill(0);
    const totalTerms = tokens.length || 1;

    for (const t of tokens) {
      const idx = this.vocabulary.indexOf(t);
      if (idx >= 0) tf[idx]++;
    }

    return tf.map((f, i) => (f / totalTerms) * this.idf[i]);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private computeSynonymBonus(query: string, docText: string): number {
    const queryTokens = tokenize(query);
    const docTokens = tokenize(docText);

    let bonus = 0;
    for (const qt of queryTokens) {
      const root = SYNONYM_LOOKUP.get(qt);
      if (!root) continue;
      const synonyms = SYNONYM_MAP[root];
      if (!synonyms) continue;

      for (const dt of docTokens) {
        const docRoot = SYNONYM_LOOKUP.get(dt);
        if (docRoot === root && qt !== dt) {
          bonus += 0.15;
        }
      }
    }

    const allSynSet = new Set([
      ...Object.keys(SYNONYM_MAP),
      ...Object.values(SYNONYM_MAP).flat(),
    ]);

    let querySynCount = 0;
    for (const qt of queryTokens) {
      if (allSynSet.has(qt)) querySynCount++;
    }
    if (querySynCount >= 2) {
      let docSynCount = 0;
      for (const dt of docTokens) {
        if (allSynSet.has(dt)) docSynCount++;
      }
      if (docSynCount >= 2) {
        bonus += 0.1;
      }
    }

    return Math.min(bonus, 0.5);
  }

  search(query: string, topK: number = 5): SearchResult[] {
    const queryVec = this.computeQueryVector(query);
    const results: { paragraphId: string; score: number }[] = [];

    for (const doc of this.corpus) {
      const docVec = this.docVectors.get(doc.id)!;
      let score = this.cosineSimilarity(queryVec, docVec);
      score += this.computeSynonymBonus(query, doc.text);

      if (score > 0) {
        results.push({ paragraphId: doc.id, score });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK).map((r, i) => ({
      paragraphId: r.paragraphId,
      score: r.score,
      rank: i + 1,
      method: 'vector' as const,
    }));
  }
}

export function createKeywordSearch(corpus: PolicyParagraph[]): KeywordSearch {
  return new KeywordSearch(corpus);
}

export function createVectorSearch(corpus: PolicyParagraph[]): VectorSearch {
  return new VectorSearch(corpus);
}
