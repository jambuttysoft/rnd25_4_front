import { SYNTHETIC_RECEIPTS, GROUND_TRUTH } from './receipts.js';
import { parseReceipt } from './parser.js';
import type { ParserResult, ExtractedFieldError, ExperimentMetrics } from './types.js';

function computeErrors(expected: number, actual: number): { absoluteError: number; relativeError: number } {
  const absErr = Math.abs(expected - actual);
  const relErr = expected !== 0 ? absErr / Math.abs(expected) : (actual !== 0 ? 1 : 0);
  return { absoluteError: absErr, relativeError: relErr };
}

function runExperiment(): ParserResult[] {
  const results: ParserResult[] = [];
  for (const raw of SYNTHETIC_RECEIPTS) {
    const groundTruth = GROUND_TRUTH[raw.id];
    const prediction = parseReceipt(raw);
    const errors: ExtractedFieldError[] = [];

    const gt = groundTruth.breakdown;
    const pd = prediction.breakdown;

    const fields: { field: string; expected: number; actual: number }[] = [
      { field: 'cash_out', expected: gt.cash_out, actual: pd.cash_out },
      { field: 'loyalty_points_spent', expected: gt.loyalty_points_spent, actual: pd.loyalty_points_spent },
      { field: 'card_fee_amount', expected: gt.card_fee_amount, actual: pd.card_fee_amount },
      { field: 'net_goods_amount', expected: gt.net_goods_amount, actual: pd.net_goods_amount },
    ];

    for (const f of fields) {
      const { absoluteError, relativeError } = computeErrors(f.expected, f.actual);
      if (absoluteError > 0.005) {
        errors.push({
          field: f.field,
          expected: f.expected,
          actual: f.actual,
          absoluteError,
          relativeError,
        });
      }
    }

    const success = errors.length === 0;
    results.push({
      receipt_id: raw.id,
      ground_truth: groundTruth,
      prediction,
      errors,
      success,
    });
  }
  return results;
}

function computeMAE(results: ParserResult[], field: string): number {
  let sum = 0;
  for (const r of results) {
    const gt = r.ground_truth.breakdown;
    const pd = r.prediction.breakdown;
    const val = field === 'cash_out' ? [gt.cash_out, pd.cash_out] :
      field === 'loyalty_points' ? [gt.loyalty_points_spent, pd.loyalty_points_spent] :
      field === 'card_fee' ? [gt.card_fee_amount, pd.card_fee_amount] :
      field === 'net_goods' ? [gt.net_goods_amount, pd.net_goods_amount] :
      [0, 0];
    sum += Math.abs(val[0] - val[1]);
  }
  return sum / results.length;
}

function computeAccuracy(results: ParserResult[], field: string, tolerance: number = 0.01): number {
  let correct = 0;
  for (const r of results) {
    const gt = r.ground_truth.breakdown;
    const pd = r.prediction.breakdown;
    const val = field === 'cash_out' ? [gt.cash_out, pd.cash_out] :
      field === 'loyalty_points' ? [gt.loyalty_points_spent, pd.loyalty_points_spent] :
      field === 'card_fee' ? [gt.card_fee_amount, pd.card_fee_amount] :
      field === 'net_goods' ? [gt.net_goods_amount, pd.net_goods_amount] :
      [0, 0];
    const expected = val[0];
    const actual = val[1];
    const relErr = expected !== 0 ? Math.abs(expected - actual) / Math.abs(expected) : (actual !== 0 ? 1 : 0);
    if (relErr <= tolerance) correct++;
  }
  return correct / results.length;
}

function computePrecisionRecallF1(results: ParserResult[], field: string, tolerance: number = 0.01): { precision: number; recall: number; f1: number } {
  let tp = 0, fp = 0, fn = 0;

  for (const r of results) {
    const gt = r.ground_truth.breakdown;
    const pd = r.prediction.breakdown;
    const expected = field === 'cash_out' ? gt.cash_out :
      field === 'loyalty_points' ? gt.loyalty_points_spent :
      field === 'card_fee' ? gt.card_fee_amount :
      field === 'net_goods' ? gt.net_goods_amount : 0;
    const actual = field === 'cash_out' ? pd.cash_out :
      field === 'loyalty_points' ? pd.loyalty_points_spent :
      field === 'card_fee' ? pd.card_fee_amount :
      field === 'net_goods' ? pd.net_goods_amount : 0;

    const gtPositive = Math.abs(expected) > tolerance;
    const pdPositive = Math.abs(actual) > tolerance;

    if (gtPositive && pdPositive) {
      const relErr = Math.abs(expected - actual) / Math.abs(expected);
      if (relErr <= tolerance) tp++;
      else { fp++; fn++; }
    } else if (gtPositive && !pdPositive) {
      fn++;
    } else if (!gtPositive && pdPositive) {
      fp++;
    }
  }

  const precision = tp + fp > 0 ? tp / (tp + fp) : 1;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 1;
  const f1 = precision + recall > 0 ? 2 * precision * recall / (precision + recall) : 0;

  return { precision, recall, f1 };
}

function toFixed(n: number, d: number): string {
  return n.toFixed(d);
}

function padLeft(s: string, len: number): string {
  return s.length >= len ? s : ' '.repeat(len - s.length) + s;
}

function printResults(results: ParserResult[]): void {
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     ЭКСПЕРИМЕНТ 1: ТОЧНОСТЬ ИЗВЛЕЧЕНИЯ СЛОЖНЫХ СУЩНОСТЕЙ   ║');
  console.log('║          Receipt Parsing Accuracy — Cash-out & Bonuses       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log();
  console.log(`Всего чеков: ${results.length}`);
  console.log(`Успешно (без ошибок): ${successful}/${results.length} (${toFixed(successful / results.length * 100, 1)}%)`);
  console.log(`С ошибками: ${failed}/${results.length} (${toFixed(failed / results.length * 100, 1)}%)`);
  console.log();

  const maeCashOut = computeMAE(results, 'cash_out');
  const maeLoyalty = computeMAE(results, 'loyalty_points');
  const maeCardFee = computeMAE(results, 'card_fee');
  const maeNetGoods = computeMAE(results, 'net_goods');

  const accCashOut = computeAccuracy(results, 'cash_out');
  const accLoyalty = computeAccuracy(results, 'loyalty_points');
  const accCardFee = computeAccuracy(results, 'card_fee');
  const accNetGoods = computeAccuracy(results, 'net_goods');

  const prfCashOut = computePrecisionRecallF1(results, 'cash_out');
  const prfLoyalty = computePrecisionRecallF1(results, 'loyalty_points');
  const prfCardFee = computePrecisionRecallF1(results, 'card_fee');
  const prfNetGoods = computePrecisionRecallF1(results, 'net_goods');

  const totalErrors = results.reduce((s, r) => s + r.errors.length, 0);

  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                          Точность извлечения по полям                        ║');
  console.log('╠══════════════════════════╤═══════════╤═══════════╤═══════════╤══════════════╣');
  console.log('║ Поле                     │    MAE    │ Accuracy  │ Precision │ Recall (F1)  ║');
  console.log('╟──────────────────────────┼───────────┼───────────┼───────────┼──────────────╢');
  console.log(`║ cash_out                 │ ${padLeft(toFixed(maeCashOut, 2), 7)}   │ ${padLeft(toFixed(accCashOut * 100, 1) + '%', 7)}   │ ${padLeft(toFixed(prfCashOut.precision * 100, 1) + '%', 7)}   │ ${padLeft(toFixed(prfCashOut.recall * 100, 1) + '%', 5)} / ${padLeft(toFixed(prfCashOut.f1 * 100, 1) + '%', 4)} ║`);
  console.log(`║ loyalty_points_spent     │ ${padLeft(toFixed(maeLoyalty, 2), 7)}   │ ${padLeft(toFixed(accLoyalty * 100, 1) + '%', 7)}   │ ${padLeft(toFixed(prfLoyalty.precision * 100, 1) + '%', 7)}   │ ${padLeft(toFixed(prfLoyalty.recall * 100, 1) + '%', 5)} / ${padLeft(toFixed(prfLoyalty.f1 * 100, 1) + '%', 4)} ║`);
  console.log(`║ card_fee_amount          │ ${padLeft(toFixed(maeCardFee, 2), 7)}   │ ${padLeft(toFixed(accCardFee * 100, 1) + '%', 7)}   │ ${padLeft(toFixed(prfCardFee.precision * 100, 1) + '%', 7)}   │ ${padLeft(toFixed(prfCardFee.recall * 100, 1) + '%', 5)} / ${padLeft(toFixed(prfCardFee.f1 * 100, 1) + '%', 4)} ║`);
  console.log(`║ net_goods_amount         │ ${padLeft(toFixed(maeNetGoods, 2), 7)}   │ ${padLeft(toFixed(accNetGoods * 100, 1) + '%', 7)}   │ ${padLeft(toFixed(prfNetGoods.precision * 100, 1) + '%', 7)}   │ ${padLeft(toFixed(prfNetGoods.recall * 100, 1) + '%', 5)} / ${padLeft(toFixed(prfNetGoods.f1 * 100, 1) + '%', 4)} ║`);
  console.log('╚══════════════════════════╧═══════════╧═══════════╧═══════════╧══════════════╝');
  console.log();

  console.log(`Всего ошибок парсинга: ${totalErrors}`);
  console.log();

  const aggPrecision = (prfCashOut.precision + prfLoyalty.precision + prfCardFee.precision + prfNetGoods.precision) / 4;
  const aggRecall = (prfCashOut.recall + prfLoyalty.recall + prfCardFee.recall + prfNetGoods.recall) / 4;
  const aggF1 = (prfCashOut.f1 + prfLoyalty.f1 + prfCardFee.f1 + prfNetGoods.f1) / 4;

  console.log('╔═══════════════════════════════════════════╗');
  console.log('║          Сводные метрики (MAE)           ║');
  console.log('╠═══════════════════════════════╤═══════════╣');
  console.log(`║ MAE cash_out                  │ ${padLeft(toFixed(maeCashOut, 2), 7)}   ║`);
  console.log(`║ MAE loyalty_points            │ ${padLeft(toFixed(maeLoyalty, 2), 7)}   ║`);
  console.log(`║ MAE card_fee                  │ ${padLeft(toFixed(maeCardFee, 2), 7)}   ║`);
  console.log(`║ MAE net_goods                 │ ${padLeft(toFixed(maeNetGoods, 2), 7)}   ║`);
  console.log('╟───────────────────────────────┼───────────╢');
  console.log(`║ Aggregate Precision           │ ${padLeft(toFixed(aggPrecision * 100, 1) + '%', 7)}   ║`);
  console.log(`║ Aggregate Recall              │ ${padLeft(toFixed(aggRecall * 100, 1) + '%', 7)}   ║`);
  console.log(`║ Aggregate F1                  │ ${padLeft(toFixed(aggF1 * 100, 1) + '%', 7)}   ║`);
  console.log('╚═══════════════════════════════╧═══════════╝');
  console.log();

  if (failed > 0) {
    console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                        Детализация ошибок по чекам                          ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
    for (const r of results) {
      if (r.errors.length === 0) continue;
      console.log(`\n  📄 ${r.receipt_id} — ${r.ground_truth.merchant}`);
      for (const e of r.errors) {
        const expStr = typeof e.expected === 'number' ? toFixed(e.expected, 2) : String(e.expected);
        const actStr = typeof e.actual === 'number' ? toFixed(e.actual, 2) : String(e.actual);
        console.log(`     ${e.field}: ожидалось ${expStr}, получено ${actStr} (Δ=${toFixed(e.absoluteError, 2)})`);
      }
    }
    console.log();
  }

  const metrics: ExperimentMetrics = {
    precision: aggPrecision,
    recall: aggRecall,
    f1_score: aggF1,
    mae_cash_out: maeCashOut,
    mae_loyalty_points: maeLoyalty,
    mae_card_fee: maeCardFee,
    mae_net_goods: maeNetGoods,
    total_receipts: results.length,
    successful_parses: successful,
    failed_parses: failed,
  };

  console.log('--- JSON Metrics (for programmatic consumption) ---');
  console.log(JSON.stringify(metrics, null, 2));
}

const results = runExperiment();
printResults(results);
