export type FieldKey = "cash_out" | "loyalty_points_spent" | "card_fee_amount" | "net_goods_amount";

export interface FieldMetrics {
  field: FieldKey;
  label: string;
  description: string;
  mae: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
}

export interface SampleReceipt {
  id: string;
  merchant: string;
  total: number;
  errors: Array<{
    field: FieldKey;
    expected: number;
    actual: number;
    delta: number;
  }>;
}

export interface ParserExperimentData {
  title: string;
  subtitle: string;
  description: string;
  totalReceipts: number;
  successfulParses: number;
  failedParses: number;
  totalErrors: number;
  fieldMetrics: FieldMetrics[];
  aggregate: {
    precision: number;
    recall: number;
    f1: number;
  };
  sampleReceipts: SampleReceipt[];
  generatedAt: string;
}

export const parserData: ParserExperimentData = {
  title: "Receipt Parser",
  subtitle: "Experiment 01",
  description:
    "Structured LLM-style parser with controlled error injection. Evaluates extraction accuracy of complex financial entities — cash-out masking, loyalty bonuses, card acquirer fees, and net goods amount — across 50 synthetic receipts.",
  totalReceipts: 50,
  successfulParses: 5,
  failedParses: 45,
  totalErrors: 68,
  fieldMetrics: [
    {
      field: "cash_out",
      label: "Cash-out",
      description: "Hidden cash withdrawal disguised as a discount or service fee",
      mae: 48.0,
      accuracy: 0.92,
      precision: 1.0,
      recall: 0.333,
      f1: 0.5,
    },
    {
      field: "loyalty_points_spent",
      label: "Loyalty Points",
      description: "Bonus value redeemed from a loyalty programme at checkout",
      mae: 50.74,
      accuracy: 0.88,
      precision: 1.0,
      recall: 0.625,
      f1: 0.769,
    },
    {
      field: "card_fee_amount",
      label: "Card Acquirer Fee",
      description: "Bank card processing fee computed as percent × card payment",
      mae: 1.9,
      accuracy: 0.8,
      precision: 0.833,
      recall: 0.75,
      f1: 0.789,
    },
    {
      field: "net_goods_amount",
      label: "Net Goods Amount",
      description: "Goods value net of cash-out, card fee, and loyalty bonuses",
      mae: 360.11,
      accuracy: 0.18,
      precision: 0.184,
      recall: 0.146,
      f1: 0.163,
    },
  ],
  aggregate: {
    precision: 0.754,
    recall: 0.464,
    f1: 0.555,
  },
  sampleReceipts: [
    {
      id: "receipt_001",
      merchant: "SUPERMARKET ATB",
      total: 994.0,
      errors: [
        {
          field: "net_goods_amount",
          expected: 994.0,
          actual: 950.0,
          delta: 44.0,
        },
      ],
    },
    {
      id: "receipt_002",
      merchant: "TECH STORE FOKSTROT",
      total: 27870.04,
      errors: [
        {
          field: "cash_out",
          expected: 1500.0,
          actual: 0.0,
          delta: -1500.0,
        },
        {
          field: "net_goods_amount",
          expected: 24370.04,
          actual: 26398.0,
          delta: 2027.96,
        },
      ],
    },
    {
      id: "receipt_022",
      merchant: "STORE MOYO",
      total: 3800.0,
      errors: [
        {
          field: "loyalty_points_spent",
          expected: 1000.0,
          actual: 0.0,
          delta: -1000.0,
        },
        {
          field: "card_fee_amount",
          expected: 36.0,
          actual: 0.0,
          delta: -36.0,
        },
        {
          field: "net_goods_amount",
          expected: 2764.0,
          actual: 1800.0,
          delta: -964.0,
        },
      ],
    },
    {
      id: "receipt_028",
      merchant: "ONLINE STORE ALLO",
      total: 27126.65,
      errors: [
        {
          field: "card_fee_amount",
          expected: 317.99,
          actual: 321.67,
          delta: 3.68,
        },
        {
          field: "net_goods_amount",
          expected: 26181.01,
          actual: 26805.65,
          delta: 624.64,
        },
      ],
    },
    {
      id: "receipt_044",
      merchant: "STORE NOVA LINIYA",
      total: 3716.25,
      errors: [
        {
          field: "net_goods_amount",
          expected: 3716.25,
          actual: 0.0,
          delta: -3716.25,
        },
      ],
    },
  ],
  generatedAt: "2026-07-22T15:00:00.000Z",
};
