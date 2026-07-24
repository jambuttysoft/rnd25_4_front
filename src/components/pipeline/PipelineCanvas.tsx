import { useCallback, useRef, type DragEvent } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { usePipeline } from "../../state/PipelineContext";
import { ModuleNodeComponent, type ModuleNode } from "./nodes/ModuleNode";
import { RunButton } from "../RunButton";
import { StatusIndicator } from "../StatusIndicator";
import type { CSSProperties } from "react";

const styles: Record<string, CSSProperties> = {
  wrap: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-sm)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 540,
  },
  header: {
    padding: "var(--space-5) var(--space-6)",
    borderBottom: "1px solid var(--color-border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "var(--space-4)",
    background: "var(--color-surface)",
  },
  headerText: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-1)",
  },
  stepBadge: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-accent-deep)",
    letterSpacing: "var(--tracking-widest)",
    textTransform: "uppercase" as const,
    fontWeight: 500,
  },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: "var(--text-2xl)",
    color: "var(--color-ink-strong)",
    lineHeight: 1.1,
    letterSpacing: "var(--tracking-tight)",
  },
  subtitle: {
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    lineHeight: 1.4,
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-3)",
  },
  clearBtn: {
    padding: "var(--space-2) var(--space-3)",
    background: "transparent",
    border: "1px solid var(--color-border-strong)",
    borderRadius: "var(--radius-md)",
    color: "var(--color-ink-muted)",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    cursor: "pointer",
    letterSpacing: "var(--tracking-wider)",
    textTransform: "uppercase" as const,
  },
  canvas: {
    flex: 1,
    background: "var(--color-paper)",
    position: "relative",
  },
  empty: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  emptyInner: {
    textAlign: "center",
    color: "var(--color-ink-muted)",
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-md)",
    padding: "var(--space-7)",
    background: "rgba(255, 255, 255, 0.6)",
    borderRadius: "var(--radius-lg)",
    border: "1px dashed var(--color-border-strong)",
  },
  emptyTitle: {
    fontFamily: "var(--font-display)",
    fontSize: "var(--text-2xl)",
    color: "var(--color-ink-strong)",
    marginBottom: "var(--space-2)",
  },
  footer: {
    padding: "var(--space-3) var(--space-5)",
    borderTop: "1px solid var(--color-border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-wide)",
    background: "var(--color-surface-sunken)",
  },
};

const nodeTypes = { module: ModuleNodeComponent };

function PipelineCanvasInner() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addModuleNode,
    selectNode,
    selectedNodeId,
    runChain,
    clearChain,
    isExecuting,
    selectedReceipt,
  } = usePipeline();
  const rfRef = useRef<{ screenToFlowPosition: (pos: { x: number; y: number }) => { x: number; y: number } } | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const onDragOver = useCallback((e: DragEvent) => {
    if (e.dataTransfer.types.includes("application/x-pipeline-module")) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    }
  }, []);

  const onDrop = useCallback(
    (e: DragEvent) => {
      const moduleId = e.dataTransfer.getData("application/x-pipeline-module");
      if (!moduleId) return;
      e.preventDefault();
      const bounds = wrapRef.current?.getBoundingClientRect();
      if (!bounds || !rfRef.current) {
        addModuleNode(moduleId, { x: 200, y: 200 });
        return;
      }
      const position = rfRef.current.screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });
      addModuleNode(moduleId, position);
    },
    [addModuleNode],
  );

  const handleNodeClick = useCallback(
    (_e: React.MouseEvent, n: { id: string }) => {
      selectNode(n.id);
    },
    [selectNode],
  );

  const handlePaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.headerText}>
          <span style={styles.stepBadge}>STEP 03 — VISUAL CHAIN BUILDER</span>
          <h3 style={styles.title}>Pipeline canvas</h3>
          <span style={styles.subtitle}>
            Drag modules from the toolbox, wire handles, then run the chain.
          </span>
        </div>
        <div style={styles.actions}>
          <StatusIndicator
            status={isExecuting ? "running" : nodes.length === 0 ? "idle" : "complete"}
            label={
              isExecuting
                ? "Executing chain…"
                : nodes.length === 0
                  ? "Empty canvas"
                  : `${nodes.length} node${nodes.length === 1 ? "" : "s"} · ${edges.length} edge${edges.length === 1 ? "" : "s"}`
            }
          />
          <button type="button" style={styles.clearBtn} onClick={clearChain}>
            Clear
          </button>
          <RunButton
            onClick={runChain}
            running={isExecuting}
            label="Run chain"
            runningLabel="Running…"
          />
        </div>
      </div>

      <div
        ref={wrapRef}
        style={styles.canvas}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <ReactFlow
          nodes={nodes as ModuleNode[]}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          nodeTypes={nodeTypes}
          onInit={(instance) => {
            rfRef.current = instance;
          }}
          fitView={nodes.length > 0}
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.4}
          maxZoom={1.6}
          defaultEdgeOptions={{
            animated: true,
            style: { stroke: "var(--color-ink-faint)", strokeWidth: 1.5 },
          }}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            color="var(--color-grid)"
            gap={24}
            size={1}
            variant={BackgroundVariant.Dots}
          />
          <Controls
            showInteractive={false}
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-md)",
            }}
          />
          <MiniMap
            pannable
            zoomable
            nodeColor={(n) => {
              const mod = n.data as { moduleId?: string };
              if (mod?.moduleId?.startsWith("input")) return "var(--mod-input)";
              if (mod?.moduleId?.startsWith("validation")) return "var(--mod-validation)";
              if (mod?.moduleId?.startsWith("logic")) return "var(--mod-logic)";
              if (mod?.moduleId?.startsWith("output")) return "var(--mod-output)";
              return "var(--color-ink-faint)";
            }}
            maskColor="rgba(15, 20, 25, 0.05)"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
            }}
          />
        </ReactFlow>

        {nodes.length === 0 && (
          <div style={styles.empty}>
            <div style={styles.emptyInner}>
              <div style={styles.emptyTitle}>Empty pipeline</div>
              <div>
                Drag a module from the toolbox, or click{" "}
                <strong style={{ color: "var(--color-ink-strong)" }}>Load preset chain</strong>{" "}
                in the sidebar to start.
              </div>
              {!selectedReceipt && (
                <div
                  style={{
                    marginTop: "var(--space-3)",
                    color: "var(--color-warning)",
                    fontSize: "var(--text-xs)",
                  }}
                >
                  Tip: upload a receipt in Step 01 first.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={styles.footer}>
        <span>
          {selectedNodeId
            ? `Selected: ${selectedNodeId.slice(0, 12)}`
            : "Click a node to edit parameters"}
        </span>
        <span>
          {selectedReceipt
            ? `Feeds: ${selectedReceipt.merchant} (${selectedReceipt.lineItems.length} items)`
            : "No receipt selected"}
        </span>
      </div>
    </div>
  );
}

export function PipelineCanvas() {
  return (
    <ReactFlowProvider>
      <PipelineCanvasInner />
    </ReactFlowProvider>
  );
}
