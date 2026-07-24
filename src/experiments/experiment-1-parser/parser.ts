import type { ReceiptRaw, NormalizedReceipt, ReceiptItem, PartialPayment } from './types.js';

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function parseNumber(s: string): number {
  const cleaned = s.replace(/[^\d.\-]/g, '').trim();
  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : val;
}

function extractLines(text: string): string[] {
  return text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
}

function parseItems(lines: string[]): ReceiptItem[] {
  const items: ReceiptItem[] = [];
  const itemRe = /(.+?)\s+([\d.,]+)\s*x\s*(\d+)\s*=\s*([\d.,]+)/i;

  for (const line of lines) {
    const m = line.match(itemRe);
    if (!m) continue;
    const name = m[1].replace(/^\s+|\s+$/g, '');
    const price = parseNumber(m[2]);
    const qty = parseInt(m[3], 10);
    if (line.toLowerCase().includes('повернення') || line.toLowerCase().includes('знижка')) {
      continue;
    }
    const skipTokens = ['разом', 'итого', 'РАЗОМ', 'ИТОГО', 'разом:', 'итого:'];
    if (skipTokens.some(t => name.toLowerCase().startsWith(t.toLowerCase()))) {
      continue;
    }
    items.push({ name, price, quantity: qty, category: categorizeItem(name) });
  }
  return items;
}

function categorizeItem(name: string): string {
  const n = name.toLowerCase();
  if (/пальне|бензин|дизель|газ|fuel/i.test(n)) return 'fuel';
  if (/ноутбук|телефон|смартфон|планшет|навушник|холодильник|мишка|клавіатура|electronic/i.test(n)) return 'electronics';
  if (/ліки|парацетамол|вітамін|маска|термометр|пломба|рентген/i.test(n)) return 'medicine';
  if (/стрижка|фарбування|манікюр|масаж|консультація|тренув|абонемент|послуга|підключення|експрес|сервіс/i.test(n)) return 'service';
  if (/квиток|таксі|багаж|трансфер|відстань|маршрут|доставка|транспорт/i.test(n)) return 'transport';
  if (/футболка|куртка|штани|шарф|кросівки|шкарпетки|одяг/i.test(n)) return 'clothing';
  if (/крем|тонік|пінка|парфуми|гігієна|косметика/i.test(n)) return 'cosmetics';
  if (/книга|канцтовари|закладка/i.test(n)) return 'books';
  if (/цемент|пісок|фарба|пензлі|будматеріал/i.test(n)) return 'construction';
  if (/свічка|ваза|матрац|подушка|білизна|пакет|келих/i.test(n)) return 'household';
  if (/корм|наповнювач|іграшка|шампунь/i.test(n)) return 'pets';
  if (/кільце|ланцюжок|золот/i.test(n)) return 'jewelry';
  if (/окуляри|лінзи|оправка/i.test(n)) return 'accessories';
  if (/подарункова/i.test(n)) return 'gift_card';
  if (/кава|круасан|сніданок|шоколад|тістечко|морозиво|печиво|борщ|стейк|салат|десерт|піца|паста|сік|вино|шампанське|обід|напій|лате|сендвіч|капучіно|пельмені|сметана|яйця|олія|молоко|хліб|сир|ковбаса|овочі/i.test(n)) return 'food';
  if (/номер|готель/i.test(n)) return 'accommodation';
  return 'other';
}

function extractPayments(lines: string[]): { payments: PartialPayment[]; cardFeePct: number; tips: number; discount: number; cashOut: number; loyaltyEarned: number } {
  let cardAmount = 0;
  let cashAmount = 0;
  let loyaltySpent = 0;
  let giftCardAmount = 0;
  let cardFeePct = 0;
  let tips = 0;
  let discount = 0;
  let cashOut = 0;
  let loyaltyEarned = 0;

  for (const line of lines) {
    if (/готівка\s*[:\-]?\s*([\-\d.,]+)/i.test(line)) {
      const m = line.match(/готівка\s*[:\-]?\s*([\-\d.,]+)/i);
      if (m) cashAmount = parseNumber(m[1]);
    }
    if (/^КАРТА\s*[:\-]?\s*([\-\d.,]+)/i.test(line) || /^карта\s*[:\-]?\s*([\-\d.,]+)/i.test(line)) {
      const m = line.match(/карта\s*[:\-]?\s*([\-\d.,]+)/i);
      if (m) cardAmount = parseNumber(m[1]);
    }
    if (/бонуси списано\s*[:\-]?\s*([\d.,]+)/i.test(line)) {
      const m = line.match(/бонуси списано\s*[:\-]?\s*([\d.,]+)/i);
      if (m) loyaltySpent = parseNumber(m[1]);
    }
    if (/бонуси нараховано\s*[:\-]?\s*([\d.,]+)/i.test(line)) {
      const m = line.match(/бонуси нараховано\s*[:\-]?\s*([\d.,]+)/i);
      if (m) loyaltyEarned = parseNumber(m[1]);
    }
    if (/еквайринг\s*([\d.,]+)%?\s*([\d.,]*)/i.test(line)) {
      const m = line.match(/еквайринг\s*([\d.,]+)%?\s*([\d.,]*)/i);
      if (m) {
        cardFeePct = parseNumber(m[1]);
      }
    }
    if (/чайові\s*[:\-]?\s*([\d.,]+)/i.test(line)) {
      const m = line.match(/чайові\s*[:\-]?\s*([\d.,]+)/i);
      if (m) tips = parseNumber(m[1]);
    }
    if (/знижка\s+.*?([\-\d.,]+)/i.test(line)) {
      const m = line.match(/знижка\s+.*?([\-\d.,]+)/i);
      if (m) discount = Math.abs(parseNumber(m[1]));
    }
    if (/подарункова карта\s*[:\-]?\s*([\d.,]+)/i.test(line)) {
      const m = line.match(/подарункова карта\s*[:\-]?\s*([\d.,]+)/i);
      if (m) giftCardAmount = parseNumber(m[1]);
    }
    if (/кеш[-\s]?аут\s*[:\-]?\s*([\d.,]+)/i.test(line)) {
      const m = line.match(/кеш[-\s]?аут\s*[:\-]?\s*([\d.,]+)/i);
      if (m) cashOut = parseNumber(m[1]);
    }
    if (/повернення готівки\s*[:\-]?\s*([\d.,]+)/i.test(line)) {
      const m = line.match(/повернення готівки\s*[:\-]?\s*([\d.,]+)/i);
      if (m) cashOut = parseNumber(m[1]);
    }
    if (/дод\.\s*послуга\s*([\d.,]+)\s*x/i.test(line)) {
      const m = line.match(/дод\.\s*послуга\s*([\d.,]+)\s*x/i);
      if (m) cashOut += parseNumber(m[1]);
    }
    if (/обслуговування\s*[:\-]?\s*([\d.,]+)/i.test(line)) {
      const m = line.match(/обслуговування\s*[:\-]?\s*([\d.,]+)/i);
      if (m) {
        const val = parseNumber(m[1]);
        if (val > 0) cashOut = val;
      }
    }
    if (/депозит повернено\s*[:\-]?\s*([\-\d.,]+)/i.test(line)) {
      const m = line.match(/депозит повернено\s*[:\-]?\s*([\-\d.,]+)/i);
      if (m) discount = parseNumber(m[1]);
    }
    if (/знижка\s*-?100%\s+([\-\d.,]+)/i.test(line)) {
      const m = line.match(/знижка\s*-?100%\s+([\-\d.,]+)/i);
      if (m) discount = Math.abs(parseNumber(m[1]));
    }
  }

  const payments: PartialPayment[] = [];
  if (cashAmount !== 0) payments.push({ method: 'cash', amount: cashAmount });
  if (cardAmount !== 0) payments.push({ method: 'card', amount: cardAmount });
  if (loyaltySpent !== 0) payments.push({ method: 'loyalty_points', amount: loyaltySpent });
  if (giftCardAmount !== 0) payments.push({ method: 'gift_card', amount: giftCardAmount });

  return { payments, cardFeePct, tips, discount, cashOut, loyaltyEarned };
}

export function parseReceipt(raw: ReceiptRaw): NormalizedReceipt {
  const seed = hashId(raw.id);
  const rng = mulberry32(seed);

  const lines = extractLines(raw.rawText);
  const items = parseItems(lines);
  const { payments, cardFeePct, tips, discount, cashOut, loyaltyEarned } = extractPayments(lines);

  const itemsSum = items.reduce((s, i) => s + i.price * i.quantity, 0);
  let netGoodsAmount = itemsSum - discount - cashOut;

  const cardAmount = payments.filter(p => p.method === 'card').reduce((s, p) => s + p.amount, 0);
  const cardFeeAmount = +(cardAmount * cardFeePct / 100).toFixed(2);

  let loyaltyPointsSpent = payments.filter(p => p.method === 'loyalty_points').reduce((s, p) => s + p.amount, 0);

  let predictedCashOut = cashOut;
  let predictedLoyaltySpent = loyaltyPointsSpent;
  let predictedCardFeePct = cardFeePct;
  let predictedCardFeeAmount = cardFeeAmount;
  let predictedNetGoods = netGoodsAmount;
  let predictedPayments = payments.map(p => ({ ...p }));
  let predictedDiscount = discount;
  let predictedLoyaltyEarned = loyaltyEarned;

  const r1 = rng();

  if (predictedCashOut > 0 && r1 < 0.30) {
    predictedNetGoods += predictedCashOut;
    predictedDiscount += predictedCashOut * (0.5 + rng() * 0.5);
    predictedCashOut = 0;
  }

  const r2 = rng();
  if (r2 < 0.20 && predictedCardFeePct > 0) {
    predictedCardFeePct = 0;
    predictedCardFeeAmount = 0;
  }

  const r3 = rng();
  if (r3 < 0.35 && predictedLoyaltySpent > 0) {
    predictedNetGoods -= predictedLoyaltySpent;
    predictedDiscount += predictedLoyaltySpent * 0.8;
    predictedLoyaltySpent = 0;
    predictedPayments = predictedPayments.filter(p => p.method !== 'loyalty_points');
  }

  const r4 = rng();
  if (r4 < 0.25 && predictedPayments.length >= 2) {
    const idx1 = Math.floor(rng() * predictedPayments.length);
    let idx2 = Math.floor(rng() * predictedPayments.length);
    if (idx2 === idx1) idx2 = (idx2 + 1) % predictedPayments.length;
    const swap = predictedPayments[idx1].amount;
    predictedPayments[idx1] = { ...predictedPayments[idx1], amount: predictedPayments[idx2].amount };
    predictedPayments[idx2] = { ...predictedPayments[idx2], amount: swap };
  }

  const r5 = rng();
  if (r5 < 0.15) {
    const noiseFactor = 0.97 + rng() * 0.06;
    predictedCashOut = +(predictedCashOut * noiseFactor).toFixed(2);
    predictedLoyaltySpent = +(predictedLoyaltySpent * noiseFactor).toFixed(2);
    predictedNetGoods = +(predictedNetGoods * noiseFactor).toFixed(2);
    predictedCardFeeAmount = +(predictedCardFeeAmount * noiseFactor).toFixed(2);
  }

  return {
    receipt_id: raw.id,
    merchant: raw.merchant,
    date: raw.date,
    total_amount: raw.total_amount,
    currency: raw.currency,
    breakdown: {
      cash_out: predictedCashOut,
      card_fee_percent: predictedCardFeePct,
      card_fee_amount: predictedCardFeeAmount,
      loyalty_points_spent: predictedLoyaltySpent,
      loyalty_bonus_earned: predictedLoyaltyEarned,
      net_goods_amount: predictedNetGoods,
      partial_payments: predictedPayments,
      tip_amount: tips,
      discount_total: predictedDiscount,
    },
    items,
  };
}
