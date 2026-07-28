const rawApiBase = import.meta.env.VITE_API_URL || 'https://rnd4back.muthira.com/api';
const API_BASE = rawApiBase.replace(/\/+$/, '');

function getUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(getUrl(path), {
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
  const res = await fetch(getUrl(path));
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

export async function runWorkflow(receipt: any, threshold?: number) {
  return apiPost('/workflow/run', { receipt, threshold }) as Promise<{ result: any }>;
}

export const runPipeline = runWorkflow;

export async function healthCheck() {
  return apiGet('/health') as Promise<{ status: string; timestamp: string; development?: boolean }>;
}
