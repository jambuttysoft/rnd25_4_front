// ============================================================
// Experiment 1: Receipt Parsing Accuracy — Types
// ============================================================

/** Товарная позиция в чеке */
export interface ReceiptItem {
  name: string;
  price: number;
  quantity: number;
  category: string;
}

/** Детальная разбивка платежей и комиссий */
export interface ReceiptBreakdown {
  cash_out: number;           // сумма скрытого "обналичивания"
  card_fee_percent: number;   // комиссия эквайринга (%)
  card_fee_amount: number;    // комиссия эквайринга (сумма)
  loyalty_points_spent: number; // списанные бонусы лояльности
  loyalty_bonus_earned: number; // начисленные бонусы
  net_goods_amount: number;   // стоимость товаров без бонусов
  partial_payments: PartialPayment[];
  tip_amount: number;         // чаевые
  discount_total: number;     // скидки
}

/** Способ частичной оплаты */
export interface PartialPayment {
  method: 'card' | 'cash' | 'loyalty_points' | 'gift_card';
  amount: number;
}

/** Нормализованный (ground truth) чек */
export interface NormalizedReceipt {
  receipt_id: string;
  merchant: string;
  date: string;
  total_amount: number;
  currency: string;
  breakdown: ReceiptBreakdown;
  items: ReceiptItem[];
}

/** Сырой чек — имитация OCR / неструктурированного текста */
export interface ReceiptRaw {
  id: string;
  rawText: string;
  merchant: string;
  date: string;
  total_amount: number;
  currency: string;
}

/** Результат парсинга одного чека */
export interface ParserResult {
  receipt_id: string;
  ground_truth: NormalizedReceipt;
  prediction: NormalizedReceipt;
  errors: ExtractedFieldError[];
  success: boolean;
}

/** Ошибка по одному полю */
export interface ExtractedFieldError {
  field: string;
  expected: unknown;
  actual: unknown;
  absoluteError: number;
  relativeError: number;
}

/** Сводные метрики эксперимента */
export interface ExperimentMetrics {
  precision: number;
  recall: number;
  f1_score: number;
  mae_cash_out: number;         // Mean Absolute Error for cash_out
  mae_loyalty_points: number;   // Mean Absolute Error for loyalty_points
  mae_card_fee: number;         // Mean Absolute Error for card_fee
  mae_net_goods: number;        // Mean Absolute Error for net_goods
  total_receipts: number;
  successful_parses: number;
  failed_parses: number;
}

/** Категория проблемного случая */
export type TroubleCategory =
  | 'cash_out_masking'
  | 'loyalty_bonuses'
  | 'card_fees'
  | 'partial_payments'
  | 'edge_case';
