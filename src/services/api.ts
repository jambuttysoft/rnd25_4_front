const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error (${res.status}): ${text}`);
  }
  return res.json();
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error (${res.status}): ${await res.text()}`);
  return res.json();
}

export async function ocrReceipt(image: string, filename: string) {
  return apiPost('/ocr', { image, filename }) as Promise<{ receipt: any }>;
}

export async function ragSearch(query: string, topK?: number) {
  return apiPost('/rag/search', { query, topK }) as Promise<{ results: any[] }>;
}

export async function policyCheck(receipt: any) {
  return apiPost('/rag/policy-check', { receipt }) as Promise<{ flags: any[]; ruleChecks: any[]; categories: any[] }>;
}

export async function runPipeline(receipt: any, threshold?: number) {
  return apiPost('/pipeline/run', { receipt, threshold }) as Promise<{ result: any }>;
}

export async function healthCheck() {
  return apiGet('/health') as Promise<{ status: string; timestamp: string; development?: boolean }>;
}
