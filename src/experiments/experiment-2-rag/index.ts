import { POLICY_CORPUS } from './corpus.js';
import { createKeywordSearch, createVectorSearch } from './embedder.js';
import type { SearchQuery, QueryResult, ExperimentMetrics, SearchResult } from './types.js';

const SEARCH_QUERIES: SearchQuery[] = [
  // ================================================================
  // Easy (6) — прямые формулировки, термины из политик
  // ================================================================
  {
    id: 'Q01',
    naturalQuery: 'Могу ли я купить ноутбук в командировке?',
    relevantParagraphIds: ['OP-1'],
    difficulty: 'easy',
    scenario: 'Сотрудник в командировке, нужен ноутбук для работы',
  },
  {
    id: 'Q02',
    naturalQuery: 'Какой лимит на отель в Москве?',
    relevantParagraphIds: ['TP-1'],
    difficulty: 'easy',
    scenario: 'Сотрудник планирует командировку в Москву',
  },
  {
    id: 'Q03',
    naturalQuery: 'Сколько суточных платят в командировке по России?',
    relevantParagraphIds: ['TP-1'],
    difficulty: 'easy',
    scenario: 'Сотрудник уточняет размер суточных',
  },
  {
    id: 'Q04',
    naturalQuery: 'Как оформить авансовый отчет после командировки?',
    relevantParagraphIds: ['FR-1'],
    difficulty: 'easy',
    scenario: 'Сотрудник вернулся из командировки',
  },
  {
    id: 'Q05',
    naturalQuery: 'Какие документы нужны для возмещения стоимости обучения?',
    relevantParagraphIds: ['TR-1'],
    difficulty: 'easy',
    scenario: 'Сотрудник прошел обучение, хочет получить компенсацию',
  },
  {
    id: 'Q06',
    naturalQuery: 'Можно ли использовать корпоративную карту для покупок в интернет-магазине?',
    relevantParagraphIds: ['CC-3'],
    difficulty: 'easy',
    scenario: 'Сотрудник хочет купить что-то онлайн',
  },

  // ================================================================
  // Medium (8) — разговорные формулировки, синонимы
  // ================================================================
  {
    id: 'Q07',
    naturalQuery: 'Слетал в Берлин на конференцию, потратил 2000 евро на билеты, сколько вернут?',
    relevantParagraphIds: ['FB-2', 'TR-2'],
    difficulty: 'medium',
    scenario: 'Сотрудник вернулся с зарубежной конференции',
  },
  {
    id: 'Q08',
    naturalQuery: 'Заплатил за такси из аэропорта, компенсируют или нет?',
    relevantParagraphIds: ['TP-2', 'FB-2'],
    difficulty: 'medium',
    scenario: 'Транспортные расходы в командировке',
  },
  {
    id: 'Q09',
    naturalQuery: 'Купил обед с партнерами на 15000 рублей, как правильно отчитаться?',
    relevantParagraphIds: ['GE-2', 'BM-1'],
    difficulty: 'medium',
    scenario: 'Деловой обед с партнерами',
  },
  {
    id: 'Q10',
    naturalQuery: 'Нужно купить монитор и клавиатуру для нового сотрудника, какой порядок?',
    relevantParagraphIds: ['OP-1', 'OP-2'],
    difficulty: 'medium',
    scenario: 'Обустройство рабочего места',
  },
  {
    id: 'Q11',
    naturalQuery: 'Поехал к клиенту на своей машине, как получить компенсацию за бензин?',
    relevantParagraphIds: ['CV-2'],
    difficulty: 'medium',
    scenario: 'Использование личного автомобиля в служебных целях',
  },
  {
    id: 'Q12',
    naturalQuery: 'Мой начальник в отпуске, кто подпишет заявку на поездку?',
    relevantParagraphIds: ['TP-3'],
    difficulty: 'medium',
    scenario: 'Срочная командировка без руководителя',
  },
  {
    id: 'Q13',
    naturalQuery: 'Записался на онлайн-курс по Python, как вернуть деньги за обучение?',
    relevantParagraphIds: ['TR-3'],
    difficulty: 'medium',
    scenario: 'Возмещение онлайн-обучения',
  },
  {
    id: 'Q14',
    naturalQuery: 'Забыл квитанции в гостинице, что теперь делать с отчетом?',
    relevantParagraphIds: ['CC-2', 'FR-1'],
    difficulty: 'medium',
    scenario: 'Утеря подтверждающих документов',
  },

  // ================================================================
  // Hard (6) — сложные, многозначные, неявный контекст
  // ================================================================
  {
    id: 'Q15',
    naturalQuery: 'Купил коллеге подарок на день рождения за корпоративные деньги, это нормально?',
    relevantParagraphIds: ['GE-3'],
    difficulty: 'hard',
    scenario: 'Нецелевое использование корпоративных средств',
  },
  {
    id: 'Q16',
    naturalQuery: 'Потерял чек из отеля, что делать и какие последствия?',
    relevantParagraphIds: ['CC-2', 'FR-1'],
    difficulty: 'hard',
    scenario: 'Утеря документов при отчетности',
  },
  {
    id: 'Q17',
    naturalQuery: 'Переезжаю в Новосибирск по работе, компания поможет с арендой квартиры?',
    relevantParagraphIds: ['ER-1', 'ER-2'],
    difficulty: 'hard',
    scenario: 'Релокация сотрудника в другой город',
  },
  {
    id: 'Q18',
    naturalQuery: 'В командировке сломался рабочий ноутбук, могу я купить новый на месте?',
    relevantParagraphIds: ['OP-1', 'IT-2'],
    difficulty: 'hard',
    scenario: 'Экстренная закупка оборудования в командировке',
  },
  {
    id: 'Q19',
    naturalQuery: 'Партнер просит прислать финансовую отчетность до официальной публикации, могу ли я это сделать?',
    relevantParagraphIds: ['DC-1'],
    difficulty: 'hard',
    scenario: 'Запрос конфиденциальной финансовой информации',
  },
  {
    id: 'Q20',
    naturalQuery: 'Работаю из дома уже месяц, как часто нужно появляться в офисе и что оплачивает компания?',
    relevantParagraphIds: ['RW-1', 'RW-2'],
    difficulty: 'hard',
    scenario: 'Удаленная работа и связанные компенсации',
  },
];

function computeHitRate(results: SearchResult[], relevantIds: string[], topK: number = 5): number {
  const topIds = new Set(results.slice(0, topK).map(r => r.paragraphId));
  let hits = 0;
  for (const rid of relevantIds) {
    if (topIds.has(rid)) hits++;
  }
  return relevantIds.length > 0 ? hits / relevantIds.length : 0;
}

function computePrecision(results: SearchResult[], relevantIds: string[], topK: number = 5): number {
  const topIds = results.slice(0, topK).map(r => r.paragraphId);
  const relevantSet = new Set(relevantIds);
  let hits = 0;
  for (const id of topIds) {
    if (relevantSet.has(id)) hits++;
  }
  return topK > 0 ? hits / topK : 0;
}

function padRight(s: string, len: number): string {
  return s.length >= len ? s : s + ' '.repeat(len - s.length);
}

function padLeft(s: string, len: number): string {
  return s.length >= len ? s : ' '.repeat(len - s.length) + s;
}

function toFixed(n: number, d: number): string {
  return n.toFixed(d);
}

function percent(n: number): string {
  return padLeft(toFixed(n * 100, 0) + '%', 4);
}

function truncate(s: string, maxLen: number): string {
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen - 3) + '...';
}

function fmtMs(ms: number): string {
  return padLeft(toFixed(ms, 1) + 'ms', 8);
}

function decideWinner(vectorRate: number, keywordRate: number): string {
  const diff = vectorRate - keywordRate;
  if (Math.abs(diff) < 0.01) return 'tie';
  return diff > 0 ? 'vector' : 'keyword';
}

function measureTime<T>(fn: () => T): { result: T; timeMs: number } {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  return { result, timeMs: end - start };
}

function runExperiment(): void {
  const keywordEngine = createKeywordSearch(POLICY_CORPUS);
  const vectorEngine = createVectorSearch(POLICY_CORPUS);

  const queryResults: QueryResult[] = [];
  const vectorTimes: number[] = [];
  const keywordTimes: number[] = [];

  for (const q of SEARCH_QUERIES) {
    const vResult = measureTime(() => vectorEngine.search(q.naturalQuery));
    const kResult = measureTime(() => keywordEngine.search(q.naturalQuery));

    vectorTimes.push(vResult.timeMs);
    keywordTimes.push(kResult.timeMs);

    const vectorResults = vResult.result;
    const keywordResults = kResult.result;

    const vectorHitRate = computeHitRate(vectorResults, q.relevantParagraphIds);
    const keywordHitRate = computeHitRate(keywordResults, q.relevantParagraphIds);
    const vectorPrecision = computePrecision(vectorResults, q.relevantParagraphIds);
    const keywordPrecision = computePrecision(keywordResults, q.relevantParagraphIds);

    queryResults.push({
      queryId: q.id,
      naturalQuery: q.naturalQuery,
      vectorResults,
      keywordResults,
      vectorHitRate,
      keywordHitRate,
      vectorPrecision,
      keywordPrecision,
    });
  }

  // Aggregate metrics
  const totalQueries = queryResults.length;
  const avgVectorHitRate = queryResults.reduce((s, r) => s + r.vectorHitRate, 0) / totalQueries;
  const avgKeywordHitRate = queryResults.reduce((s, r) => s + r.keywordHitRate, 0) / totalQueries;
  const avgVectorPrecision = queryResults.reduce((s, r) => s + r.vectorPrecision, 0) / totalQueries;
  const avgKeywordPrecision = queryResults.reduce((s, r) => s + r.keywordPrecision, 0) / totalQueries;
  const vectorAvgLatencyMs = vectorTimes.reduce((s, t) => s + t, 0) / vectorTimes.length;
  const keywordAvgLatencyMs = keywordTimes.reduce((s, t) => s + t, 0) / keywordTimes.length;

  let vectorWins = 0;
  let keywordWins = 0;
  for (const r of queryResults) {
    const winner = decideWinner(r.vectorHitRate, r.keywordHitRate);
    if (winner === 'vector') vectorWins++;
    else if (winner === 'keyword') keywordWins++;
  }

  const diffBreakdown = {
    easy: { vector: 0, keyword: 0 },
    medium: { vector: 0, keyword: 0 },
    hard: { vector: 0, keyword: 0 },
  };

  for (const q of SEARCH_QUERIES) {
    const result = queryResults.find(r => r.queryId === q.id)!;
    const winner = decideWinner(result.vectorHitRate, result.keywordHitRate);
    if (winner === 'vector') {
      diffBreakdown[q.difficulty].vector++;
    } else if (winner === 'keyword') {
      diffBreakdown[q.difficulty].keyword++;
    }
  }

  const docCount = new Set(POLICY_CORPUS.map(p => p.documentName)).size;
  const parCount = POLICY_CORPUS.length;

  const diffCounts = { easy: 0, medium: 0, hard: 0 };
  for (const q of SEARCH_QUERIES) diffCounts[q.difficulty]++;

  // Print results
  console.log('╔══════════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║             ЭКСПЕРИМЕНТ 2: RAG РЕЛЕВАНТНОСТЬ ДЛЯ КОРПОРАТИВНЫХ ПОЛИТИК             ║');
  console.log('║                    Vector (TF-IDF + Synonyms) vs Keyword Search                      ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════════════╝');
  console.log();
  console.log(`Корпус: ${docCount} документов, ${parCount} параграфов`);
  console.log(`Запросов: ${totalQueries} (easy: ${diffCounts.easy}, medium: ${diffCounts.medium}, hard: ${diffCounts.hard})`);
  console.log();

  console.log('Результаты по запросам:');
  console.log('┌──────┬────────┬──────────────────────────────────────────────┬──────────┬──────────┬──────────┐');
  console.log('│  ID  │ Сложн. │ Запрос                                       │  VECTOR  │ KEYWORD  │ WINNER   │');
  console.log('├──────┼────────┼──────────────────────────────────────────────┼──────────┼──────────┼──────────┤');

  for (const r of queryResults) {
    const q = SEARCH_QUERIES.find(q => q.id === r.queryId)!;
    const diffLabel = padRight(`[${q.difficulty}]`, 8);
    const queryLabel = padRight(truncate(r.naturalQuery, 44), 44);
    const vHit = percent(r.vectorHitRate);
    const kHit = percent(r.keywordHitRate);
    const winner = decideWinner(r.vectorHitRate, r.keywordHitRate);
    const winnerLabel = padLeft(winner, 8);
    console.log(`│ ${r.queryId} │ ${diffLabel}│ ${queryLabel}│ ${vHit}   │ ${kHit}   │ ${winnerLabel} │`);
  }

  console.log('└──────┴────────┴──────────────────────────────────────────────┴──────────┴──────────┴──────────┘');
  console.log();

  console.log('Сводная статистика:');
  console.log(`  Средний hit rate (vector):  ${percent(avgVectorHitRate)}`);
  console.log(`  Средний hit rate (keyword): ${percent(avgKeywordHitRate)}`);
  console.log(`  Средняя precision (vector):  ${percent(avgVectorPrecision)}`);
  console.log(`  Средняя precision (keyword): ${percent(avgKeywordPrecision)}`);
  console.log(`  Побед vector: ${vectorWins} | keyword: ${keywordWins} | ничьих: ${totalQueries - vectorWins - keywordWins}`);
  console.log(`  Средняя задержка vector: ${fmtMs(vectorAvgLatencyMs)} | keyword: ${fmtMs(keywordAvgLatencyMs)}`);
  console.log();

  console.log('Разбивка по сложности:');
  console.log(`  Easy:   VECTOR ${percent(diffBreakdown.easy.vector / (diffCounts.easy || 1))} побед | KEYWORD ${percent(diffBreakdown.easy.keyword / (diffCounts.easy || 1))} побед`);

  const easyResults = SEARCH_QUERIES.filter(q => q.difficulty === 'easy');
  const easyVecAvg = easyResults.reduce((s, q) => {
    const r = queryResults.find(r => r.queryId === q.id)!;
    return s + r.vectorHitRate;
  }, 0) / (easyResults.length || 1);
  const easyKeyAvg = easyResults.reduce((s, q) => {
    const r = queryResults.find(r => r.queryId === q.id)!;
    return s + r.keywordHitRate;
  }, 0) / (easyResults.length || 1);
  console.log(`         Hit rate: VECTOR ${percent(easyVecAvg)} | KEYWORD ${percent(easyKeyAvg)}`);

  console.log(`  Medium: VECTOR ${percent(diffBreakdown.medium.vector / (diffCounts.medium || 1))} побед | KEYWORD ${percent(diffBreakdown.medium.keyword / (diffCounts.medium || 1))} побед`);

  const medResults = SEARCH_QUERIES.filter(q => q.difficulty === 'medium');
  const medVecAvg = medResults.reduce((s, q) => {
    const r = queryResults.find(r => r.queryId === q.id)!;
    return s + r.vectorHitRate;
  }, 0) / (medResults.length || 1);
  const medKeyAvg = medResults.reduce((s, q) => {
    const r = queryResults.find(r => r.queryId === q.id)!;
    return s + r.keywordHitRate;
  }, 0) / (medResults.length || 1);
  console.log(`         Hit rate: VECTOR ${percent(medVecAvg)} | KEYWORD ${percent(medKeyAvg)}`);

  console.log(`  Hard:   VECTOR ${percent(diffBreakdown.hard.vector / (diffCounts.hard || 1))} побед | KEYWORD ${percent(diffBreakdown.hard.keyword / (diffCounts.hard || 1))} побед`);

  const hardResults = SEARCH_QUERIES.filter(q => q.difficulty === 'hard');
  const hardVecAvg = hardResults.reduce((s, q) => {
    const r = queryResults.find(r => r.queryId === q.id)!;
    return s + r.vectorHitRate;
  }, 0) / (hardResults.length || 1);
  const hardKeyAvg = hardResults.reduce((s, q) => {
    const r = queryResults.find(r => r.queryId === q.id)!;
    return s + r.keywordHitRate;
  }, 0) / (hardResults.length || 1);
  console.log(`         Hit rate: VECTOR ${percent(hardVecAvg)} | KEYWORD ${percent(hardKeyAvg)}`);

  console.log();

  const metrics: ExperimentMetrics = {
    totalQueries,
    avgVectorHitRate,
    avgKeywordHitRate,
    avgVectorPrecision,
    avgKeywordPrecision,
    vectorWins,
    keywordWins,
    vectorAvgLatencyMs,
    keywordAvgLatencyMs,
    difficultyBreakdown: {
      easy: { vector: easyVecAvg, keyword: easyKeyAvg },
      medium: { vector: medVecAvg, keyword: medKeyAvg },
      hard: { vector: hardVecAvg, keyword: hardKeyAvg },
    },
  };

  console.log('--- JSON Metrics (for programmatic consumption) ---');
  console.log(JSON.stringify(metrics, null, 2));
}

runExperiment();
