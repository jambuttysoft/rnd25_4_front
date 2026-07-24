// ============================================================
// Experiment 2: RAG Relevance for Corporate Policies — Types
// ============================================================

export interface PolicyParagraph {
  id: string;
  documentName: string;
  sectionNumber: string;
  title: string;
  text: string;
  tags: string[];
}

export interface SearchQuery {
  id: string;
  naturalQuery: string;       // запрос на естественном языке от сотрудника
  relevantParagraphIds: string[];  // какие параграфы релевантны
  difficulty: 'easy' | 'medium' | 'hard';
  scenario: string;           // описание бизнес-сценария
}

export interface SearchResult {
  paragraphId: string;
  score: number;
  rank: number;
  method: 'vector' | 'keyword';
}

export interface QueryResult {
  queryId: string;
  naturalQuery: string;
  vectorResults: SearchResult[];
  keywordResults: SearchResult[];
  vectorHitRate: number;      // сколько релевантных нашлось в top-5
  keywordHitRate: number;     // сколько релевантных нашлось в top-5
  vectorPrecision: number;
  keywordPrecision: number;
}

export interface ExperimentMetrics {
  totalQueries: number;
  avgVectorHitRate: number;
  avgKeywordHitRate: number;
  avgVectorPrecision: number;
  avgKeywordPrecision: number;
  vectorWins: number;         // сколько раз vector лучше
  keywordWins: number;        // сколько раз keyword лучше
  vectorAvgLatencyMs: number;
  keywordAvgLatencyMs: number;
  difficultyBreakdown: {
    easy: { vector: number; keyword: number };
    medium: { vector: number; keyword: number };
    hard: { vector: number; keyword: number };
  };
}
