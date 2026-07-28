import type { ModuleDefinition, ModuleId, Receipt } from "../types/workflow";

const CATEGORY_KEYWORDS: Array<{ keywords: string[]; category: string }> = [
  { keywords: ["fuel", "diesel", "petrol", "unleaded", "gasoline", "gas", "bp", "shell", "ampol"], category: "Fuel" },
  { keywords: ["cafe", "coffee", "lunch", "dinner", "breakfast", "meal", "restaurant", "food", "pizza", "sushi", "sandwich", "burger", "chicken", "beef", "pork", "meat", "sausage", "spinach", "kefir", "yogurt", "cheese", "milk", "bread", "pasta", "fettuccine", "chocolate", "snack", "crisps", "water", "juice", "sparkling", "mince", "cream", "butter", "eggs", "salad", "fruit", "vegetable", "potato", "rice", "sauce", "soup", "bottle", "fresh", "organic", "deli", "bakery", "tortilla", "wrap", "noodle", "ham", "turkey", "bacon", "salami", "muffin", "cake", "cookie", "biscuit", "cereal", "oat", "honey", "jam", "peanut", "almond", "cashew", "walnut", "raisin", "coconut", "avocado", "lemon", "lime", "apple", "banana", "orange", "grape", "berry", "mango", "pineapple", "kiwi", "melon", "peach", "pear", "plum", "corn", "bean", "lentil", "pea", "tofu", "olive", "pickle", "mushroom", "onion", "garlic", "ginger", "chilli", "pepper", "tomato", "cucumber", "lettuce", "cabbage", "broccoli", "cauliflower", "carrot", "celery", "zucchini", "eggplant", "pumpkin"], category: "Food" },
  { keywords: ["taxi", "uber", "lyft", "train", "bus", "tram", "parking", "toll", "metro", "flight", "airport", "airfare", "ticket", "shuttle", "ferry", "cab", "transit", "fare"], category: "Transport" },
  { keywords: ["hotel", "motel", "lodging", "accommodation", "airbnb", "stay", "inn", "resort", "hostel", "booking.com", "expedia"], category: "Accommodation" },
  { keywords: ["course", "workshop", "seminar", "conference", "training", "tuition"], category: "Training" },
  { keywords: ["laptop", "monitor", "cable", "charger", "tool", "equipment", "kit"], category: "Equipment" },
  { keywords: ["stationery", "paper", "pen", "office", "supplies"], category: "Office" },
];

export function inferCategory(description: string): string {
  const lower = description.toLowerCase();
  for (const { keywords, category } of CATEGORY_KEYWORDS) {
    if (keywords.some((k) => {
      // Short keywords (<=4 chars) require word boundary check to avoid partial word matches like "cab" in "cable"
      if (k.length <= 4) {
        const regex = new RegExp(`\\b${k}\\b`, "i");
        return regex.test(lower);
      }
      return lower.includes(k);
    })) return category;
  }
  return "Other";
}

const MERCHANT_POOL: Array<{
  merchant: string;
  date: string;
  lineItems: Array<{ description: string; amount: number; category?: string }>;
  cashOut: boolean;
  loyalty: number;
  cardFee: number;
  changeAmount?: number;
  paidByCard?: number;
  country?: string;
  abn?: string;
  currency?: string;
}> = [
  {
    merchant: "Ampol Fuel & Go",
    date: "2026-07-12",
    lineItems: [
      { description: "Unleaded petrol 38.4L", amount: 72.18, category: "Fuel" },
      { description: "Bottled water", amount: 4.5, category: "Food" },
      { description: "Car wash", amount: 12.0, category: "Other" },
    ],
    cashOut: true,
    loyalty: 320,
    cardFee: 1.62,
  },
  {
    merchant: "Café Lumière",
    date: "2026-07-14",
    lineItems: [
      { description: "Lunch set — grilled chicken", amount: 28.5, category: "Food" },
      { description: "Espresso double", amount: 5.5, category: "Food" },
      { description: "Sparkling water", amount: 4.0, category: "Food" },
    ],
    cashOut: false,
    loyalty: 180,
    cardFee: 0.76,
  },
  {
    merchant: "Metro Taxi Co.",
    date: "2026-07-15",
    lineItems: [
      { description: "Airport transfer 32 km", amount: 64.0, category: "Transport" },
      { description: "Toll — M2 East", amount: 8.4, category: "Transport" },
    ],
    cashOut: false,
    loyalty: 0,
    cardFee: 1.45,
  },
  {
    merchant: "Grand Harbour Hotel",
    date: "2026-07-16",
    lineItems: [
      { description: "Room — 2 nights", amount: 420.0, category: "Accommodation" },
      { description: "Breakfast buffet", amount: 36.0, category: "Food" },
      { description: "Mini bar", amount: 22.5, category: "Food" },
    ],
    cashOut: false,
    loyalty: 600,
    cardFee: 9.57,
  },
  {
    merchant: "TechPro Training",
    date: "2026-07-18",
    lineItems: [
      { description: "Advanced React workshop", amount: 850.0, category: "Training" },
      { description: "Course materials", amount: 45.0, category: "Training" },
    ],
    cashOut: false,
    loyalty: 0,
    cardFee: 17.9,
  },
  {
    merchant: "Officeworks Direct",
    date: "2026-07-19",
    lineItems: [
      { description: "A4 paper 5x500 sheets", amount: 32.0, category: "Office" },
      { description: "Wireless mouse", amount: 38.0, category: "Equipment" },
      { description: "USB-C hub", amount: 65.0, category: "Equipment" },
    ],
    cashOut: false,
    loyalty: 95,
    cardFee: 2.7,
  },
  {
    merchant: "Sky Airlines",
    date: "2026-07-20",
    lineItems: [
      { description: "Domestic flight SYD→MEL", amount: 245.0, category: "Transport" },
      { description: "Seat selection", amount: 18.0, category: "Transport" },
      { description: "In-flight meal", amount: 14.0, category: "Food" },
    ],
    cashOut: false,
    loyalty: 1200,
    cardFee: 5.54,
  },
  {
    merchant: "Woolworths Metro",
    date: "2026-07-21",
    lineItems: [
      { description: "Sandwich pack", amount: 12.5, category: "Food" },
      { description: "Coffee beans 250g", amount: 22.0, category: "Food" },
      { description: "Crisps variety pack", amount: 9.8, category: "Food" },
      { description: "Cash withdrawal", amount: 60.0, category: "Other" },
    ],
    cashOut: true,
    loyalty: 220,
    cardFee: 2.09,
  },
  {
    merchant: "Corner Grocer Express",
    date: "2026-07-23",
    lineItems: [
      { description: "Bread loaf", amount: 4.5, category: "Food" },
      { description: "Bottled water 6-pack", amount: 2.8, category: "Food" },
    ],
    cashOut: true,
    loyalty: 0,
    cardFee: 0.0,
    changeAmount: 20.0,
    paidByCard: 7.30,
  },
  {
    merchant: "DigitalOcean LLC",
    date: "2026-07-24",
    lineItems: [
      { description: "Production droplet — 8 vCPU / 16GB (monthly)", amount: 96.0, category: "Equipment" },
      { description: "Block storage 200GB", amount: 20.0, category: "Equipment" },
      { description: "Bandwidth overage", amount: 4.5, category: "Equipment" },
    ],
    cashOut: false,
    loyalty: 0,
    cardFee: 2.41,
    country: "US",
    abn: undefined,
    currency: "USD",
  },
  {
    merchant: "AWS — Amazon Web Services",
    date: "2026-07-25",
    lineItems: [
      { description: "EC2 m5.large × 720h", amount: 70.56, category: "Equipment" },
      { description: "RDS db.t3.medium × 720h", amount: 48.24, category: "Equipment" },
      { description: "S3 storage 1.2TB", amount: 26.4, category: "Equipment" },
    ],
    cashOut: false,
    loyalty: 0,
    cardFee: 0.0,
    country: "US",
    abn: undefined,
    currency: "USD",
  },
  {
    merchant: "GitHub Inc.",
    date: "2026-07-26",
    lineItems: [
      { description: "Team plan — 12 seats × monthly", amount: 48.0, category: "Office" },
    ],
    cashOut: false,
    loyalty: 0,
    cardFee: 0.96,
    country: "US",
    abn: undefined,
    currency: "USD",
  },
];

let poolCounter = 0;

const FILENAME_TO_TEMPLATE: Record<string, number> = {
  "ampol-receipt-2026-07-12.jpg": 0,
  "cafe-lumiere-lunch.png": 1,
  "metro-taxi-jul15.png": 2,
  "grand-harbour-2nts.jpg": 3,
  "techpro-workshop.png": 4,
};

export function pickReceiptTemplate(seed: string): (typeof MERCHANT_POOL)[number] {
  if (seed in FILENAME_TO_TEMPLATE) {
    return MERCHANT_POOL[FILENAME_TO_TEMPLATE[seed]];
  }
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  poolCounter += 1;
  const idx = (hash + poolCounter) % MERCHANT_POOL.length;
  return MERCHANT_POOL[idx];
}

export function makeReceiptFromTemplate(
  filename: string,
  id: string,
  imageDataUrl?: string,
): Receipt {
  const t = pickReceiptTemplate(filename);
  const subtotal = t.lineItems.reduce((acc, li) => acc + li.amount, 0);
  const total = +(subtotal + t.cardFee).toFixed(2);
  const netGoods = t.changeAmount !== undefined
    ? +(subtotal - t.changeAmount).toFixed(2)
    : +(subtotal - (t.cashOut ? 60 : 0)).toFixed(2);
  return {
    id,
    filename,
    imageDataUrl,
    uploadedAt: new Date().toISOString(),
    ocrStatus: "pending",
    ocrLog: [],
    merchant: t.merchant,
    date: t.date,
    total,
    lineItems: t.lineItems.map((li, i) => ({
      id: `${id}-li-${i}`,
      description: li.description,
      amount: li.amount,
      category: li.category as Receipt["lineItems"][number]["category"],
    })),
    cashOut: t.cashOut,
    loyaltyPointsSpent: t.loyalty,
    cardFeeAmount: t.cardFee,
    netGoodsAmount: netGoods,
    changeAmount: t.changeAmount ?? 0,
    paidByCard: t.paidByCard ?? 0,
    country: t.country ?? "AU",
    abn: t.abn,
    currency: t.currency ?? "AUD",
  };
}

export const MODULES: Record<ModuleId, ModuleDefinition> = {
  "input.receipt": {
    id: "input.receipt",
    type: "input",
    label: "Receipt Data",
    shortLabel: "Input",
    description: "Source of the extracted receipt data. Connects to the chosen OCR result.",
    defaultParams: {},
    paramSchema: [
      {
        key: "source",
        label: "Data source",
        kind: "select",
        options: ["Currently selected receipt", "All uploaded receipts"],
        defaultValue: "Currently selected receipt",
        help: "Choose which receipts feed the workflow.",
      },
    ],
    inputs: 0,
    outputs: 1,
  },
  "validation.cashout": {
    id: "validation.cashout",
    type: "validation",
    label: "Cash-out Detection",
    shortLabel: "Cash-out",
    description: "Flags a receipt when the cash_out field is true. Adds a flag and a separate channel.",
    defaultParams: { threshold: 0, action: "flag" },
    paramSchema: [
      {
        key: "threshold",
        label: "Min cash-out amount",
        kind: "number",
        defaultValue: 0,
        help: "Only flag cash-out above this amount.",
      },
      {
        key: "action",
        label: "Action",
        kind: "select",
        options: ["flag", "block", "annotate"],
        defaultValue: "flag",
      },
    ],
    inputs: 1,
    outputs: 1,
  },
  "validation.categorize": {
    id: "validation.categorize",
    type: "validation",
    label: "Expense Categorization",
    shortLabel: "Categorize",
    description: "Assigns a category to each line item based on keyword rules.",
    defaultParams: {
      categories: [
        { match: "fuel|diesel|petrol", category: "Fuel" },
        { match: "cafe|coffee|lunch|dinner|meal|restaurant", category: "Food" },
        { match: "taxi|uber|train|bus|parking", category: "Transport" },
        { match: "hotel|motel|lodging|stay", category: "Accommodation" },
      ],
      fallback: "Other",
    },
    paramSchema: [
      { key: "fallback", label: "Fallback category", kind: "text", defaultValue: "Other" },
      { key: "rules", label: "Rules", kind: "kvList", defaultValue: [] },
    ],
    inputs: 1,
    outputs: 1,
  },
  "validation.policy": {
    id: "validation.policy",
    type: "validation",
    label: "Policy Compliance",
    shortLabel: "Policy",
    description: "Verifies receipt conforms to company expense policy.",
    defaultParams: {
      maxMeal: 35,
      maxHotelNight: 250,
      maxFuelLitres: 60,
      requireReceiptAbove: 25,
    },
    paramSchema: [
      { key: "maxMeal", label: "Max meal ($)", kind: "number", defaultValue: 35 },
      { key: "maxHotelNight", label: "Max hotel/night ($)", kind: "number", defaultValue: 250 },
      { key: "maxFuelLitres", label: "Max fuel (L)", kind: "number", defaultValue: 60 },
      { key: "requireReceiptAbove", label: "Receipt required above ($)", kind: "number", defaultValue: 25 },
    ],
    inputs: 1,
    outputs: 1,
  },
  "validation.abn": {
    id: "validation.abn",
    type: "validation",
    label: "ABN / Foreign Supplier",
    shortLabel: "ABN Check",
    description: "Flags overseas suppliers and missing Australian Business Numbers. Use before posting foreign-card payments like US cloud servers.",
    defaultParams: {
      requireAbn: true,
      requireAustralian: true,
      abnRequiredAbove: 82.5,
      action: "flag",
    },
    paramSchema: [
      {
        key: "requireAbn",
        label: "Require ABN for AU suppliers",
        kind: "boolean",
        defaultValue: true,
        help: "An ABN is legally required on AU tax invoices over the threshold below.",
      },
      {
        key: "requireAustralian",
        label: "Block non-AU suppliers",
        kind: "boolean",
        defaultValue: false,
        help: "Trip a hard flag when the supplier is based overseas (e.g. AWS, GitHub).",
      },
      {
        key: "abnRequiredAbove",
        label: "ABN required above ($)",
        kind: "number",
        defaultValue: 82.5,
        help: "ATO threshold for tax invoices (GST-inclusive total).",
      },
      {
        key: "action",
        label: "Action",
        kind: "select",
        options: ["flag", "block", "annotate"],
        defaultValue: "flag",
      },
    ],
    inputs: 1,
    outputs: 1,
  },
  "validation.foreign_no_abn": {
    id: "validation.foreign_no_abn",
    type: "validation",
    label: "Foreign Supplier No-ABN Check",
    shortLabel: "Foreign No-ABN",
    description: "Flags overseas suppliers (non-AU) that do not have an Australian Business Number (ABN). Useful for audit compliance and 47% No-ABN withholding tax detection.",
    defaultParams: {
      action: "flag",
      withholdingTaxRate: 47,
    },
    paramSchema: [
      {
        key: "action",
        label: "Action",
        kind: "select",
        options: ["flag", "block", "annotate"],
        defaultValue: "flag",
        help: "Action to take when a foreign vendor lacks an ABN.",
      },
      {
        key: "withholdingTaxRate",
        label: "Withholding tax rate (%)",
        kind: "number",
        defaultValue: 47,
        help: "ATO default withholding rate for suppliers without an ABN.",
      },
    ],
    inputs: 1,
    outputs: 1,
  },
  "logic.ifthen": {
    id: "logic.ifthen",
    type: "logic",
    label: "If-Then Routing",
    shortLabel: "If-Then",
    description: "Routes data based on a field value. True goes one way, false another.",
    defaultParams: { field: "cashOut", equals: true },
    paramSchema: [
      { key: "field", label: "Field", kind: "text", defaultValue: "cashOut" },
      { key: "equals", label: "Equals", kind: "text", defaultValue: "true" },
    ],
    inputs: 1,
    outputs: 2,
  },
  "logic.threshold": {
    id: "logic.threshold",
    type: "logic",
    label: "Three-Way Amount Threshold",
    shortLabel: "Amount Threshold",
    description: "Rule 1: Input receipt total amount → Outputs 3 branches (Less than lower bound, Between lower and upper bound, Greater than upper bound).",
    defaultParams: { field: "total", lowerBound: 25, upperBound: 250 },
    paramSchema: [
      {
        key: "field",
        label: "Numeric field",
        kind: "text",
        defaultValue: "total",
        help: "e.g. total (receipt total amount), netGoodsAmount, cardFeeAmount",
      },
      {
        key: "lowerBound",
        label: "Lower bound ($)",
        kind: "number",
        defaultValue: 25,
        help: "Output 1: Amounts less than this bound (< X).",
      },
      {
        key: "upperBound",
        label: "Upper bound ($)",
        kind: "number",
        defaultValue: 250,
        help: "Output 3: Amounts greater than or equal to this bound (>= Y).",
      },
      {
        key: "inclusive",
        label: "Boundaries inclusive",
        kind: "boolean",
        defaultValue: true,
        help: "When enabled, lower and upper bounds fall into the middle output channel (X..Y).",
      },
    ],
    inputs: 1,
    outputs: 3,
  },
  "logic.compliance_split": {
    id: "logic.compliance_split",
    type: "logic",
    label: "Compliance Risk Splitter",
    shortLabel: "Risk Level Split",
    description: "Rule 2: Input compliance score % → Outputs 3 risk levels (Compliant Pass >= 80%, Review Warning 50-79%, Hard Block Fail < 50%).",
    defaultParams: { warningThreshold: 80, criticalThreshold: 50 },
    paramSchema: [
      {
        key: "warningThreshold",
        label: "Warning threshold (%)",
        kind: "number",
        defaultValue: 80,
        help: "Scores at or above this pass automatically (Compliant).",
      },
      {
        key: "criticalThreshold",
        label: "Critical threshold (%)",
        kind: "number",
        defaultValue: 50,
        help: "Scores below this are hard blocked (Failed). Scores between critical and warning require manual review.",
      },
    ],
    inputs: 1,
    outputs: 3,
  },
  "logic.loop": {
    id: "logic.loop",
    type: "logic",
    label: "Loop over Items",
    shortLabel: "Loop",
    description: "Iterates a sub-flow for each line item. The inner branch runs N times.",
    defaultParams: { over: "lineItems" },
    paramSchema: [
      {
        key: "over",
        label: "Iterate over",
        kind: "select",
        options: ["lineItems"],
        defaultValue: "lineItems",
      },
    ],
    inputs: 1,
    outputs: 1,
  },
  "logic.aggregator": {
    id: "logic.aggregator",
    type: "logic",
    label: "Aggregator",
    shortLabel: "Aggregate",
    description: "Sums totals by category across all line items in the receipt.",
    defaultParams: { groupBy: "category" },
    paramSchema: [
      {
        key: "groupBy",
        label: "Group by",
        kind: "select",
        options: ["category", "merchant"],
        defaultValue: "category",
      },
    ],
    inputs: 1,
    outputs: 1,
  },
  "output.expenseMap": {
    id: "output.expenseMap",
    type: "output",
    label: "Expense Map",
    shortLabel: "Map",
    description: "Produces the final visual report grouped by category.",
    defaultParams: {},
    paramSchema: [
      {
        key: "format",
        label: "Format",
        kind: "select",
        options: ["treemap", "bar", "table"],
        defaultValue: "treemap",
      },
    ],
    inputs: 1,
    outputs: 0,
  },
};

export const MODULE_LIST: ModuleDefinition[] = Object.values(MODULES);
