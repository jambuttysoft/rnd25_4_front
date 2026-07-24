import type { ReceiptRaw, NormalizedReceipt } from './types.js';

// ============================================================
// Сырые тексты чеков (имитация OCR)
// ============================================================
export const SYNTHETIC_RECEIPTS: ReceiptRaw[] = [
  // ── CASH-OUT МАСКИРОВКА (receipts 001-015) ─────────────────────────────
  {
    id: 'receipt_001',
    rawText: `СУПЕРМАРКЕТ "АТБ"
вул. Хрещатик 12
2026-07-22 14:00
-------------------------------
Бізнес-ланч         450.00 x 1 = 450.00
Футболка Zara       550.00 x 1 = 550.00
                     (знижка по карті -50.00)
РАЗОМ:              1050.00
ГОТІВКА:             500.00
КАРТА:               400.00
БОНУСИ СПИСАНО:     150.00
ЕКВАЙРИНГ 1.5%        6.00
ЧАЙОВІ:               50.00`,
    merchant: 'СУПЕРМАРКЕТ "АТБ"',
    date: '2026-07-22T14:00:00Z',
    total_amount: 1050.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_002',
    rawText: `МАГАЗИН ТЕХНІКИ "ФОКСТРОТ"
пр-т Перемоги 45
2026-07-21 18:30
-------------------------------
Ноутбук Lenovo      24999.00 x 1 = 24999.00
Мишка бездротова      899.00 x 1 =   899.00
Консультація          500.00 x 1 =   500.00
РАЗОМ:              26398.00
КАРТА:              26398.00
ЕКВАЙРИНГ 2.0%       527.96
КЕШ-АУТ ПОСЛУГА:    1500.00`,
    merchant: 'МАГАЗИН ТЕХНІКИ "ФОКСТРОТ"',
    date: '2026-07-21T18:30:00Z',
    total_amount: 26398.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_003',
    rawText: `КАФЕ "ВІДЕНСЬКА КАВА"
вул. Саксаганського 78
2026-07-21 09:15
-------------------------------
Капучіно              95.00 x 2 =  190.00
Круасан               75.00 x 1 =   75.00
Пакет "Сніданок"     200.00 x 1 =  200.00
РАЗОМ:               465.00
ГОТІВКА:             465.00
Обслуговування:       0.00`,
    merchant: 'КАФЕ "ВІДЕНСЬКА КАВА"',
    date: '2026-07-21T09:15:00Z',
    total_amount: 465.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_004',
    rawText: `АВТОЗАПРАВКА "ОККО"
траса М06, км 245
2026-07-20 22:40
-------------------------------
Пальне А-95          52.00 x 30 = 1560.00
Кава                   39.00 x 1 =   39.00
Бутерброд              85.00 x 1 =   85.00
Дод. послуга          200.00 x 1 =  200.00
РАЗОМ:              1884.00
КАРТА:              1884.00
ЕКВАЙРИНГ 1.8%        33.91`,
    merchant: 'АВТОЗАПРАВКА "ОККО"',
    date: '2026-07-20T22:40:00Z',
    total_amount: 1884.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_005',
    rawText: `ГОТЕЛЬ "ПРЕМ'ЄР ПАЛАС"
бул. Т. Шевченка 5
2026-07-19 12:00
-------------------------------
Номер люкс          4500.00 x 1 = 4500.00
Міні-бар             350.00 x 1 =  350.00
Сніданок             250.00 x 1 =  250.00
Трансфер             500.00 x 1 =  500.00
РАЗОМ:              5600.00
КАРТА:              5600.00
ЕКВАЙРИНГ 2.5%       140.00
Депозит повернено: -1000.00`,
    merchant: 'ГОТЕЛЬ "ПРЕМ\'ЄР ПАЛАС"',
    date: '2026-07-19T12:00:00Z',
    total_amount: 5600.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_006',
    rawText: `АПТЕКА "ДОБРОГО ДНЯ"
вул. Велика Васильківська 100
2026-07-22 08:45
-------------------------------
Парацетамол           85.00 x 2 =  170.00
Вітамін C            120.00 x 1 =  120.00
Маска медична         15.00 x 10 = 150.00
Термометр            350.00 x 1 =  350.00
Послуга "Експрес"    200.00 x 1 =  200.00
РАЗОМ:               990.00
КАРТА:               990.00
ЕКВАЙРИНГ 1.5%        14.85`,
    merchant: 'АПТЕКА "ДОБРОГО ДНЯ"',
    date: '2026-07-22T08:45:00Z',
    total_amount: 990.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_007',
    rawText: `МАГАЗИН ОДЯГУ "ARGO"
ТРЦ "Гулівер", 3 поверх
2026-07-18 16:20
-------------------------------
Куртка зимова       4500.00 x 1 = 4500.00
Штани                1200.00 x 2 = 2400.00
Шарф                 350.00 x 1 =  350.00
РАЗОМ:              7250.00
КАРТА:              7250.00
ЕКВАЙРИНГ 2.2%       159.50
Повернення готівки: 1000.00`,
    merchant: 'МАГАЗИН ОДЯГУ "ARGO"',
    date: '2026-07-18T16:20:00Z',
    total_amount: 7250.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_008',
    rawText: `РЕСТОРАН "ОДЕСА"
вул. Дерибасівська 12
2026-07-17 20:00
-------------------------------
Салат Грецький       180.00 x 2 =  360.00
Борщ                 120.00 x 1 =  120.00
Стейк                890.00 x 1 =  890.00
Десерт               150.00 x 1 =  150.00
Вино келих           250.00 x 2 =  500.00
РАЗОМ:              2020.00
ГОТІВКА:            1000.00
КАРТА:              1020.00
ЕКВАЙРИНГ 1.8%        18.36
ЧАЙОВІ:              200.00`,
    merchant: 'РЕСТОРАН "ОДЕСА"',
    date: '2026-07-17T20:00:00Z',
    total_amount: 2020.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_009',
    rawText: `БУДІВЕЛЬНИЙ ГІПЕРМАРКЕТ "ЕПІЦЕНТР"
вул. Полярна 20
2026-07-16 11:30
-------------------------------
Цемент М400           95.00 x 10 =  950.00
Пісок річковий        50.00 x 5  =  250.00
Фарба акрилова       350.00 x 3  = 1050.00
Пензлі                45.00 x 2  =   90.00
Доставка              500.00 x 1 =  500.00
РАЗОМ:              2840.00
КАРТА:              2840.00
ЕКВАЙРИНГ 1.5%        42.60`,
    merchant: 'БУДІВЕЛЬНИЙ ГІПЕРМАРКЕТ "ЕПІЦЕНТР"',
    date: '2026-07-16T11:30:00Z',
    total_amount: 2840.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_010',
    rawText: `САЛОН КРАСИ "GLAMOUR"
вул. Костьольна 7
2026-07-15 15:00
-------------------------------
Стрижка жіноча        650.00 x 1 =  650.00
Фарбування          1200.00 x 1 = 1200.00
Манікюр              400.00 x 1 =  400.00
Масаж обличчя        350.00 x 1 =  350.00
РАЗОМ:              2600.00
КАРТА:              2600.00
ЕКВАЙРИНГ 2.0%        52.00`,
    merchant: 'САЛОН КРАСИ "GLAMOUR"',
    date: '2026-07-15T15:00:00Z',
    total_amount: 2600.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_011',
    rawText: `МАГАЗИН "WINE TIME"
вул. Мечникова 3
2026-07-14 19:45
-------------------------------
Вино Chianti         450.00 x 2 =  900.00
Шампанське           380.00 x 1 =  380.00
Келихи подарунк.     150.00 x 2 =  300.00
РАЗОМ:              1580.00
КАРТА:              1580.00
ЕКВАЙРИНГ 1.5%        23.70`,
    merchant: 'МАГАЗИН "WINE TIME"',
    date: '2026-07-14T19:45:00Z',
    total_amount: 1580.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_012',
    rawText: `ЗООМАГАЗИН "ЧОТИРИ ЛАПИ"
вул. Льва Толстого 15
2026-07-13 10:00
-------------------------------
Корм Royal Canin     850.00 x 1 =  850.00
Наповнювач            120.00 x 3 =  360.00
Іграшка               90.00 x 1 =   90.00
Шампунь              180.00 x 1 =  180.00
РАЗОМ:              1480.00
ГОТІВКА:             500.00
КАРТА:               980.00
ЕКВАЙРИНГ 1.8%        17.64`,
    merchant: 'ЗООМАГАЗИН "ЧОТИРИ ЛАПИ"',
    date: '2026-07-13T10:00:00Z',
    total_amount: 1480.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_013',
    rawText: `ТАКСІ "UBER UKRAINE"
Пoїздка #UK-4891
2026-07-22 23:15
-------------------------------
Маршрут: Крещатик -> Борщагівка
Тариф: UberX
Базова вартість:      80.00
Відстань 12.3 км:    147.60
Час 27 хв:            54.00
Збір сервісу:         15.00
РАЗОМ:               296.60
КАРТА:               296.60
ЕКВАЙРИНГ 1.2%         3.56
ЧАЙОВІ:               30.00`,
    merchant: 'ТАКСІ "UBER UKRAINE"',
    date: '2026-07-22T23:15:00Z',
    total_amount: 296.60,
    currency: 'UAH',
  },
  {
    id: 'receipt_014',
    rawText: `КНИГАРНЯ "Є"
вул. Лисенка 3
2026-07-12 13:00
-------------------------------
Книга "Історія"      420.00 x 1 =  420.00
Книга "Фізика"       350.00 x 1 =  350.00
Канцтовари            65.00 x 2 =  130.00
Закладка подарунк.     0.00 x 1 =    0.00
РАЗОМ:               900.00
КАРТА:               900.00
ЕКВАЙРИНГ 1.5%        13.50`,
    merchant: 'КНИГАРНЯ "Є"',
    date: '2026-07-12T13:00:00Z',
    total_amount: 900.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_015',
    rawText: `МАГАЗИН "СІЛЬПО"
вул. Дорогожицька 2
2026-07-11 17:30
-------------------------------
Молоко 1л             42.00 x 3 =  126.00
Хліб                   28.00 x 2 =   56.00
Сир 200г              89.00 x 2 =  178.00
Ковбаса 300г          185.00 x 1 =  185.00
Овочі набір           120.00 x 1 =  120.00
Пакет                  5.00 x 1 =    5.00
РАЗОМ:               670.00
ГОТІВКА:             670.00`,
    merchant: 'МАГАЗИН "СІЛЬПО"',
    date: '2026-07-11T17:30:00Z',
    total_amount: 670.00,
    currency: 'UAH',
  },

  // ── БОНУСИ ЛОЯЛЬНОСТІ (receipts 016-025) ──────────────────────────────
  {
    id: 'receipt_016',
    rawText: `МАГАЗИН "СІЛЬПО"
вул. Антоновича 45
2026-07-22 10:30
-------------------------------
Кава мелена          180.00 x 1 =  180.00
Печиво                65.00 x 2 =  130.00
Шоколад               55.00 x 1 =   55.00
РАЗОМ:               365.00
БОНУСИ СПИСАНО:      365.00
БОНУСИ НАРАХОВАНО:     3.65
ДО СПЛАТИ: 0.00`,
    merchant: 'МАГАЗИН "СІЛЬПО"',
    date: '2026-07-22T10:30:00Z',
    total_amount: 365.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_017',
    rawText: `АПТЕКА "АНЦ"
вул. Володимирська 88
2026-07-20 16:45
-------------------------------
Ліки рецептурні      750.00 x 1 =  750.00
Вітаміни             320.00 x 1 =  320.00
РАЗОМ:              1070.00
КАРТА:               570.00
БОНУСИ СПИСАНО:      500.00
БОНУСИ НАРАХОВАНО:    10.70
ЕКВАЙРИНГ 1.5%         8.55`,
    merchant: 'АПТЕКА "АНЦ"',
    date: '2026-07-20T16:45:00Z',
    total_amount: 1070.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_018',
    rawText: `СУПЕРМАРКЕТ "АТБ"
вул. Перемоги 67
2026-07-19 20:00
-------------------------------
Пельмені              89.00 x 2 =  178.00
Сметана               35.00 x 1 =   35.00
Яйця 10 шт            68.00 x 1 =   68.00
Олія                 120.00 x 1 =  120.00
РАЗОМ:               401.00
КАРТА:               150.00
БОНУСИ СПИСАНО:      251.00
БОНУСИ НАРАХОВАНО:     4.01
ЕКВАЙРИНГ 1.5%         2.25`,
    merchant: 'СУПЕРМАРКЕТ "АТБ"',
    date: '2026-07-19T20:00:00Z',
    total_amount: 401.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_019',
    rawText: `АВТОЗАПРАВКА "WOG"
вул. Борщагівська 154
2026-07-18 07:50
-------------------------------
Пальне А-95          52.50 x 40 = 2100.00
РАЗОМ:              2100.00
КАРТА:              1800.00
БОНУСИ СПИСАНО:      300.00
БОНУСИ НАРАХОВАНО:    21.00
ЕКВАЙРИНГ 1.5%        27.00`,
    merchant: 'АВТОЗАПРАВКА "WOG"',
    date: '2026-07-18T07:50:00Z',
    total_amount: 2100.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_020',
    rawText: `МАГАЗИН "КОСМО"
ТРЦ "Dream Town", 2 поверх
2026-07-17 14:20
-------------------------------
Крем для обличчя     450.00 x 1 =  450.00
Тонік                220.00 x 1 =  220.00
Пінка для вмивання   180.00 x 1 =  180.00
РАЗОМ:               850.00
БОНУСИ СПИСАНО:      850.00
БОНУСИ НАРАХОВАНО:    17.00
ДО СПЛАТИ: 0.00`,
    merchant: 'МАГАЗИН "КОСМО"',
    date: '2026-07-17T14:20:00Z',
    total_amount: 850.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_021',
    rawText: `РЕСТОРАН "МАФІЯ"
вул. Велика Житомирська 20
2026-07-16 21:00
-------------------------------
Піца Маргарита       250.00 x 1 =  250.00
Паста Карбонара      220.00 x 1 =  220.00
Салат Цезар          190.00 x 1 =  190.00
Сік апельсиновий      55.00 x 2 =  110.00
РАЗОМ:               770.00
КАРТА:               400.00
БОНУСИ СПИСАНО:      370.00
БОНУСИ НАРАХОВАНО:     7.70
ЕКВАЙРИНГ 1.8%         7.20
ЧАЙОВІ:               80.00`,
    merchant: 'РЕСТОРАН "МАФІЯ"',
    date: '2026-07-16T21:00:00Z',
    total_amount: 770.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_022',
    rawText: `МАГАЗИН "MOYO"
вул. Степана Бандери 23
2026-07-15 12:30
-------------------------------
Навушники JBL        2500.00 x 1 = 2500.00
Чохол                 300.00 x 1 =  300.00
РАЗОМ:              2800.00
КАРТА:              1800.00
БОНУСИ СПИСАНО:     1000.00
БОНУСИ НАРАХОВАНО:    28.00
ЕКВАЙРИНГ 2.0%        36.00`,
    merchant: 'МАГАЗИН "MOYO"',
    date: '2026-07-15T12:30:00Z',
    total_amount: 2800.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_023',
    rawText: `МАГАЗИН "INTERTOP"
вул. Хрещатик 36
2026-07-14 18:10
-------------------------------
Кросівки Nike       3200.00 x 1 = 3200.00
Шкарпетки             80.00 x 3 =  240.00
РАЗОМ:              3440.00
КАРТА:              2440.00
БОНУСИ СПИСАНО:     1000.00
БОНУСИ НАРАХОВАНО:    68.80
ЕКВАЙРИНГ 1.8%        43.92`,
    merchant: 'МАГАЗИН "INTERTOP"',
    date: '2026-07-14T18:10:00Z',
    total_amount: 3440.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_024',
    rawText: `КАВ'ЯРНЯ "L'KAVA"
вул. Січових Стрільців 10
2026-07-13 08:30
-------------------------------
Лате                  85.00 x 1 =   85.00
Сендвіч              120.00 x 1 =  120.00
Тістечко              65.00 x 1 =   65.00
РАЗОМ:               270.00
БОНУСИ СПИСАНО:      270.00
БОНУСИ НАРАХОВАНО:     2.70
ДО СПЛАТИ: 0.00`,
    merchant: 'КАВ\'ЯРНЯ "L\'KAVA"',
    date: '2026-07-13T08:30:00Z',
    total_amount: 270.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_025',
    rawText: `МАГАЗИН "ЕЛЬДОРАДО"
вул. Глибочицька 40
2026-07-12 19:00
-------------------------------
Пральна машина      12500.00 x 1 =12500.00
Підключення           500.00 x 1 =  500.00
РАЗОМ:             13000.00
КАРТА:             11500.00
БОНУСИ СПИСАНО:     1500.00
БОНУСИ НАРАХОВАНО:   130.00
ЕКВАЙРИНГ 1.5%       172.50`,
    merchant: 'МАГАЗИН "ЕЛЬДОРАДО"',
    date: '2026-07-12T19:00:00Z',
    total_amount: 13000.00,
    currency: 'UAH',
  },

  // ── КОМІСІЇ ЕКВАЙРИНГУ (receipts 026-035) ─────────────────────────────
  {
    id: 'receipt_026',
    rawText: `МАГАЗИН "ROSETKA"
вул. Кирилівська 160
2026-07-22 11:00
-------------------------------
Смартфон Samsung    15999.00 x 1 =15999.00
Захисне скло          350.00 x 1 =  350.00
РАЗОМ:             16349.00
КАРТА:             16349.00
ЕКВАЙРИНГ 1.5%       245.24`,
    merchant: 'МАГАЗИН "ROSETKA"',
    date: '2026-07-22T11:00:00Z',
    total_amount: 16349.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_027',
    rawText: `СТОМАТОЛОГІЯ "ДЕНТАЛ"
вул. Інститутська 22
2026-07-20 15:00
-------------------------------
Консультація          400.00 x 1 =  400.00
Пломба              2500.00 x 1 = 2500.00
Рентген               350.00 x 1 =  350.00
РАЗОМ:              3250.00
КАРТА:              3250.00
ЕКВАЙРИНГ 2.5%        81.25`,
    merchant: 'СТОМАТОЛОГІЯ "ДЕНТАЛ"',
    date: '2026-07-20T15:00:00Z',
    total_amount: 3250.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_028',
    rawText: `ОНЛАЙН-МАГАЗИН "ALLO"
2026-07-19 22:30
-------------------------------
Планшет Apple iPad  22999.00 x 1 =22999.00
Клавіатура           3500.00 x 1 = 3500.00
РАЗОМ:             26499.00
КАРТА:             26499.00
ЕКВАЙРИНГ 1.2%       317.99`,
    merchant: 'ОНЛАЙН-МАГАЗИН "ALLO"',
    date: '2026-07-19T22:30:00Z',
    total_amount: 26499.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_029',
    rawText: `ФІТНЕС-КЛУБ "SPORT LIFE"
вул. Довженка 3
2026-07-18 07:00
-------------------------------
Абонемент місячний  1500.00 x 1 = 1500.00
Персональне тренув.  400.00 x 2 =   800.00
РАЗОМ:              2300.00
КАРТА:              2300.00
ЕКВАЙРИНГ 2.0%        46.00`,
    merchant: 'ФІТНЕС-КЛУБ "SPORT LIFE"',
    date: '2026-07-18T07:00:00Z',
    total_amount: 2300.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_030',
    rawText: `АВІАКАСА "SKYUP"
вул. Грушевського 30
2026-07-17 09:00
-------------------------------
Квиток Київ-Одеса   1200.00 x 2 = 2400.00
Багаж 23кг           350.00 x 2 =  700.00
РАЗОМ:              3100.00
КАРТА:              3100.00
ЕКВАЙРИНГ 2.8%        86.80`,
    merchant: 'АВІАКАСА "SKYUP"',
    date: '2026-07-17T09:00:00Z',
    total_amount: 3100.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_031',
    rawText: `ЮВЕЛІРНИЙ МАГАЗИН "ЗОЛОТИЙ ВІК"
вул. Прорізна 8
2026-07-16 14:00
-------------------------------
Кільце золоте 585   8500.00 x 1 = 8500.00
Ланцюжок золотий    4200.00 x 1 = 4200.00
РАЗОМ:             12700.00
КАРТА:             12700.00
ЕКВАЙРИНГ 2.2%       279.40`,
    merchant: 'ЮВЕЛІРНИЙ МАГАЗИН "ЗОЛОТИЙ ВІК"',
    date: '2026-07-16T14:00:00Z',
    total_amount: 12700.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_032',
    rawText: `МАГАЗИН "COMFY"
ТРЦ "Lavina Mall"
2026-07-15 16:30
-------------------------------
Холодильник Bosch   18999.00 x 1 =18999.00
Гарантія +2 роки     999.00 x 1 =  999.00
РАЗОМ:             19998.00
КАРТА:             19998.00
ЕКВАЙРИНГ 1.5%       299.97`,
    merchant: 'МАГАЗИН "COMFY"',
    date: '2026-07-15T16:30:00Z',
    total_amount: 19998.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_033',
    rawText: `ОПТИКА "ЛЮКСОПТИКА"
вул. Богдана Хмельницького 50
2026-07-14 11:15
-------------------------------
Окуляри Ray-Ban      4500.00 x 1 = 4500.00
Лінзи                1200.00 x 2 = 2400.00
Оправка               600.00 x 1 =  600.00
РАЗОМ:              7500.00
КАРТА:              7500.00
ЕКВАЙРИНГ 1.8%       135.00`,
    merchant: 'ОПТИКА "ЛЮКСОПТИКА"',
    date: '2026-07-14T11:15:00Z',
    total_amount: 7500.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_034',
    rawText: `МАГАЗИН "АТБ-MARKET"
вул. Зоологічна 5
2026-07-13 21:50
-------------------------------
Продукти (21 поз.)                   = 847.32
РАЗОМ:               847.32
КАРТА:               847.32
ЕКВАЙРИНГ 1.5%        12.71`,
    merchant: 'МАГАЗИН "АТБ-MARKET"',
    date: '2026-07-13T21:50:00Z',
    total_amount: 847.32,
    currency: 'UAH',
  },
  {
    id: 'receipt_035',
    rawText: `МАГАЗИН "JYSK"
вул. Вадима Гетьмана 6
2026-07-12 13:45
-------------------------------
Матрац              5500.00 x 1 = 5500.00
Подушка              450.00 x 2 =  900.00
Постільна білизна    800.00 x 1 =  800.00
РАЗОМ:              7200.00
КАРТА:              7200.00
ЕКВАЙРИНГ 2.0%       144.00`,
    merchant: 'МАГАЗИН "JYSK"',
    date: '2026-07-12T13:45:00Z',
    total_amount: 7200.00,
    currency: 'UAH',
  },

  // ── ЧАСТКОВІ ОПЛАТИ (receipts 036-045) ─────────────────────────────────
  {
    id: 'receipt_036',
    rawText: `СУПЕРМАРКЕТ "VARUS"
вул. Щусєва 20
2026-07-22 19:30
-------------------------------
Продукти (15 поз.)                    = 520.50
РАЗОМ:               520.50
ГОТІВКА:             200.00
КАРТА:               320.50
ЕКВАЙРИНГ 1.5%         4.81`,
    merchant: 'СУПЕРМАРКЕТ "VARUS"',
    date: '2026-07-22T19:30:00Z',
    total_amount: 520.50,
    currency: 'UAH',
  },
  {
    id: 'receipt_037',
    rawText: `МАГАЗИН "EVA"
вул. Вишгородська 45
2026-07-21 13:00
-------------------------------
Косметика (8 поз.)                    = 1230.00
РАЗОМ:              1230.00
ГОТІВКА:             300.00
КАРТА:               430.00
БОНУСИ СПИСАНО:      500.00
ЕКВАЙРИНГ 1.5%         6.45`,
    merchant: 'МАГАЗИН "EVA"',
    date: '2026-07-21T13:00:00Z',
    total_amount: 1230.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_038',
    rawText: `МАГАЗИН "ЦУМ"
вул. Хрещатик 38
2026-07-20 16:00
-------------------------------
Парфуми Dior        4200.00 x 1 = 4200.00
РАЗОМ:              4200.00
ГОТІВКА:            1000.00
КАРТА:              2200.00
ПОДАРУНКОВА КАРТА:  1000.00
ЕКВАЙРИНГ 1.8%        39.60`,
    merchant: 'МАГАЗИН "ЦУМ"',
    date: '2026-07-20T16:00:00Z',
    total_amount: 4200.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_039',
    rawText: `РЕСТОРАН "БАРКОМ"
вул. Саксаганського 15
2026-07-19 20:00
-------------------------------
Комплексний обід     280.00 x 2 =  560.00
Напої                 45.00 x 2 =   90.00
РАЗОМ:               650.00
ГОТІВКА:             300.00
КАРТА:               200.00
БОНУСИ СПИСАНО:      150.00
ЕКВАЙРИНГ 1.5%         3.00`,
    merchant: 'РЕСТОРАН "БАРКОМ"',
    date: '2026-07-19T20:00:00Z',
    total_amount: 650.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_040',
    rawText: `МАГАЗИН "WATSONS"
вул. Прорізна 25
2026-07-18 10:45
-------------------------------
Засоби гігієни (6 поз.)               =  475.00
РАЗОМ:               475.00
ГОТІВКА:             100.00
КАРТА:               200.00
БОНУСИ СПИСАНО:      175.00
ЕКВАЙРИНГ 1.5%         3.00`,
    merchant: 'МАГАЗИН "WATSONS"',
    date: '2026-07-18T10:45:00Z',
    total_amount: 475.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_041',
    rawText: `МАГАЗИН "ДОМ І ДЕКОР"
вул. Михайлівська 12
2026-07-17 15:30
-------------------------------
Свічки аромат.       350.00 x 3 = 1050.00
Ваза керамічна       800.00 x 1 =  800.00
РАЗОМ:              1850.00
ГОТІВКА:             850.00
КАРТА:              1000.00
ЕКВАЙРИНГ 1.5%        15.00`,
    merchant: 'МАГАЗИН "ДОМ І ДЕКОР"',
    date: '2026-07-17T15:30:00Z',
    total_amount: 1850.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_042',
    rawText: `МАГАЗИН "PROSTOR"
вул. Коновальця 28
2026-07-16 12:00
-------------------------------
Косметика (5 поз.)                    =  880.00
РАЗОМ:               880.00
ГОТІВКА:             200.00
КАРТА:               380.00
БОНУСИ СПИСАНО:      300.00
ЕКВАЙРИНГ 1.5%         5.70`,
    merchant: 'МАГАЗИН "PROSTOR"',
    date: '2026-07-16T12:00:00Z',
    total_amount: 880.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_043',
    rawText: `КАФЕ "ШОКОЛАДНИЦЯ"
вул. Володимирська 5
2026-07-15 13:30
-------------------------------
Гарячий шоколад      120.00 x 2 =  240.00
Тістечко              85.00 x 2 =  170.00
Морозиво              65.00 x 1 =   65.00
РАЗОМ:               475.00
ГОТІВКА:             200.00
КАРТА:               175.00
БОНУСИ СПИСАНО:      100.00
ЕКВАЙРИНГ 1.5%         2.63`,
    merchant: 'КАФЕ "ШОКОЛАДНИЦЯ"',
    date: '2026-07-15T13:30:00Z',
    total_amount: 475.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_044',
    rawText: `МАГАЗИН "НОВА ЛІНІЯ"
вул. Полярна 14
2026-07-14 16:00
-------------------------------
Будматеріали (4 поз.)                  = 3750.00
РАЗОМ:              3750.00
ГОТІВКА:            1500.00
КАРТА:              2250.00
ЕКВАЙРИНГ 1.5%        33.75`,
    merchant: 'МАГАЗИН "НОВА ЛІНІЯ"',
    date: '2026-07-14T16:00:00Z',
    total_amount: 3750.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_045',
    rawText: `МАГАЗИН "БРОККАРД"
вул. Басейна 9
2026-07-13 18:30
-------------------------------
Парфуми Lancôme     3500.00 x 1 = 3500.00
Пробники               0.00 x 3 =    0.00
РАЗОМ:              3500.00
ГОТІВКА:             500.00
КАРТА:              2000.00
ПОДАРУНКОВА КАРТА:  1000.00
ЕКВАЙРИНГ 1.8%        36.00`,
    merchant: 'МАГАЗИН "БРОККАРД"',
    date: '2026-07-13T18:30:00Z',
    total_amount: 3500.00,
    currency: 'UAH',
  },

  // ── КРАЙНІ ВИПАДКИ (receipts 046-050) ─────────────────────────────────
  {
    id: 'receipt_046',
    rawText: `МАГАЗИН "СІЛЬПО"
вул. Тургенєвська 20
2026-07-22 08:00
-------------------------------
ПОВЕРНЕННЯ ТОВАРУ
Молоко 1л            -42.00 x 3 = -126.00
Хліб                 -28.00 x 1 =  -28.00
РАЗОМ:              -154.00
ГОТІВКА:            -154.00`,
    merchant: 'МАГАЗИН "СІЛЬПО"',
    date: '2026-07-22T08:00:00Z',
    total_amount: -154.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_047',
    rawText: `ОНЛАЙН-МАГАЗИН "AMAZON"
2026-07-15 03:00 UTC
-------------------------------
Електронна книга     129.99 x 1 = $129.99
Доставка              15.99 x 1 =  $15.99
РАЗОМ:              $145.98
КАРТА:              $145.98`,
    merchant: 'ОНЛАЙН-МАГАЗИН "AMAZON"',
    date: '2026-07-15T03:00:00Z',
    total_amount: 145.98,
    currency: 'USD',
  },
  {
    id: 'receipt_048',
    rawText: `МАГАЗИН "ДИТЯЧИЙ СВІТ"
вул. Героїв Дніпра 34
2026-07-14 11:00
-------------------------------
ПОДАРУНКОВА КАРТА
Номінал              500.00 x 1 =  500.00
РАЗОМ:               500.00
КАРТА:               500.00
ЕКВАЙРИНГ 0.0%         0.00`,
    merchant: 'МАГАЗИН "ДИТЯЧИЙ СВІТ"',
    date: '2026-07-14T11:00:00Z',
    total_amount: 500.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_049',
    rawText: `МАГАЗИН "АШАН"
пр-т Гагаріна 21
2026-07-13 22:00
-------------------------------
0 ПОЗИЦІЙ
РАЗОМ:                 0.00`,
    merchant: 'МАГАЗИН "АШАН"',
    date: '2026-07-13T22:00:00Z',
    total_amount: 0.00,
    currency: 'UAH',
  },
  {
    id: 'receipt_050',
    rawText: `МАГАЗИН "ЗНИЖКА 99%"
вул. Куренівська 18
2026-07-12 10:00
-------------------------------
Футболка акція       550.00 x 1 =  550.00
ЗНИЖКА -100%        -550.00
РАЗОМ:                 0.00
БОНУСИ НАРАХОВАНО:     5.50`,
    merchant: 'МАГАЗИН "ЗНИЖКА 99%"',
    date: '2026-07-12T10:00:00Z',
    total_amount: 0.00,
    currency: 'UAH',
  },
];

// ============================================================
// Ground Truth — правильна нормалізована структура кожного чека
// ============================================================
export const GROUND_TRUTH: Record<string, NormalizedReceipt> = {
  receipt_001: {
    receipt_id: 'receipt_001', merchant: 'СУПЕРМАРКЕТ "АТБ"',
    date: '2026-07-22T14:00:00Z', total_amount: 1050.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 1.5, card_fee_amount: 6.00,
      loyalty_points_spent: 150, loyalty_bonus_earned: 0,
      net_goods_amount: 994.00, tip_amount: 50, discount_total: 50,
      partial_payments: [
        { method: 'cash', amount: 500 }, { method: 'card', amount: 400 },
        { method: 'loyalty_points', amount: 150 },
      ],
    },
    items: [
      { name: 'Бізнес-ланч', price: 450, quantity: 1, category: 'food' },
      { name: 'Футболка Zara', price: 550, quantity: 1, category: 'clothing' },
    ],
  },
  receipt_002: {
    receipt_id: 'receipt_002', merchant: 'МАГАЗИН ТЕХНІКИ "ФОКСТРОТ"',
    date: '2026-07-21T18:30:00Z', total_amount: 26398.00, currency: 'UAH',
    breakdown: {
      cash_out: 1500, card_fee_percent: 2.0, card_fee_amount: 527.96,
      loyalty_points_spent: 0, loyalty_bonus_earned: 0,
      net_goods_amount: 24370.04, tip_amount: 0, discount_total: 0,
      partial_payments: [{ method: 'card', amount: 26398 }],
    },
    items: [
      { name: 'Ноутбук Lenovo', price: 24999, quantity: 1, category: 'electronics' },
      { name: 'Мишка бездротова', price: 899, quantity: 1, category: 'electronics' },
      { name: 'Консультація', price: 500, quantity: 1, category: 'service' },
    ],
  },
  receipt_003: {
    receipt_id: 'receipt_003', merchant: 'КАФЕ "ВІДЕНСЬКА КАВА"',
    date: '2026-07-21T09:15:00Z', total_amount: 465.00, currency: 'UAH',
    breakdown: {
      cash_out: 200, card_fee_percent: 0, card_fee_amount: 0,
      loyalty_points_spent: 0, loyalty_bonus_earned: 0,
      net_goods_amount: 265.00, tip_amount: 0, discount_total: 0,
      partial_payments: [{ method: 'cash', amount: 465 }],
    },
    items: [
      { name: 'Капучіно', price: 95, quantity: 2, category: 'food' },
      { name: 'Круасан', price: 75, quantity: 1, category: 'food' },
      { name: 'Пакет "Сніданок"', price: 200, quantity: 1, category: 'food' },
    ],
  },
  receipt_004: {
    receipt_id: 'receipt_004', merchant: 'АВТОЗАПРАВКА "ОККО"',
    date: '2026-07-20T22:40:00Z', total_amount: 1884.00, currency: 'UAH',
    breakdown: {
      cash_out: 200, card_fee_percent: 1.8, card_fee_amount: 33.91,
      loyalty_points_spent: 0, loyalty_bonus_earned: 0,
      net_goods_amount: 1650.09, tip_amount: 0, discount_total: 0,
      partial_payments: [{ method: 'card', amount: 1884 }],
    },
    items: [
      { name: 'Пальне А-95', price: 52, quantity: 30, category: 'fuel' },
      { name: 'Кава', price: 39, quantity: 1, category: 'food' },
      { name: 'Бутерброд', price: 85, quantity: 1, category: 'food' },
      { name: 'Дод. послуга', price: 200, quantity: 1, category: 'service' },
    ],
  },
  receipt_005: {
    receipt_id: 'receipt_005', merchant: 'ГОТЕЛЬ "ПРЕМ\'ЄР ПАЛАС"',
    date: '2026-07-19T12:00:00Z', total_amount: 5600.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 2.5, card_fee_amount: 140.00,
      loyalty_points_spent: 0, loyalty_bonus_earned: 0,
      net_goods_amount: 5460.00, tip_amount: 0, discount_total: -1000,
      partial_payments: [{ method: 'card', amount: 5600 }],
    },
    items: [
      { name: 'Номер люкс', price: 4500, quantity: 1, category: 'accommodation' },
      { name: 'Міні-бар', price: 350, quantity: 1, category: 'food' },
      { name: 'Сніданок', price: 250, quantity: 1, category: 'food' },
      { name: 'Трансфер', price: 500, quantity: 1, category: 'transport' },
    ],
  },
  receipt_006: {
    receipt_id: 'receipt_006', merchant: 'АПТЕКА "ДОБРОГО ДНЯ"',
    date: '2026-07-22T08:45:00Z', total_amount: 990.00, currency: 'UAH',
    breakdown: {
      cash_out: 200, card_fee_percent: 1.5, card_fee_amount: 14.85,
      loyalty_points_spent: 0, loyalty_bonus_earned: 0,
      net_goods_amount: 775.15, tip_amount: 0, discount_total: 0,
      partial_payments: [{ method: 'card', amount: 990 }],
    },
    items: [
      { name: 'Парацетамол', price: 85, quantity: 2, category: 'medicine' },
      { name: 'Вітамін C', price: 120, quantity: 1, category: 'medicine' },
      { name: 'Маска медична', price: 15, quantity: 10, category: 'medicine' },
      { name: 'Термометр', price: 350, quantity: 1, category: 'medicine' },
      { name: 'Послуга "Експрес"', price: 200, quantity: 1, category: 'service' },
    ],
  },
  receipt_007: {
    receipt_id: 'receipt_007', merchant: 'МАГАЗИН ОДЯГУ "ARGO"',
    date: '2026-07-18T16:20:00Z', total_amount: 7250.00, currency: 'UAH',
    breakdown: {
      cash_out: 1000, card_fee_percent: 2.2, card_fee_amount: 159.50,
      loyalty_points_spent: 0, loyalty_bonus_earned: 0,
      net_goods_amount: 6090.50, tip_amount: 0, discount_total: 0,
      partial_payments: [{ method: 'card', amount: 7250 }],
    },
    items: [
      { name: 'Куртка зимова', price: 4500, quantity: 1, category: 'clothing' },
      { name: 'Штани', price: 1200, quantity: 2, category: 'clothing' },
      { name: 'Шарф', price: 350, quantity: 1, category: 'clothing' },
    ],
  },
  receipt_008: {
    receipt_id: 'receipt_008', merchant: 'РЕСТОРАН "ОДЕСА"',
    date: '2026-07-17T20:00:00Z', total_amount: 2020.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 1.8, card_fee_amount: 18.36,
      loyalty_points_spent: 0, loyalty_bonus_earned: 0,
      net_goods_amount: 1801.64, tip_amount: 200, discount_total: 0,
      partial_payments: [
        { method: 'cash', amount: 1000 }, { method: 'card', amount: 1020 },
      ],
    },
    items: [
      { name: 'Салат Грецький', price: 180, quantity: 2, category: 'food' },
      { name: 'Борщ', price: 120, quantity: 1, category: 'food' },
      { name: 'Стейк', price: 890, quantity: 1, category: 'food' },
      { name: 'Десерт', price: 150, quantity: 1, category: 'food' },
      { name: 'Вино келих', price: 250, quantity: 2, category: 'food' },
    ],
  },
  receipt_009: {
    receipt_id: 'receipt_009', merchant: 'БУДІВЕЛЬНИЙ ГІПЕРМАРКЕТ "ЕПІЦЕНТР"',
    date: '2026-07-16T11:30:00Z', total_amount: 2840.00, currency: 'UAH',
    breakdown: {
      cash_out: 500, card_fee_percent: 1.5, card_fee_amount: 42.60,
      loyalty_points_spent: 0, loyalty_bonus_earned: 0,
      net_goods_amount: 2297.40, tip_amount: 0, discount_total: 0,
      partial_payments: [{ method: 'card', amount: 2840 }],
    },
    items: [
      { name: 'Цемент М400', price: 95, quantity: 10, category: 'construction' },
      { name: 'Пісок річковий', price: 50, quantity: 5, category: 'construction' },
      { name: 'Фарба акрилова', price: 350, quantity: 3, category: 'construction' },
      { name: 'Пензлі', price: 45, quantity: 2, category: 'construction' },
      { name: 'Доставка', price: 500, quantity: 1, category: 'service' },
    ],
  },
  receipt_010: {
    receipt_id: 'receipt_010', merchant: 'САЛОН КРАСИ "GLAMOUR"',
    date: '2026-07-15T15:00:00Z', total_amount: 2600.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 2.0, card_fee_amount: 52.00,
      loyalty_points_spent: 0, loyalty_bonus_earned: 0,
      net_goods_amount: 2548.00, tip_amount: 0, discount_total: 0,
      partial_payments: [{ method: 'card', amount: 2600 }],
    },
    items: [
      { name: 'Стрижка жіноча', price: 650, quantity: 1, category: 'service' },
      { name: 'Фарбування', price: 1200, quantity: 1, category: 'service' },
      { name: 'Манікюр', price: 400, quantity: 1, category: 'service' },
      { name: 'Масаж обличчя', price: 350, quantity: 1, category: 'service' },
    ],
  },
  receipt_011: {
    receipt_id: 'receipt_011', merchant: 'МАГАЗИН "WINE TIME"',
    date: '2026-07-14T19:45:00Z', total_amount: 1580.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 1.5, card_fee_amount: 23.70,
      loyalty_points_spent: 0, loyalty_bonus_earned: 0,
      net_goods_amount: 1556.30, tip_amount: 0, discount_total: 0,
      partial_payments: [{ method: 'card', amount: 1580 }],
    },
    items: [
      { name: 'Вино Chianti', price: 450, quantity: 2, category: 'food' },
      { name: 'Шампанське', price: 380, quantity: 1, category: 'food' },
      { name: 'Келихи подарунк.', price: 150, quantity: 2, category: 'household' },
    ],
  },
  receipt_012: {
    receipt_id: 'receipt_012', merchant: 'ЗООМАГАЗИН "ЧОТИРИ ЛАПИ"',
    date: '2026-07-13T10:00:00Z', total_amount: 1480.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 1.8, card_fee_amount: 17.64,
      loyalty_points_spent: 0, loyalty_bonus_earned: 0,
      net_goods_amount: 1462.36, tip_amount: 0, discount_total: 0,
      partial_payments: [
        { method: 'cash', amount: 500 }, { method: 'card', amount: 980 },
      ],
    },
    items: [
      { name: 'Корм Royal Canin', price: 850, quantity: 1, category: 'pets' },
      { name: 'Наповнювач', price: 120, quantity: 3, category: 'pets' },
      { name: 'Іграшка', price: 90, quantity: 1, category: 'pets' },
      { name: 'Шампунь', price: 180, quantity: 1, category: 'pets' },
    ],
  },
  receipt_013: {
    receipt_id: 'receipt_013', merchant: 'ТАКСІ "UBER UKRAINE"',
    date: '2026-07-22T23:15:00Z', total_amount: 296.60, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 1.2, card_fee_amount: 3.56,
      loyalty_points_spent: 0, loyalty_bonus_earned: 0,
      net_goods_amount: 263.04, tip_amount: 30, discount_total: 0,
      partial_payments: [{ method: 'card', amount: 296.60 }],
    },
    items: [
      { name: 'Базова вартість', price: 80, quantity: 1, category: 'transport' },
      { name: 'Відстань 12.3 км', price: 147.60, quantity: 1, category: 'transport' },
      { name: 'Час 27 хв', price: 54, quantity: 1, category: 'transport' },
      { name: 'Збір сервісу', price: 15, quantity: 1, category: 'transport' },
    ],
  },
  receipt_014: {
    receipt_id: 'receipt_014', merchant: 'КНИГАРНЯ "Є"',
    date: '2026-07-12T13:00:00Z', total_amount: 900.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 1.5, card_fee_amount: 13.50,
      loyalty_points_spent: 0, loyalty_bonus_earned: 0,
      net_goods_amount: 886.50, tip_amount: 0, discount_total: 0,
      partial_payments: [{ method: 'card', amount: 900 }],
    },
    items: [
      { name: 'Книга "Історія"', price: 420, quantity: 1, category: 'books' },
      { name: 'Книга "Фізика"', price: 350, quantity: 1, category: 'books' },
      { name: 'Канцтовари', price: 65, quantity: 2, category: 'stationery' },
      { name: 'Закладка подарунк.', price: 0, quantity: 1, category: 'stationery' },
    ],
  },
  receipt_015: {
    receipt_id: 'receipt_015', merchant: 'МАГАЗИН "СІЛЬПО"',
    date: '2026-07-11T17:30:00Z', total_amount: 670.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 0, card_fee_amount: 0,
      loyalty_points_spent: 0, loyalty_bonus_earned: 0,
      net_goods_amount: 670.00, tip_amount: 0, discount_total: 0,
      partial_payments: [{ method: 'cash', amount: 670 }],
    },
    items: [
      { name: 'Молоко 1л', price: 42, quantity: 3, category: 'food' },
      { name: 'Хліб', price: 28, quantity: 2, category: 'food' },
      { name: 'Сир 200г', price: 89, quantity: 2, category: 'food' },
      { name: 'Ковбаса 300г', price: 185, quantity: 1, category: 'food' },
      { name: 'Овочі набір', price: 120, quantity: 1, category: 'food' },
      { name: 'Пакет', price: 5, quantity: 1, category: 'household' },
    ],
  },
  receipt_016: {
    receipt_id: 'receipt_016', merchant: 'МАГАЗИН "СІЛЬПО"',
    date: '2026-07-22T10:30:00Z', total_amount: 365.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 0, card_fee_amount: 0,
      loyalty_points_spent: 365, loyalty_bonus_earned: 3.65,
      net_goods_amount: 365.00, tip_amount: 0, discount_total: 0,
      partial_payments: [{ method: 'loyalty_points', amount: 365 }],
    },
    items: [
      { name: 'Кава мелена', price: 180, quantity: 1, category: 'food' },
      { name: 'Печиво', price: 65, quantity: 2, category: 'food' },
      { name: 'Шоколад', price: 55, quantity: 1, category: 'food' },
    ],
  },
  receipt_017: {
    receipt_id: 'receipt_017', merchant: 'АПТЕКА "АНЦ"',
    date: '2026-07-20T16:45:00Z', total_amount: 1070.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 1.5, card_fee_amount: 8.55,
      loyalty_points_spent: 500, loyalty_bonus_earned: 10.70,
      net_goods_amount: 1061.45, tip_amount: 0, discount_total: 0,
      partial_payments: [
        { method: 'card', amount: 570 }, { method: 'loyalty_points', amount: 500 },
      ],
    },
    items: [
      { name: 'Ліки рецептурні', price: 750, quantity: 1, category: 'medicine' },
      { name: 'Вітаміни', price: 320, quantity: 1, category: 'medicine' },
    ],
  },
  receipt_018: {
    receipt_id: 'receipt_018', merchant: 'СУПЕРМАРКЕТ "АТБ"',
    date: '2026-07-19T20:00:00Z', total_amount: 401.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 1.5, card_fee_amount: 2.25,
      loyalty_points_spent: 251, loyalty_bonus_earned: 4.01,
      net_goods_amount: 398.75, tip_amount: 0, discount_total: 0,
      partial_payments: [
        { method: 'card', amount: 150 }, { method: 'loyalty_points', amount: 251 },
      ],
    },
    items: [
      { name: 'Пельмені', price: 89, quantity: 2, category: 'food' },
      { name: 'Сметана', price: 35, quantity: 1, category: 'food' },
      { name: 'Яйця 10 шт', price: 68, quantity: 1, category: 'food' },
      { name: 'Олія', price: 120, quantity: 1, category: 'food' },
    ],
  },
  receipt_019: {
    receipt_id: 'receipt_019', merchant: 'АВТОЗАПРАВКА "WOG"',
    date: '2026-07-18T07:50:00Z', total_amount: 2100.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 1.5, card_fee_amount: 27.00,
      loyalty_points_spent: 300, loyalty_bonus_earned: 21.00,
      net_goods_amount: 2073.00, tip_amount: 0, discount_total: 0,
      partial_payments: [
        { method: 'card', amount: 1800 }, { method: 'loyalty_points', amount: 300 },
      ],
    },
    items: [
      { name: 'Пальне А-95', price: 52.50, quantity: 40, category: 'fuel' },
    ],
  },
  receipt_020: {
    receipt_id: 'receipt_020', merchant: 'МАГАЗИН "КОСМО"',
    date: '2026-07-17T14:20:00Z', total_amount: 850.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 0, card_fee_amount: 0,
      loyalty_points_spent: 850, loyalty_bonus_earned: 17.00,
      net_goods_amount: 850.00, tip_amount: 0, discount_total: 0,
      partial_payments: [{ method: 'loyalty_points', amount: 850 }],
    },
    items: [
      { name: 'Крем для обличчя', price: 450, quantity: 1, category: 'cosmetics' },
      { name: 'Тонік', price: 220, quantity: 1, category: 'cosmetics' },
      { name: 'Пінка для вмивання', price: 180, quantity: 1, category: 'cosmetics' },
    ],
  },
  receipt_021: {
    receipt_id: 'receipt_021', merchant: 'РЕСТОРАН "МАФІЯ"',
    date: '2026-07-16T21:00:00Z', total_amount: 770.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 1.8, card_fee_amount: 7.20,
      loyalty_points_spent: 370, loyalty_bonus_earned: 7.70,
      net_goods_amount: 682.80, tip_amount: 80, discount_total: 0,
      partial_payments: [
        { method: 'card', amount: 400 }, { method: 'loyalty_points', amount: 370 },
      ],
    },
    items: [
      { name: 'Піца Маргарита', price: 250, quantity: 1, category: 'food' },
      { name: 'Паста Карбонара', price: 220, quantity: 1, category: 'food' },
      { name: 'Салат Цезар', price: 190, quantity: 1, category: 'food' },
      { name: 'Сік апельсиновий', price: 55, quantity: 2, category: 'food' },
    ],
  },
  receipt_022: {
    receipt_id: 'receipt_022', merchant: 'МАГАЗИН "MOYO"',
    date: '2026-07-15T12:30:00Z', total_amount: 2800.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 2.0, card_fee_amount: 36.00,
      loyalty_points_spent: 1000, loyalty_bonus_earned: 28.00,
      net_goods_amount: 2764.00, tip_amount: 0, discount_total: 0,
      partial_payments: [
        { method: 'card', amount: 1800 }, { method: 'loyalty_points', amount: 1000 },
      ],
    },
    items: [
      { name: 'Навушники JBL', price: 2500, quantity: 1, category: 'electronics' },
      { name: 'Чохол', price: 300, quantity: 1, category: 'electronics' },
    ],
  },
  receipt_023: {
    receipt_id: 'receipt_023', merchant: 'МАГАЗИН "INTERTOP"',
    date: '2026-07-14T18:10:00Z', total_amount: 3440.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 1.8, card_fee_amount: 43.92,
      loyalty_points_spent: 1000, loyalty_bonus_earned: 68.80,
      net_goods_amount: 3396.08, tip_amount: 0, discount_total: 0,
      partial_payments: [
        { method: 'card', amount: 2440 }, { method: 'loyalty_points', amount: 1000 },
      ],
    },
    items: [
      { name: 'Кросівки Nike', price: 3200, quantity: 1, category: 'clothing' },
      { name: 'Шкарпетки', price: 80, quantity: 3, category: 'clothing' },
    ],
  },
  receipt_024: {
    receipt_id: 'receipt_024', merchant: 'КАВ\'ЯРНЯ "L\'KAVA"',
    date: '2026-07-13T08:30:00Z', total_amount: 270.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 0, card_fee_amount: 0,
      loyalty_points_spent: 270, loyalty_bonus_earned: 2.70,
      net_goods_amount: 270.00, tip_amount: 0, discount_total: 0,
      partial_payments: [{ method: 'loyalty_points', amount: 270 }],
    },
    items: [
      { name: 'Лате', price: 85, quantity: 1, category: 'food' },
      { name: 'Сендвіч', price: 120, quantity: 1, category: 'food' },
      { name: 'Тістечко', price: 65, quantity: 1, category: 'food' },
    ],
  },
  receipt_025: {
    receipt_id: 'receipt_025', merchant: 'МАГАЗИН "ЕЛЬДОРАДО"',
    date: '2026-07-12T19:00:00Z', total_amount: 13000.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 1.5, card_fee_amount: 172.50,
      loyalty_points_spent: 1500, loyalty_bonus_earned: 130.00,
      net_goods_amount: 12827.50, tip_amount: 0, discount_total: 0,
      partial_payments: [
        { method: 'card', amount: 11500 }, { method: 'loyalty_points', amount: 1500 },
      ],
    },
    items: [
      { name: 'Пральна машина', price: 12500, quantity: 1, category: 'electronics' },
      { name: 'Підключення', price: 500, quantity: 1, category: 'service' },
    ],
  },
  receipt_026: {
    receipt_id: 'receipt_026', merchant: 'МАГАЗИН "ROSETKA"',
    date: '2026-07-22T11:00:00Z', total_amount: 16349.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 1.5, card_fee_amount: 245.24,
      loyalty_points_spent: 0, loyalty_bonus_earned: 0,
      net_goods_amount: 16103.76, tip_amount: 0, discount_total: 0,
      partial_payments: [{ method: 'card', amount: 16349 }],
    },
    items: [
      { name: 'Смартфон Samsung', price: 15999, quantity: 1, category: 'electronics' },
      { name: 'Захисне скло', price: 350, quantity: 1, category: 'electronics' },
    ],
  },
  receipt_027: {
    receipt_id: 'receipt_027', merchant: 'СТОМАТОЛОГІЯ "ДЕНТАЛ"',
    date: '2026-07-20T15:00:00Z', total_amount: 3250.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 2.5, card_fee_amount: 81.25,
      loyalty_points_spent: 0, loyalty_bonus_earned: 0,
      net_goods_amount: 3168.75, tip_amount: 0, discount_total: 0,
      partial_payments: [{ method: 'card', amount: 3250 }],
    },
    items: [
      { name: 'Консультація', price: 400, quantity: 1, category: 'service' },
      { name: 'Пломба', price: 2500, quantity: 1, category: 'service' },
      { name: 'Рентген', price: 350, quantity: 1, category: 'service' },
    ],
  },
  receipt_028: {
    receipt_id: 'receipt_028', merchant: 'ОНЛАЙН-МАГАЗИН "ALLO"',
    date: '2026-07-19T22:30:00Z', total_amount: 26499.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 1.2, card_fee_amount: 317.99,
      loyalty_points_spent: 0, loyalty_bonus_earned: 0,
      net_goods_amount: 26181.01, tip_amount: 0, discount_total: 0,
      partial_payments: [{ method: 'card', amount: 26499 }],
    },
    items: [
      { name: 'Планшет Apple iPad', price: 22999, quantity: 1, category: 'electronics' },
      { name: 'Клавіатура', price: 3500, quantity: 1, category: 'electronics' },
    ],
  },
  receipt_029: {
    receipt_id: 'receipt_029', merchant: 'ФІТНЕС-КЛУБ "SPORT LIFE"',
    date: '2026-07-18T07:00:00Z', total_amount: 2300.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 2.0, card_fee_amount: 46.00,
      loyalty_points_spent: 0, loyalty_bonus_earned: 0,
      net_goods_amount: 2254.00, tip_amount: 0, discount_total: 0,
      partial_payments: [{ method: 'card', amount: 2300 }],
    },
    items: [
      { name: 'Абонемент місячний', price: 1500, quantity: 1, category: 'service' },
      { name: 'Персональне тренув.', price: 400, quantity: 2, category: 'service' },
    ],
  },
  receipt_030: {
    receipt_id: 'receipt_030', merchant: 'АВІАКАСА "SKYUP"',
    date: '2026-07-17T09:00:00Z', total_amount: 3100.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 2.8, card_fee_amount: 86.80,
      loyalty_points_spent: 0, loyalty_bonus_earned: 0,
      net_goods_amount: 3013.20, tip_amount: 0, discount_total: 0,
      partial_payments: [{ method: 'card', amount: 3100 }],
    },
    items: [
      { name: 'Квиток Київ-Одеса', price: 1200, quantity: 2, category: 'transport' },
      { name: 'Багаж 23кг', price: 350, quantity: 2, category: 'transport' },
    ],
  },
  receipt_031: {
    receipt_id: 'receipt_031', merchant: 'ЮВЕЛІРНИЙ МАГАЗИН "ЗОЛОТИЙ ВІК"',
    date: '2026-07-16T14:00:00Z', total_amount: 12700.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 2.2, card_fee_amount: 279.40,
      loyalty_points_spent: 0, loyalty_bonus_earned: 0,
      net_goods_amount: 12420.60, tip_amount: 0, discount_total: 0,
      partial_payments: [{ method: 'card', amount: 12700 }],
    },
    items: [
      { name: 'Кільце золоте 585', price: 8500, quantity: 1, category: 'jewelry' },
      { name: 'Ланцюжок золотий', price: 4200, quantity: 1, category: 'jewelry' },
    ],
  },
  receipt_032: {
    receipt_id: 'receipt_032', merchant: 'МАГАЗИН "COMFY"',
    date: '2026-07-15T16:30:00Z', total_amount: 19998.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 1.5, card_fee_amount: 299.97,
      loyalty_points_spent: 0, loyalty_bonus_earned: 0,
      net_goods_amount: 19698.03, tip_amount: 0, discount_total: 0,
      partial_payments: [{ method: 'card', amount: 19998 }],
    },
    items: [
      { name: 'Холодильник Bosch', price: 18999, quantity: 1, category: 'electronics' },
      { name: 'Гарантія +2 роки', price: 999, quantity: 1, category: 'service' },
    ],
  },
  receipt_033: {
    receipt_id: 'receipt_033', merchant: 'ОПТИКА "ЛЮКСОПТИКА"',
    date: '2026-07-14T11:15:00Z', total_amount: 7500.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 1.8, card_fee_amount: 135.00,
      loyalty_points_spent: 0, loyalty_bonus_earned: 0,
      net_goods_amount: 7365.00, tip_amount: 0, discount_total: 0,
      partial_payments: [{ method: 'card', amount: 7500 }],
    },
    items: [
      { name: 'Окуляри Ray-Ban', price: 4500, quantity: 1, category: 'accessories' },
      { name: 'Лінзи', price: 1200, quantity: 2, category: 'medicine' },
      { name: 'Оправка', price: 600, quantity: 1, category: 'accessories' },
    ],
  },
  receipt_034: {
    receipt_id: 'receipt_034', merchant: 'МАГАЗИН "АТБ-MARKET"',
    date: '2026-07-13T21:50:00Z', total_amount: 847.32, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 1.5, card_fee_amount: 12.71,
      loyalty_points_spent: 0, loyalty_bonus_earned: 0,
      net_goods_amount: 834.61, tip_amount: 0, discount_total: 0,
      partial_payments: [{ method: 'card', amount: 847.32 }],
    },
    items: [
      { name: 'Продукти (21 поз.)', price: 847.32, quantity: 1, category: 'food' },
    ],
  },
  receipt_035: {
    receipt_id: 'receipt_035', merchant: 'МАГАЗИН "JYSK"',
    date: '2026-07-12T13:45:00Z', total_amount: 7200.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 2.0, card_fee_amount: 144.00,
      loyalty_points_spent: 0, loyalty_bonus_earned: 0,
      net_goods_amount: 7056.00, tip_amount: 0, discount_total: 0,
      partial_payments: [{ method: 'card', amount: 7200 }],
    },
    items: [
      { name: 'Матрац', price: 5500, quantity: 1, category: 'household' },
      { name: 'Подушка', price: 450, quantity: 2, category: 'household' },
      { name: 'Постільна білизна', price: 800, quantity: 1, category: 'household' },
    ],
  },
  receipt_036: {
    receipt_id: 'receipt_036', merchant: 'СУПЕРМАРКЕТ "VARUS"',
    date: '2026-07-22T19:30:00Z', total_amount: 520.50, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 1.5, card_fee_amount: 4.81,
      loyalty_points_spent: 0, loyalty_bonus_earned: 0,
      net_goods_amount: 515.69, tip_amount: 0, discount_total: 0,
      partial_payments: [
        { method: 'cash', amount: 200 }, { method: 'card', amount: 320.50 },
      ],
    },
    items: [
      { name: 'Продукти (15 поз.)', price: 520.50, quantity: 1, category: 'food' },
    ],
  },
  receipt_037: {
    receipt_id: 'receipt_037', merchant: 'МАГАЗИН "EVA"',
    date: '2026-07-21T13:00:00Z', total_amount: 1230.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 1.5, card_fee_amount: 6.45,
      loyalty_points_spent: 500, loyalty_bonus_earned: 0,
      net_goods_amount: 1223.55, tip_amount: 0, discount_total: 0,
      partial_payments: [
        { method: 'cash', amount: 300 }, { method: 'card', amount: 430 },
        { method: 'loyalty_points', amount: 500 },
      ],
    },
    items: [
      { name: 'Косметика (8 поз.)', price: 1230, quantity: 1, category: 'cosmetics' },
    ],
  },
  receipt_038: {
    receipt_id: 'receipt_038', merchant: 'МАГАЗИН "ЦУМ"',
    date: '2026-07-20T16:00:00Z', total_amount: 4200.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 1.8, card_fee_amount: 39.60,
      loyalty_points_spent: 0, loyalty_bonus_earned: 0,
      net_goods_amount: 4160.40, tip_amount: 0, discount_total: 0,
      partial_payments: [
        { method: 'cash', amount: 1000 }, { method: 'card', amount: 2200 },
        { method: 'gift_card', amount: 1000 },
      ],
    },
    items: [
      { name: 'Парфуми Dior', price: 4200, quantity: 1, category: 'cosmetics' },
    ],
  },
  receipt_039: {
    receipt_id: 'receipt_039', merchant: 'РЕСТОРАН "БАРКОМ"',
    date: '2026-07-19T20:00:00Z', total_amount: 650.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 1.5, card_fee_amount: 3.00,
      loyalty_points_spent: 150, loyalty_bonus_earned: 0,
      net_goods_amount: 647.00, tip_amount: 0, discount_total: 0,
      partial_payments: [
        { method: 'cash', amount: 300 }, { method: 'card', amount: 200 },
        { method: 'loyalty_points', amount: 150 },
      ],
    },
    items: [
      { name: 'Комплексний обід', price: 280, quantity: 2, category: 'food' },
      { name: 'Напої', price: 45, quantity: 2, category: 'food' },
    ],
  },
  receipt_040: {
    receipt_id: 'receipt_040', merchant: 'МАГАЗИН "WATSONS"',
    date: '2026-07-18T10:45:00Z', total_amount: 475.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 1.5, card_fee_amount: 3.00,
      loyalty_points_spent: 175, loyalty_bonus_earned: 0,
      net_goods_amount: 472.00, tip_amount: 0, discount_total: 0,
      partial_payments: [
        { method: 'cash', amount: 100 }, { method: 'card', amount: 200 },
        { method: 'loyalty_points', amount: 175 },
      ],
    },
    items: [
      { name: 'Засоби гігієни (6 поз.)', price: 475, quantity: 1, category: 'cosmetics' },
    ],
  },
  receipt_041: {
    receipt_id: 'receipt_041', merchant: 'МАГАЗИН "ДОМ І ДЕКОР"',
    date: '2026-07-17T15:30:00Z', total_amount: 1850.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 1.5, card_fee_amount: 15.00,
      loyalty_points_spent: 0, loyalty_bonus_earned: 0,
      net_goods_amount: 1835.00, tip_amount: 0, discount_total: 0,
      partial_payments: [
        { method: 'cash', amount: 850 }, { method: 'card', amount: 1000 },
      ],
    },
    items: [
      { name: 'Свічки аромат.', price: 350, quantity: 3, category: 'household' },
      { name: 'Ваза керамічна', price: 800, quantity: 1, category: 'household' },
    ],
  },
  receipt_042: {
    receipt_id: 'receipt_042', merchant: 'МАГАЗИН "PROSTOR"',
    date: '2026-07-16T12:00:00Z', total_amount: 880.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 1.5, card_fee_amount: 5.70,
      loyalty_points_spent: 300, loyalty_bonus_earned: 0,
      net_goods_amount: 874.30, tip_amount: 0, discount_total: 0,
      partial_payments: [
        { method: 'cash', amount: 200 }, { method: 'card', amount: 380 },
        { method: 'loyalty_points', amount: 300 },
      ],
    },
    items: [
      { name: 'Косметика (5 поз.)', price: 880, quantity: 1, category: 'cosmetics' },
    ],
  },
  receipt_043: {
    receipt_id: 'receipt_043', merchant: 'КАФЕ "ШОКОЛАДНИЦЯ"',
    date: '2026-07-15T13:30:00Z', total_amount: 475.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 1.5, card_fee_amount: 2.63,
      loyalty_points_spent: 100, loyalty_bonus_earned: 0,
      net_goods_amount: 472.37, tip_amount: 0, discount_total: 0,
      partial_payments: [
        { method: 'cash', amount: 200 }, { method: 'card', amount: 175 },
        { method: 'loyalty_points', amount: 100 },
      ],
    },
    items: [
      { name: 'Гарячий шоколад', price: 120, quantity: 2, category: 'food' },
      { name: 'Тістечко', price: 85, quantity: 2, category: 'food' },
      { name: 'Морозиво', price: 65, quantity: 1, category: 'food' },
    ],
  },
  receipt_044: {
    receipt_id: 'receipt_044', merchant: 'МАГАЗИН "НОВА ЛІНІЯ"',
    date: '2026-07-14T16:00:00Z', total_amount: 3750.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 1.5, card_fee_amount: 33.75,
      loyalty_points_spent: 0, loyalty_bonus_earned: 0,
      net_goods_amount: 3716.25, tip_amount: 0, discount_total: 0,
      partial_payments: [
        { method: 'cash', amount: 1500 }, { method: 'card', amount: 2250 },
      ],
    },
    items: [
      { name: 'Будматеріали (4 поз.)', price: 3750, quantity: 1, category: 'construction' },
    ],
  },
  receipt_045: {
    receipt_id: 'receipt_045', merchant: 'МАГАЗИН "БРОККАРД"',
    date: '2026-07-13T18:30:00Z', total_amount: 3500.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 1.8, card_fee_amount: 36.00,
      loyalty_points_spent: 0, loyalty_bonus_earned: 0,
      net_goods_amount: 3464.00, tip_amount: 0, discount_total: 0,
      partial_payments: [
        { method: 'cash', amount: 500 }, { method: 'card', amount: 2000 },
        { method: 'gift_card', amount: 1000 },
      ],
    },
    items: [
      { name: 'Парфуми Lancôme', price: 3500, quantity: 1, category: 'cosmetics' },
      { name: 'Пробники', price: 0, quantity: 3, category: 'cosmetics' },
    ],
  },
  receipt_046: {
    receipt_id: 'receipt_046', merchant: 'МАГАЗИН "СІЛЬПО"',
    date: '2026-07-22T08:00:00Z', total_amount: -154.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 0, card_fee_amount: 0,
      loyalty_points_spent: 0, loyalty_bonus_earned: 0,
      net_goods_amount: -154.00, tip_amount: 0, discount_total: 0,
      partial_payments: [{ method: 'cash', amount: -154 }],
    },
    items: [
      { name: 'Молоко 1л', price: -42, quantity: 3, category: 'food' },
      { name: 'Хліб', price: -28, quantity: 1, category: 'food' },
    ],
  },
  receipt_047: {
    receipt_id: 'receipt_047', merchant: 'ОНЛАЙН-МАГАЗИН "AMAZON"',
    date: '2026-07-15T03:00:00Z', total_amount: 145.98, currency: 'USD',
    breakdown: {
      cash_out: 0, card_fee_percent: 0, card_fee_amount: 0,
      loyalty_points_spent: 0, loyalty_bonus_earned: 0,
      net_goods_amount: 145.98, tip_amount: 0, discount_total: 0,
      partial_payments: [{ method: 'card', amount: 145.98 }],
    },
    items: [
      { name: 'Електронна книга', price: 129.99, quantity: 1, category: 'electronics' },
      { name: 'Доставка', price: 15.99, quantity: 1, category: 'service' },
    ],
  },
  receipt_048: {
    receipt_id: 'receipt_048', merchant: 'МАГАЗИН "ДИТЯЧИЙ СВІТ"',
    date: '2026-07-14T11:00:00Z', total_amount: 500.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 0, card_fee_amount: 0,
      loyalty_points_spent: 0, loyalty_bonus_earned: 0,
      net_goods_amount: 500.00, tip_amount: 0, discount_total: 0,
      partial_payments: [{ method: 'card', amount: 500 }],
    },
    items: [
      { name: 'ПОДАРУНКОВА КАРТА Номінал', price: 500, quantity: 1, category: 'gift_card' },
    ],
  },
  receipt_049: {
    receipt_id: 'receipt_049', merchant: 'МАГАЗИН "АШАН"',
    date: '2026-07-13T22:00:00Z', total_amount: 0.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 0, card_fee_amount: 0,
      loyalty_points_spent: 0, loyalty_bonus_earned: 0,
      net_goods_amount: 0.00, tip_amount: 0, discount_total: 0,
      partial_payments: [],
    },
    items: [],
  },
  receipt_050: {
    receipt_id: 'receipt_050', merchant: 'МАГАЗИН "ЗНИЖКА 99%"',
    date: '2026-07-12T10:00:00Z', total_amount: 0.00, currency: 'UAH',
    breakdown: {
      cash_out: 0, card_fee_percent: 0, card_fee_amount: 0,
      loyalty_points_spent: 0, loyalty_bonus_earned: 5.50,
      net_goods_amount: 0.00, tip_amount: 0, discount_total: 550,
      partial_payments: [],
    },
    items: [
      { name: 'Футболка акція', price: 550, quantity: 1, category: 'clothing' },
    ],
  },
};
