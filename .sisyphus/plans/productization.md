# Plan: Transform Prototype into Production Product

## TL;DR
Add a proper Node.js/Express backend with OpenRouter LLM integration, real OCR via vision model, real RAG pipeline with vector embeddings, and `.env` configuration. Replace all in-memory mocks with real API calls while preserving the existing frontend UI.

---

## Architecture Overview

```
Frontend (Vite + React 19)                    Backend (Express)
    │                                              │
    │  POST /api/ocr                    ┌──────────▼──────────┐
    │  POST /api/rag/search             │  OpenRouter SDK      │
    │  POST /api/rag/policy-check       │  (GPT-4o, Claude)    │
    │  POST /api/pipeline/run           │  Vector storage      │
    │  GET  /api/pipeline/templates     │  (in-memory FTS)     │
    │  POST /api/pipeline/export-je     │  PDF/image parsing   │
    │                                    └──────────▲──────────┘
    │                                               │
    │                                    ┌──────────┴──────────┐
    │                                    │  .env                │
    │                                    │  OPENROUTER_API_KEY  │
    │                                    └─────────────────────┘
```

## Implementation Waves

### Wave 1: Backend Infrastructure
- [ ] 1. Create `server/` directory with Express + TypeScript
- [ ] 2. Add `@openrouter/sdk` and Express dependencies  
- [ ] 3. Create `.env` file for OPENROUTER_API_KEY
- [ ] 4. Create `server/tsconfig.json` for backend
- [ ] 5. Create `server/src/index.ts` — Express entry point

### Wave 2: LLM Services
- [ ] 6. Create `server/src/services/llm.ts` — OpenRouter client wrapper
- [ ] 7. Create `server/src/services/ocr.ts` — Receipt OCR via vision model
- [ ] 8. Create `server/src/services/rag.ts` — RAG pipeline (embeddings + search + policy check)
- [ ] 9. Create `server/src/services/journal.ts` — Journal entry generation

### Wave 3: API Routes
- [ ] 10. Create `server/src/routes/ocr.ts` — POST /api/ocr
- [ ] 11. Create `server/src/routes/rag.ts` — POST /api/rag/search, POST /api/rag/policy-check
- [ ] 12. Create `server/src/routes/pipeline.ts` — POST /api/pipeline/run, GET templates, POST export-je

### Wave 4: Frontend Integration
- [ ] 13. Create `src/services/api.ts` — API client for all backend calls
- [ ] 14. Update `UploadStep.tsx` — call real OCR API instead of simulated
- [ ] 15. Update `PipelineContext.tsx` — call backend for pipeline execution
- [ ] 16. Update `RagInsights.tsx` — call real RAG API instead of static data
- [ ] 17. Update `execute.ts` — keep as fallback, but primary path goes through API

### Wave 5: Production Polish
- [ ] 18. Add error handling and retry logic
- [ ] 19. Add loading indicators for API calls
- [ ] 20. Add `server/package.json` with build/start scripts
- [ ] 21. Update root `package.json` with `npm run dev` (concurrently frontend + backend)
- [ ] 22. Update scientific-paper.md with productization section

---

## Detailed Specifications

### File: `.env`
```
OPENROUTER_API_KEY=sk-or-v1-your-key-here
PORT=3001
```

### File: `server/package.json`
```json
{
  "name": "rnd4-verification-backend",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@openrouter/sdk": "^1.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.0",
    "express": "^4.19.0",
    "multer": "^1.4.5-lts.1",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/multer": "^1.4.11",
    "@types/uuid": "^9.0.8",
    "tsx": "^4.7.0",
    "typescript": "^5.4.0"
  }
}
```

### File: `server/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src"]
}
```

### File: `server/src/index.ts`
- Express app with CORS enabled for localhost:5173
- Body parser (JSON, 50mb limit for images)
- File upload via multer
- Mount API routes
- Serve static frontend in production
- Listen on PORT from env (default 3001)

### File: `server/src/services/llm.ts`
```typescript
import OpenRouter from '@openrouter/sdk';
import 'dotenv/config';

export const client = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY
});

export async function callModel(
  model: string,
  instructions: string,
  input: any,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const result = await client.callModel({
    model,
    instructions,
    input,
    temperature: options?.temperature ?? 0.1,
    maxOutputTokens: options?.maxTokens ?? 2000,
  });
  return result.getText();
}

export async function callVisionModel(
  imageUrl: string,
  prompt: string
): Promise<string> {
  return callModel('openai/gpt-4o', prompt, [
    { type: 'text', text: prompt },
    { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } }
  ]);
}
```

### File: `server/src/services/ocr.ts`
- Accepts base64 image data
- Sends to GPT-4o vision with structured prompt
- Returns structured receipt data matching Receipt interface
- JSON mode via: `Extract the receipt data as JSON matching this schema: {...}`
- Returns: merchant, date, total, line items, cashOut, loyaltyPoints, cardFee, netGoods

**Prompt design:**
```
You are a precise receipt OCR system. Extract the following information from this receipt image.
Return ONLY valid JSON matching this TypeScript interface:

interface Receipt {
  merchant: string;
  date: string;           // DD/MM/YYYY
  total: number;
  lineItems: { id: string; description: string; amount: number }[];
  cashOut: boolean;       // true if cash withdrawal detected
  loyaltyPointsSpent: number;
  cardFeeAmount: number;
  netGoodsAmount: number; // total - cashOut - cardFee - loyalty
}

Rules:
- Cash-out is a hidden cash withdrawal disguised as a discount or service fee
- Card fee is typically a small percentage of card payment
- Net goods = total - cash_out - card_fee - loyalty_points
- Return ALL line items you can identify
- Use "item-{n}" as id format
- Be precise with amounts
```

### File: `server/src/services/rag.ts`

**Policy corpus (create as JSON file):**
- Store the 16 policy documents as `server/data/policies.json`
- Each document: { id, title, paragraphs: { id, text }[] }

**Search implementation:**
- In-memory TF-IDF with simple word frequency vectors
- The 10 synonym groups from the experiment (командировка↔поездка, etc.)
- Cosine similarity search
- Bonus for synonym matches (+0.15 per match, +0.1 for 2+ matches)

**Policy check via LLM:**
```
Given this receipt: {receipt JSON}
And these relevant policy paragraphs: {policy paragraphs}

Check each line item against the policies. Return:
1. Category assignment for each item
2. Policy flags (violations with rule name and message)
3. Compliance score (passed checks / total checks)

Return as valid JSON.
```

### File: `server/src/services/journal.ts`
- Same logic as current `generateJournalEntry` in execute.ts
- Generates JournalEntry with account codes for Xero/QuickBooks
- Returns JSON suitable for import

### File: `server/src/routes/ocr.ts`

```
POST /api/ocr
Body: { image: string (base64), filename: string }
Response: { receiptId, merchant, date, total, lineItems, cashOut, ... }
```

### File: `server/src/routes/rag.ts`

```
POST /api/rag/search
Body: { query: string }
Response: { results: { paragraphId, documentId, text, score }[] }

POST /api/rag/policy-check
Body: { receipt: Receipt }
Response: { categories: LineItem[], flags: PolicyFlag[], complianceSummary: ComplianceSummary }
```

### File: `server/src/routes/pipeline.ts`

```
POST /api/pipeline/run
Body: { receipt: Receipt, nodes: ChainNode[], edges: ChainEdge[], threshold: number }
Response: { result: PipelineResult }

GET /api/pipeline/templates
Response: { templates: PipelineTemplate[] }
```

### File: `src/services/api.ts`

```typescript
const API_BASE = 'http://localhost:3001/api';

export async function ocrReceipt(image: string, filename: string): Promise<Receipt> {
  const res = await fetch(`${API_BASE}/ocr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image, filename }),
  });
  if (!res.ok) throw new Error(`OCR failed: ${res.statusText}`);
  return res.json();
}

// ... similar for ragSearch, policyCheck, runPipeline, getTemplates
```

### File: Modify `src/state/PipelineContext.tsx`
- Replace simulated `uploadReceipt` with real API call to POST /api/ocr
- Replace in-memory `runChain` with API call to POST /api/pipeline/run
- Keep existing state management but use API responses instead of mock data
- Add loading states for API calls

### File: Modify `src/components/pipeline/UploadStep.tsx`
- Keep the same UI (dropzone, sample buttons, OCR progress)
- On drop, send image to real /api/ocr endpoint
- Show real OCR progress (the API returns stages)
- Display extracted data matching the old mock format

### File: Modify `src/components/pipeline/RagInsights.tsx`
- Keep the same UI layout
- Replace static `ragData` import with API call to POST /api/rag/search
- Use real policy search results

### File: Modify `src/utils/pipeline/execute.ts`
- Keep as offline fallback
- Main execution path goes through backend API
- Client-side execution still works for development without backend

---

## Mock Removal Checklist

| Current Mock | Real Implementation |
|-------------|-------------------|
| `pipelineModules.ts` — 20 sample receipts | GPT-4o vision OCR from uploaded image |
| `parserData.ts` — 50 synthetic receipts with errors | Real LLM parsing with controlled confidence |
| `ragData.ts` — 20 static queries | Real TF-IDF search over policy corpus + LLM reranking |
| `perfData.ts` — 4 static configs | Real latency measurement from API calls |
| Simulated OCR logs in `uploadReceipt` | Real OCR stages from vision model |
| `makeReceiptFromTemplate()` | Real extracted receipt data |
| In-memory chain execution | Backend pipeline execution via API |
| In-memory state persistence | Backend persistence (in-memory cache initially) |

---

## Run Commands

```bash
# Development (concurrently)
cd server && npm run dev    # Backend on :3001
cd .. && npm run dev        # Frontend on :5173

# Build for production
cd server && npm run build
cd .. && npm run build
node server/dist/index.js   # Serves frontend from dist-web/
```

---

## File Tree (new files marked with *)
```
RND4/
├── .env *                       # OPENROUTER_API_KEY
├── .gitignore *                 # .env, node_modules
├── server/
│   ├── package.json *
│   ├── tsconfig.json *
│   ├── src/
│   │   ├── index.ts *           # Express entry
│   │   ├── services/
│   │   │   ├── llm.ts *         # OpenRouter wrapper
│   │   │   ├── ocr.ts *         # Vision OCR
│   │   │   ├── rag.ts *         # RAG pipeline
│   │   │   └── journal.ts *     # Journal entry generator
│   │   └── routes/
│   │       ├── ocr.ts *         # POST /api/ocr
│   │       ├── rag.ts *         # POST /api/rag/*
│   │       └── pipeline.ts *    # POST /api/pipeline/*
│   └── data/
│       └── policies.json *      # 16 policy documents
├── src/
│   └── services/
│       └── api.ts *             # Frontend API client
├── docs/
│   └── scientific-paper.md      # Extended with product section
├── package.json                 # Updated with dev script
└── ...rest of frontend
```
