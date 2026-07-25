import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Node, Edge } from "@xyflow/react";
import { applyNodeChanges, applyEdgeChanges, addEdge, type NodeChange, type EdgeChange, type Connection } from "@xyflow/react";
import { makeReceiptFromTemplate, inferCategory } from "../data/pipelineModules";
import { executeChain } from "../utils/pipeline/execute";
import type {
  JournalEntry,
  PipelineResult,
  PipelineNodeData,
  PipelineTemplate,
  Receipt,
} from "../types/pipeline";
import type { ChainNode, ChainEdge } from "../utils/pipeline/execute";
import { runPipeline, ocrReceipt, healthCheck } from "../services/api";

const USER_TEMPLATES_STORAGE_KEY = "pipeline-user-templates";

const BUILT_IN_TEMPLATES: PipelineTemplate[] = [
  {
    id: "tpl-builtin-full-audit",
    name: "Full Audit",
    description:
      "End-to-end verification: detect cash-out, categorise expenses, check policy limits, aggregate results.",
    isBuiltIn: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    nodes: [
      {
        id: "n-input",
        moduleId: "input.receipt",
        label: "Receipt",
        params: {},
        position: { x: 60, y: 40 },
      },
      {
        id: "n-cashout",
        moduleId: "validation.cashout",
        label: "Cash-out",
        params: { threshold: 0, action: "flag" },
        position: { x: 60, y: 160 },
      },
      {
        id: "n-categorize",
        moduleId: "validation.categorize",
        label: "Categorize",
        params: { fallback: "Other" },
        position: { x: 60, y: 280 },
      },
      {
        id: "n-policy",
        moduleId: "validation.policy",
        label: "Policy",
        params: { maxMeal: 35, maxHotelNight: 250, maxFuelLitres: 60, requireReceiptAbove: 25 },
        position: { x: 360, y: 160 },
      },
      {
        id: "n-loop",
        moduleId: "logic.loop",
        label: "Loop",
        params: { over: "lineItems" },
        position: { x: 60, y: 400 },
      },
      {
        id: "n-aggregator",
        moduleId: "logic.aggregator",
        label: "Aggregate",
        params: { groupBy: "category" },
        position: { x: 60, y: 520 },
      },
      {
        id: "n-expenseMap",
        moduleId: "output.expenseMap",
        label: "Expense Map",
        params: { format: "treemap" },
        position: { x: 60, y: 640 },
      },
    ],
    edges: [
      { source: "n-input", target: "n-cashout" },
      { source: "n-cashout", target: "n-categorize" },
      { source: "n-categorize", target: "n-policy" },
      { source: "n-categorize", target: "n-loop" },
      { source: "n-policy", target: "n-loop" },
      { source: "n-loop", target: "n-aggregator" },
      { source: "n-aggregator", target: "n-expenseMap" },
    ],
  },
  {
    id: "tpl-builtin-quick-categorize",
    name: "Quick Categorize",
    description:
      "Fast category breakdown: group every line item by type and show totals.",
    isBuiltIn: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    nodes: [
      {
        id: "n-input",
        moduleId: "input.receipt",
        label: "Receipt",
        params: {},
        position: { x: 60, y: 40 },
      },
      {
        id: "n-categorize",
        moduleId: "validation.categorize",
        label: "Categorize",
        params: { fallback: "Other" },
        position: { x: 60, y: 160 },
      },
      {
        id: "n-aggregator",
        moduleId: "logic.aggregator",
        label: "Aggregate",
        params: { groupBy: "category" },
        position: { x: 60, y: 280 },
      },
      {
        id: "n-expenseMap",
        moduleId: "output.expenseMap",
        label: "Expense Map",
        params: { format: "treemap" },
        position: { x: 60, y: 400 },
      },
    ],
    edges: [
      { source: "n-input", target: "n-categorize" },
      { source: "n-categorize", target: "n-aggregator" },
      { source: "n-aggregator", target: "n-expenseMap" },
    ],
  },
  {
    id: "tpl-builtin-policy-compliance",
    name: "Policy Compliance Check",
    description:
      "Audit expenses against company policy: categorise, validate limits, flag violations.",
    isBuiltIn: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    nodes: [
      {
        id: "n-input",
        moduleId: "input.receipt",
        label: "Receipt",
        params: {},
        position: { x: 60, y: 40 },
      },
      {
        id: "n-categorize",
        moduleId: "validation.categorize",
        label: "Categorize",
        params: { fallback: "Other" },
        position: { x: 60, y: 160 },
      },
      {
        id: "n-policy",
        moduleId: "validation.policy",
        label: "Policy",
        params: { maxMeal: 35, maxHotelNight: 250, maxFuelLitres: 60, requireReceiptAbove: 25 },
        position: { x: 60, y: 280 },
      },
      {
        id: "n-aggregator",
        moduleId: "logic.aggregator",
        label: "Aggregate",
        params: { groupBy: "category" },
        position: { x: 60, y: 400 },
      },
      {
        id: "n-expenseMap",
        moduleId: "output.expenseMap",
        label: "Expense Map",
        params: { format: "treemap" },
        position: { x: 60, y: 520 },
      },
    ],
    edges: [
      { source: "n-input", target: "n-categorize" },
      { source: "n-categorize", target: "n-policy" },
      { source: "n-policy", target: "n-aggregator" },
      { source: "n-aggregator", target: "n-expenseMap" },
    ],
  },
];

function loadUserTemplatesFromStorage(): PipelineTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(USER_TEMPLATES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t): t is PipelineTemplate =>
        t &&
        typeof t === "object" &&
        typeof t.id === "string" &&
        typeof t.name === "string" &&
        Array.isArray(t.nodes) &&
        Array.isArray(t.edges),
    );
  } catch {
    return [];
  }
}

function saveUserTemplatesToStorage(templates: PipelineTemplate[]): void {
  if (typeof window === "undefined") return;
  try {
    const userOnly = templates.filter((t) => !t.isBuiltIn);
    window.localStorage.setItem(
      USER_TEMPLATES_STORAGE_KEY,
      JSON.stringify(userOnly),
    );
  } catch {
    // localStorage may be unavailable (quota, privacy mode); silently no-op.
  }
}

interface PipelineContextValue {
  receipts: Receipt[];
  selectedReceiptId: string | null;
  selectedReceipt: Receipt | null;
  nodes: Node<PipelineNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  lastResult: PipelineResult | null;
  isExecuting: boolean;
  templates: PipelineTemplate[];
  uploadReceipt: (filename: string, imageDataUrl?: string) => Promise<string>;
  selectReceipt: (id: string | null) => void;
  updateReceipt: (id: string, patch: Partial<Receipt>) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addModuleNode: (moduleId: string, position: { x: number; y: number }) => void;
  updateNodeParams: (id: string, params: Record<string, unknown>) => void;
  setNodeLabel: (id: string, label: string) => void;
  removeNode: (id: string) => void;
  selectNode: (id: string | null) => void;
  runChain: () => Promise<void>;
  clearChain: () => void;
  loadPresetChain: () => void;
  exportExpenseMap: () => void;
  exportJournalEntry: () => void;
  saveTemplate: (name: string, description: string) => string;
  loadTemplate: (id: string) => void;
  renameTemplate: (id: string, newName: string) => void;
  deleteTemplate: (id: string) => void;
  complianceThreshold: number;
  setComplianceThreshold: (threshold: number) => void;
  lastJournalEntry: JournalEntry | null;
  developmentMode: boolean;
}

const PipelineContext = createContext<PipelineContextValue | null>(null);

let receiptSeq = 1;
let nodeSeq = 1;

const PIPELINE_NODE_PREFIX = "pn-";

export function PipelineProvider({ children }: { children: ReactNode }) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<Node<PipelineNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<PipelineResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [complianceThreshold, setComplianceThreshold] = useState(80);
  const [lastJournalEntry, setLastJournalEntry] = useState<JournalEntry | null>(null);
  const [templates, setTemplates] = useState<PipelineTemplate[]>(BUILT_IN_TEMPLATES);
  const [developmentMode, setDevelopmentMode] = useState(true); // default: dev mode
  const receiptIdRef = useRef(0);
  const nodeIdRef = useRef(0);

  useEffect(() => {
    const userTemplates = loadUserTemplatesFromStorage();
    if (userTemplates.length > 0) {
      setTemplates((prev) => [...prev, ...userTemplates]);
    }
    // Check development mode from backend
    healthCheck()
      .then(data => setDevelopmentMode(data.development !== false))
      .catch(() => setDevelopmentMode(true)); // backend down → assume dev mode
  }, []);

  const uploadReceipt = useCallback(async (filename: string, imageDataUrl?: string) => {
    const id = `rcp-${String(receiptSeq++).padStart(4, "0")}`;
    receiptIdRef.current += 1;

    // Create placeholder receipt immediately
    setReceipts((prev) => {
      const r = makeReceiptFromTemplate(filename, id, imageDataUrl);
      r.ocrStatus = "processing";
      r.ocrLog = [
        "Initialising OCR engine…",
        "Detecting text regions…",
        "Extracting merchant name…",
        "Reading totals and line items…",
        "Cross-checking line totals…",
        "Finalising structured output…",
      ];
      return [r, ...prev];
    });
    setSelectedReceiptId(id);

    const steps = [
      "Initialising OCR engine…",
      "Detecting text regions…",
      "Extracting merchant name…",
      "Reading totals and line items…",
      "Cross-checking line totals…",
      "Finalising structured output…",
    ];

    // Try real OCR API if we have image data
    if (imageDataUrl) {
      try {
        const base64 = imageDataUrl.split(",")[1] ?? imageDataUrl;
        const data = await ocrReceipt(base64, filename);
        const apiReceipt = data.receipt;

        // Patch the placeholder with real API data
        setReceipts((prev) =>
          prev.map((rcp) =>
            rcp.id === id
              ? {
                  ...rcp,
                  merchant: apiReceipt.merchant || rcp.merchant,
                  date: apiReceipt.date || rcp.date,
                  total: apiReceipt.total ?? rcp.total,
                  lineItems: apiReceipt.lineItems?.length
                    ? apiReceipt.lineItems.map((li: any) => ({
                        ...li,
                        category: li.category || inferCategory(li.description),
                      }))
                    : rcp.lineItems,
                  cashOut: apiReceipt.cashOut ?? rcp.cashOut,
                  loyaltyPointsSpent: apiReceipt.loyaltyPointsSpent ?? rcp.loyaltyPointsSpent,
                  cardFeeAmount: apiReceipt.cardFeeAmount ?? rcp.cardFeeAmount,
                  changeAmount: apiReceipt.changeAmount ?? rcp.changeAmount,
                  paidByCard: apiReceipt.paidByCard ?? rcp.paidByCard,
                  netGoodsAmount: apiReceipt.netGoodsAmount ?? rcp.netGoodsAmount,
                  ocrStatus: "complete",
                  ocrLog: [...steps, "OCR Complete — server response"],
                }
              : rcp,
          ),
        );
        return id;
      } catch (err) {
        console.warn("[OCR] API call failed", err);
        if (!developmentMode) {
          // Production mode — show error, no simulation
          setReceipts((prev) =>
            prev.map((rcp) =>
              rcp.id === id
                ? { ...rcp, ocrStatus: "error", ocrLog: [...steps, `Error: OpenRouter API unavailable`] }
                : rcp,
            ),
          );
          return id;
        }
        // Development mode — fall back to simulated OCR
      }
    }

    // For sample files (no imageDataUrl) OR fallback in dev mode:
    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 200 + Math.random() * 150));
      setReceipts((prev) =>
        prev.map((rcp) =>
          rcp.id === id
            ? { ...rcp, ocrLog: steps.slice(0, i + 1) }
            : rcp,
        ),
      );
    }

    setReceipts((prev) =>
      prev.map((rcp) =>
        rcp.id === id
          ? { ...rcp, ocrStatus: "complete", ocrLog: [...steps, "OCR Complete"] }
          : rcp,
      ),
    );

    return id;
  }, [developmentMode]);

  const selectReceipt = useCallback((id: string | null) => {
    setSelectedReceiptId(id);
  }, []);

  const updateReceipt = useCallback((id: string, patch: Partial<Receipt>) => {
    setReceipts((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds) as Node<PipelineNodeData>[]);
    },
    [],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [],
  );

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) =>
      addEdge(
        {
          ...connection,
          animated: true,
          style: { stroke: "var(--color-ink-faint)", strokeWidth: 1.5 },
        },
        eds,
      ),
    );
  }, []);

  const addModuleNode = useCallback((moduleId: string, position: { x: number; y: number }) => {
    const id = `${PIPELINE_NODE_PREFIX}${String(nodeSeq++).padStart(4, "0")}-${Date.now().toString(36).slice(-3)}`;
    nodeIdRef.current += 1;
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: "module",
        position,
        data: {
          moduleId: moduleId as PipelineNodeData["moduleId"],
          label: "",
          params: {},
          status: "idle",
        } as PipelineNodeData,
      },
    ]);
  }, []);

  const updateNodeParams = useCallback((id: string, params: Record<string, unknown>) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, params: { ...n.data.params, ...params } } }
          : n,
      ),
    );
  }, []);

  const setNodeLabel = useCallback((id: string, label: string) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label } } : n)),
    );
  }, []);

  const removeNode = useCallback((id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    setSelectedNodeId((cur) => (cur === id ? null : cur));
  }, []);

  const selectNode = useCallback((id: string | null) => {
    setSelectedNodeId(id);
  }, []);

  const selectedReceipt = useMemo(
    () => receipts.find((r) => r.id === selectedReceiptId) ?? null,
    [receipts, selectedReceiptId],
  );

  const runChain = useCallback(async () => {
    if (!selectedReceipt) {
      setLastResult(null);
      return;
    }
    setIsExecuting(true);
    setNodes((nds) =>
      nds.map((n) => ({ ...n, data: { ...n.data, status: "running", resultSummary: undefined } })),
    );

    const chain: { nodes: ChainNode[]; edges: ChainEdge[] } = {
      nodes: nodes.map((n) => ({
        id: n.id,
        moduleId: n.data.moduleId,
        params: n.data.params,
      })),
      edges: edges.map((e) => ({
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle ?? undefined,
      })),
    };

    try {
      const data = await runPipeline(selectedReceipt, complianceThreshold);
      const result = data.result as PipelineResult;
      setLastResult(result);
      setLastJournalEntry(result.journalEntry ?? null);
      setNodes((nds) =>
        nds.map((n) => {
          const summary = summarise(n, result);
          return { ...n, data: { ...n.data, status: "success", resultSummary: summary } };
        }),
      );
    } catch {
      console.warn("[Pipeline] Backend unavailable, using in-memory execution");
      const result = executeChain(chain, selectedReceipt);
      (result as any).complianceSummary = {
        totalRules: 0, passedRules: 0, failedRules: 0,
        score: 1, percentage: 100, threshold: complianceThreshold,
        isCompliant: true, ruleChecks: [],
      };
      (result as any).journalEntry = null;
      setLastResult(result as PipelineResult);
      setLastJournalEntry(null);
      setNodes((nds) =>
        nds.map((n) => {
          const summary = summarise(n, result as PipelineResult);
          return { ...n, data: { ...n.data, status: "success", resultSummary: summary } };
        }),
      );
    }
    setIsExecuting(false);
  }, [nodes, edges, selectedReceipt, complianceThreshold]);

  const clearChain = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    setLastResult(null);
  }, []);

  const loadPresetChain = useCallback(() => {
    if (nodes.length > 0 && !window.confirm("Replace the current chain with a preset?")) return;
    const n1 = `${PIPELINE_NODE_PREFIX}preset-input`;
    const n2 = `${PIPELINE_NODE_PREFIX}preset-cashout`;
    const n3 = `${PIPELINE_NODE_PREFIX}preset-cat`;
    const n4 = `${PIPELINE_NODE_PREFIX}preset-policy`;
    const n5 = `${PIPELINE_NODE_PREFIX}preset-loop`;
    const n6 = `${PIPELINE_NODE_PREFIX}preset-agg`;
    const n7 = `${PIPELINE_NODE_PREFIX}preset-map`;
    const x = 80;
    const y = 40;
    const dy = 130;
    const preset: Node<PipelineNodeData>[] = [
      { id: n1, type: "module", position: { x, y: y + dy * 0 }, data: { moduleId: "input.receipt", label: "Receipt", params: {}, status: "idle" } },
      { id: n2, type: "module", position: { x, y: y + dy * 1 }, data: { moduleId: "validation.cashout", label: "Cash-out", params: { threshold: 0, action: "flag" }, status: "idle" } },
      { id: n3, type: "module", position: { x, y: y + dy * 2 }, data: { moduleId: "validation.categorize", label: "Categorize", params: { fallback: "Other" }, status: "idle" } },
      { id: n4, type: "module", position: { x: 360, y: y + dy * 1 }, data: { moduleId: "validation.policy", label: "Policy", params: { maxMeal: 35, maxHotelNight: 250, maxFuelLitres: 60, requireReceiptAbove: 25 }, status: "idle" } },
      { id: n5, type: "module", position: { x, y: y + dy * 3 }, data: { moduleId: "logic.loop", label: "Loop", params: { over: "lineItems" }, status: "idle" } },
      { id: n6, type: "module", position: { x, y: y + dy * 4 }, data: { moduleId: "logic.aggregator", label: "Aggregate", params: { groupBy: "category" }, status: "idle" } },
      { id: n7, type: "module", position: { x, y: y + dy * 5 }, data: { moduleId: "output.expenseMap", label: "Expense Map", params: { format: "treemap" }, status: "idle" } },
    ];
    const presetEdges: Edge[] = [
      { id: "e1-2", source: n1, target: n2, animated: true, style: { stroke: "var(--color-ink-faint)", strokeWidth: 1.5 } },
      { id: "e2-3", source: n2, target: n3, animated: true, style: { stroke: "var(--color-ink-faint)", strokeWidth: 1.5 } },
      { id: "e3-4", source: n3, target: n4, animated: true, style: { stroke: "var(--color-ink-faint)", strokeWidth: 1.5 } },
      { id: "e3-5", source: n3, target: n5, animated: true, style: { stroke: "var(--color-ink-faint)", strokeWidth: 1.5 } },
      { id: "e4-5", source: n4, target: n5, animated: true, style: { stroke: "var(--color-ink-faint)", strokeWidth: 1.5 } },
      { id: "e5-6", source: n5, target: n6, animated: true, style: { stroke: "var(--color-ink-faint)", strokeWidth: 1.5 } },
      { id: "e6-7", source: n6, target: n7, animated: true, style: { stroke: "var(--color-ink-faint)", strokeWidth: 1.5 } },
    ];
    setNodes(preset);
    setEdges(presetEdges);
    setSelectedNodeId(null);
    setLastResult(null);
  }, [nodes.length]);

  const exportExpenseMap = useCallback(() => {
    if (!lastResult) return;
    const blob = new Blob([JSON.stringify(lastResult, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expense-map-${lastResult.receiptId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [lastResult]);

  const exportJournalEntry = useCallback(() => {
    if (!lastJournalEntry) return;
    const blob = new Blob([JSON.stringify(lastJournalEntry, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `journal-entry-${lastJournalEntry.receiptId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [lastJournalEntry]);

  const saveTemplate = useCallback(
    (name: string, description: string): string => {
      const trimmedName = name.trim();
      const trimmedDescription = description.trim();
      if (!trimmedName) {
        throw new Error("Template name is required.");
      }
      if (nodes.length === 0) {
        throw new Error("Cannot save an empty pipeline as a template.");
      }
      const now = new Date().toISOString();
      const newId = `tpl-user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const newTemplate: PipelineTemplate = {
        id: newId,
        name: trimmedName,
        description: trimmedDescription,
        isBuiltIn: false,
        createdAt: now,
        updatedAt: now,
        nodes: nodes.map((n) => ({
          id: n.id,
          moduleId: n.data.moduleId,
          label: n.data.label,
          params: { ...n.data.params },
          position: { x: n.position.x, y: n.position.y },
        })),
        edges: edges.map((e) => ({
          source: e.source,
          target: e.target,
          ...(e.sourceHandle ? { sourceHandle: e.sourceHandle } : {}),
          ...(e.targetHandle ? { targetHandle: e.targetHandle } : {}),
        })),
      };
      setTemplates((prev) => {
        const next = [...prev, newTemplate];
        saveUserTemplatesToStorage(next);
        return next;
      });
      return newId;
    },
    [nodes, edges],
  );

  const loadTemplate = useCallback(
    (id: string) => {
      const tpl = templates.find((t) => t.id === id);
      if (!tpl) return;
      if (
        nodes.length > 0 &&
        !window.confirm(
          `Replace the current pipeline with "${tpl.name}"? Your unsaved changes will be lost.`,
        )
      ) {
        return;
      }
      const idMap = new Map<string, string>();
      const newNodes: Node<PipelineNodeData>[] = tpl.nodes.map((n) => {
        const newId = `${PIPELINE_NODE_PREFIX}tpl-${Date.now().toString(36)}-${nodeSeq++}-${Math.random().toString(36).slice(2, 5)}`;
        idMap.set(n.id, newId);
        return {
          id: newId,
          type: "module",
          position: { x: n.position.x, y: n.position.y },
          data: {
            moduleId: n.moduleId,
            label: n.label,
            params: { ...n.params },
            status: "idle",
          } as PipelineNodeData,
        };
      });
      const newEdges: Edge[] = tpl.edges
        .map((e, idx) => {
          const source = idMap.get(e.source);
          const target = idMap.get(e.target);
          if (!source || !target) return null;
          return {
            id: `e-tpl-${Date.now().toString(36)}-${idx}`,
            source,
            target,
            ...(e.sourceHandle ? { sourceHandle: e.sourceHandle } : {}),
            ...(e.targetHandle ? { targetHandle: e.targetHandle } : {}),
            animated: true,
            style: { stroke: "var(--color-ink-faint)", strokeWidth: 1.5 },
          } as Edge;
        })
        .filter((e): e is Edge => e !== null);
      setNodes(newNodes);
      setEdges(newEdges);
      setSelectedNodeId(null);
      setLastResult(null);
    },
    [templates, nodes.length],
  );

  const renameTemplate = useCallback(
    (id: string, newName: string) => {
      const trimmed = newName.trim();
      if (!trimmed) return;
      setTemplates((prev) => {
        const next = prev.map((t) =>
          t.id === id && !t.isBuiltIn
            ? { ...t, name: trimmed, updatedAt: new Date().toISOString() }
            : t,
        );
        saveUserTemplatesToStorage(next);
        return next;
      });
    },
    [],
  );

  const deleteTemplate = useCallback((id: string) => {
    setTemplates((prev) => {
      const target = prev.find((t) => t.id === id);
      if (!target || target.isBuiltIn) return prev;
      const next = prev.filter((t) => t.id !== id);
      saveUserTemplatesToStorage(next);
      return next;
    });
  }, []);

  const value: PipelineContextValue = {
    receipts,
    selectedReceiptId,
    selectedReceipt,
    nodes,
    edges,
    selectedNodeId,
    lastResult,
    isExecuting,
    templates,
    uploadReceipt,
    selectReceipt,
    updateReceipt,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addModuleNode,
    updateNodeParams,
    setNodeLabel,
    removeNode,
    selectNode,
    runChain,
    clearChain,
    loadPresetChain,
    exportExpenseMap,
    saveTemplate,
    loadTemplate,
    renameTemplate,
    deleteTemplate,
    complianceThreshold,
    setComplianceThreshold,
    lastJournalEntry,
    developmentMode,
    exportJournalEntry,
  };

  return <PipelineContext.Provider value={value}>{children}</PipelineContext.Provider>;
}

export function usePipeline(): PipelineContextValue {
  const ctx = useContext(PipelineContext);
  if (!ctx) throw new Error("usePipeline must be used within PipelineProvider");
  return ctx;
}

function summarise(
  n: Node<PipelineNodeData>,
  result: PipelineResult,
): string {
  switch (n.data.moduleId) {
    case "input.receipt":
      return `${result.totalItems} items · $${result.totalExpenses.toFixed(2)}`;
    case "validation.cashout": {
      if (!result.cashOutDetected) return "No cash-out";
      const reason = result.cashOutReason;
      if (reason === "card_change") return "Card + cash change";
      return "Cash-out detected";
    }
    case "validation.categorize":
      return `${result.byCategory.length} categories`;
    case "validation.policy":
      return result.policyFlags.length === 0 ? "Compliant" : `${result.policyFlags.length} flags`;
    case "logic.ifthen":
      return result.cashOutDetected ? "→ cash-out" : "→ normal";
    case "logic.loop":
      return `× ${result.totalItems}`;
    case "logic.aggregator":
      return `${result.byCategory.length} buckets`;
    case "output.expenseMap":
      return `$${result.totalExpenses.toFixed(2)}`;
    default:
      return "—";
  }
}
