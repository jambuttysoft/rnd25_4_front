export type Difficulty = "easy" | "medium" | "hard";

export interface QueryResult {
  id: string;
  difficulty: Difficulty;
  query: string;
  scenario: string;
  vectorHitRate: number;
  keywordHitRate: number;
  winner: "vector" | "keyword" | "tie";
}

export interface RagExperimentData {
  title: string;
  subtitle: string;
  description: string;
  corpus: {
    documents: number;
    paragraphs: number;
  };
  totals: {
    queries: number;
    easy: number;
    medium: number;
    hard: number;
  };
  aggregate: {
    vectorHitRate: number;
    keywordHitRate: number;
    vectorPrecision: number;
    keywordPrecision: number;
    vectorWins: number;
    keywordWins: number;
    ties: number;
  };
  difficultyBreakdown: {
    easy: { vector: number; keyword: number };
    medium: { vector: number; keyword: number };
    hard: { vector: number; keyword: number };
  };
  latency: {
    vectorMs: number;
    keywordMs: number;
  };
  queries: QueryResult[];
  generatedAt: string;
}

export const ragData: RagExperimentData = {
  title: "RAG Relevance",
  subtitle: "Experiment 02",
  description:
    "Vector search (TF-IDF with synonym expansion) versus keyword search across 16 corporate policy documents. Each query is evaluated by hit rate in the top-5 results against a curated ground truth.",
  corpus: {
    documents: 16,
    paragraphs: 44,
  },
  totals: {
    queries: 20,
    easy: 6,
    medium: 8,
    hard: 6,
  },
  aggregate: {
    vectorHitRate: 0.75,
    keywordHitRate: 0.6,
    vectorPrecision: 0.22,
    keywordPrecision: 0.17,
    vectorWins: 6,
    keywordWins: 1,
    ties: 13,
  },
  difficultyBreakdown: {
    easy: { vector: 0.833, keyword: 0.667 },
    medium: { vector: 0.8125, keyword: 0.625 },
    hard: { vector: 0.583, keyword: 0.5 },
  },
  latency: {
    vectorMs: 0.84,
    keywordMs: 0.15,
  },
  queries: [
    {
      id: "Q01",
      difficulty: "easy",
      query: "Can I buy a laptop while on a business trip?",
      scenario: "Employee needs equipment while travelling",
      vectorHitRate: 0.0,
      keywordHitRate: 0.0,
      winner: "tie",
    },
    {
      id: "Q02",
      difficulty: "easy",
      query: "What is the hotel limit in Moscow?",
      scenario: "Planning a domestic business trip",
      vectorHitRate: 1.0,
      keywordHitRate: 1.0,
      winner: "tie",
    },
    {
      id: "Q03",
      difficulty: "easy",
      query: "How much is the per diem for a Russia trip?",
      scenario: "Clarifying daily allowance",
      vectorHitRate: 1.0,
      keywordHitRate: 1.0,
      winner: "tie",
    },
    {
      id: "Q04",
      difficulty: "easy",
      query: "How to file an expense report after a trip?",
      scenario: "Post-trip reimbursement",
      vectorHitRate: 1.0,
      keywordHitRate: 1.0,
      winner: "tie",
    },
    {
      id: "Q05",
      difficulty: "easy",
      query: "What documents are required for training reimbursement?",
      scenario: "Compensation for completed training",
      vectorHitRate: 1.0,
      keywordHitRate: 1.0,
      winner: "tie",
    },
    {
      id: "Q06",
      difficulty: "easy",
      query: "Can I use the corporate card for online store purchases?",
      scenario: "Online shopping via corporate card",
      vectorHitRate: 1.0,
      keywordHitRate: 0.0,
      winner: "vector",
    },
    {
      id: "Q07",
      difficulty: "medium",
      query: "Flew to Berlin for a conference, spent EUR 2 000 on tickets — what gets reimbursed?",
      scenario: "International conference attendance",
      vectorHitRate: 1.0,
      keywordHitRate: 1.0,
      winner: "tie",
    },
    {
      id: "Q08",
      difficulty: "medium",
      query: "Paid for airport taxi — is this reimbursable?",
      scenario: "Ground transport during a trip",
      vectorHitRate: 1.0,
      keywordHitRate: 1.0,
      winner: "tie",
    },
    {
      id: "Q09",
      difficulty: "medium",
      query: "Business lunch with partners cost AUD 250 — how to report it?",
      scenario: "Client entertainment expense",
      vectorHitRate: 1.0,
      keywordHitRate: 1.0,
      winner: "tie",
    },
    {
      id: "Q10",
      difficulty: "medium",
      query: "Need a monitor and keyboard for a new hire — what is the procedure?",
      scenario: "Workstation provisioning",
      vectorHitRate: 1.0,
      keywordHitRate: 0.5,
      winner: "vector",
    },
    {
      id: "Q11",
      difficulty: "medium",
      query: "Drove to a client in my own car — how do I get fuel reimbursed?",
      scenario: "Personal vehicle for business use",
      vectorHitRate: 0.0,
      keywordHitRate: 0.0,
      winner: "tie",
    },
    {
      id: "Q12",
      difficulty: "medium",
      query: "My manager is on leave — who signs my travel approval?",
      scenario: "Urgent trip without direct approver",
      vectorHitRate: 1.0,
      keywordHitRate: 1.0,
      winner: "tie",
    },
    {
      id: "Q13",
      difficulty: "medium",
      query: "Signed up for an online Python course — how to claim reimbursement?",
      scenario: "Online training reimbursement",
      vectorHitRate: 1.0,
      keywordHitRate: 0.0,
      winner: "vector",
    },
    {
      id: "Q14",
      difficulty: "medium",
      query: "Left hotel receipts behind — what now?",
      scenario: "Lost supporting documents",
      vectorHitRate: 0.5,
      keywordHitRate: 0.5,
      winner: "tie",
    },
    {
      id: "Q15",
      difficulty: "hard",
      query: "Bought a colleague a birthday gift on the corporate card — is that okay?",
      scenario: "Possible misuse of corporate funds",
      vectorHitRate: 0.0,
      keywordHitRate: 1.0,
      winner: "keyword",
    },
    {
      id: "Q16",
      difficulty: "hard",
      query: "Lost the hotel receipt — what to do and what are the consequences?",
      scenario: "Documentation loss during reporting",
      vectorHitRate: 1.0,
      keywordHitRate: 0.5,
      winner: "vector",
    },
    {
      id: "Q17",
      difficulty: "hard",
      query: "Relocating to a new city for work — does the company cover rent?",
      scenario: "Employee relocation package",
      vectorHitRate: 0.5,
      keywordHitRate: 0.0,
      winner: "vector",
    },
    {
      id: "Q18",
      difficulty: "hard",
      query: "Work laptop broke during a trip — can I buy a new one on site?",
      scenario: "Emergency equipment purchase abroad",
      vectorHitRate: 0.5,
      keywordHitRate: 0.0,
      winner: "vector",
    },
    {
      id: "Q19",
      difficulty: "hard",
      query: "A partner is asking for financial statements before public release — can I send them?",
      scenario: "Confidential financial disclosure request",
      vectorHitRate: 1.0,
      keywordHitRate: 1.0,
      winner: "tie",
    },
    {
      id: "Q20",
      difficulty: "hard",
      query: "Worked from home for a month — how often must I come to the office?",
      scenario: "Remote work and related compensation",
      vectorHitRate: 0.5,
      keywordHitRate: 0.5,
      winner: "tie",
    },
  ],
  generatedAt: "2026-07-22T15:00:00.000Z",
};
