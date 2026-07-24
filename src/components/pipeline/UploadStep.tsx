import { useState, useRef, useCallback, type ChangeEvent, type DragEvent } from "react";
import { usePipeline } from "../../state/PipelineContext";
import { StatusIndicator } from "../StatusIndicator";
import { AU } from "../../utils/format";
import type { CSSProperties } from "react";

const styles: Record<string, CSSProperties> = {
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-5)",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--space-7)",
    boxShadow: "var(--shadow-sm)",
    position: "relative",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "var(--space-4)",
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
    fontSize: "var(--text-sm)",
    color: "var(--color-ink-muted)",
    lineHeight: 1.5,
    maxWidth: 520,
  },
  dropzone: {
    border: "1.5px dashed var(--color-border-strong)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--space-9) var(--space-6)",
    textAlign: "center",
    cursor: "pointer",
    transition: "all var(--duration-base) var(--ease-out)",
    background: "var(--color-surface-sunken)",
    position: "relative",
  },
  dropzoneHover: {
    borderColor: "var(--color-accent)",
    background: "var(--color-accent-soft)",
  },
  dropIcon: {
    width: 48,
    height: 48,
    margin: "0 auto var(--space-4)",
    borderRadius: "var(--radius-md)",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--color-ink-muted)",
  },
  dropTitle: {
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-md)",
    fontWeight: 600,
    color: "var(--color-ink-strong)",
    marginBottom: "var(--space-1)",
  },
  dropHint: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-wide)",
  },
  input: {
    display: "none",
  },
  log: {
    background: "var(--color-ink-strong)",
    color: "var(--color-paper)",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-4)",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    lineHeight: 1.6,
    maxHeight: 180,
    overflowY: "auto" as const,
  },
  logLine: {
    display: "flex",
    alignItems: "baseline",
    gap: "var(--space-3)",
  },
  logTime: {
    color: "var(--color-ink-faint)",
    fontVariantNumeric: "tabular-nums" as const,
    flexShrink: 0,
  },
  logText: {
    color: "var(--color-paper)",
  },
  logTextOk: {
    color: "var(--color-accent)",
  },
  meta: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-5)",
    flexWrap: "wrap" as const,
  },
  metaItem: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  metaLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-wider)",
    textTransform: "uppercase" as const,
  },
  metaValue: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-md)",
    fontWeight: 600,
    color: "var(--color-ink-strong)",
    fontVariantNumeric: "tabular-nums" as const,
  },
  receiptGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "var(--space-4)",
  },
  receiptCard: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-4)",
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-3)",
    cursor: "pointer",
    transition: "all var(--duration-base) var(--ease-out)",
  },
  receiptCardSelected: {
    borderColor: "var(--color-ink-strong)",
    boxShadow: "var(--shadow-md)",
  },
  receiptFilename: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-wide)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  receiptMerchant: {
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-md)",
    fontWeight: 600,
    color: "var(--color-ink-strong)",
    letterSpacing: "var(--tracking-tight)",
  },
  receiptRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "var(--space-3)",
  },
  receiptTotal: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-lg)",
    fontWeight: 600,
    color: "var(--color-ink-strong)",
    fontVariantNumeric: "tabular-nums" as const,
  },
  receiptDate: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
  },
  noReceipts: {
    padding: "var(--space-7)",
    textAlign: "center",
    color: "var(--color-ink-muted)",
    fontStyle: "italic",
  },
};

const SAMPLE_FILES = [
  "ampol-receipt-2026-07-12.jpg",
  "cafe-lumiere-lunch.png",
  "metro-taxi-jul15.png",
  "grand-harbour-2nts.jpg",
  "techpro-workshop.png",
];

export function UploadStep() {
  const { uploadReceipt, receipts, selectedReceiptId, selectReceipt, developmentMode } = usePipeline();
  const [hover, setHover] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<number>(0);
  const [logTick, setLogTick] = useState(0);

  const selected = receipts.find((r) => r.id === selectedReceiptId) ?? null;

  const handleFile = useCallback(
    async (file: File) => {
      if (busy) return;
      setBusy(true);
      startTimeRef.current = performance.now();
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string | undefined;
        await uploadReceipt(file.name, dataUrl);
        setBusy(false);
        setLogTick((t) => t + 1);
      };
      reader.onerror = () => {
        uploadReceipt(file.name).then(() => {
          setBusy(false);
          setLogTick((t) => t + 1);
        });
      };
      if (file.type.startsWith("image/")) {
        reader.readAsDataURL(file);
      } else {
        await uploadReceipt(file.name);
        setBusy(false);
        setLogTick((t) => t + 1);
      }
    },
    [busy, uploadReceipt],
  );

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setHover(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleSample = async (filename: string) => {
    if (busy) return;
    setBusy(true);
    startTimeRef.current = performance.now();
    await uploadReceipt(filename);
    setBusy(false);
    setLogTick((t) => t + 1);
  };

  const isRealOcr = selected?.ocrLog.at(-1)?.includes("server response") ?? false;

  return (
    <div style={styles.section}>
      {selected && !isRealOcr && developmentMode && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          padding: "var(--space-3) var(--space-4)",
          borderRadius: "var(--radius-md)",
          fontSize: "var(--text-xs)",
          fontFamily: "var(--font-mono)",
          letterSpacing: "var(--tracking-wide)",
          background: "var(--color-warning-soft)",
          border: "1px solid var(--color-warning)",
          color: "var(--color-warning)",
        }}>
          <span style={{ fontSize: 14 }}>🟡</span>
          <span style={{ fontWeight: 600 }}>SIMULATION MODE — set OPENROUTER_API_KEY for live OCR</span>
        </div>
      )}

      <div style={styles.header}>
        <div style={styles.headerText}>
          <span style={styles.stepBadge}>STEP 01 — UPLOAD &amp; OCR</span>
          <h3 style={styles.title}>Capture a receipt</h3>
          <p style={styles.subtitle}>
            Drop a receipt image or generate a sample. OCR runs through six progressive
            stages — text region detection, entity extraction, line-item cross-check — and
            saves the structured payload for downstream validation.
          </p>
        </div>
        <StatusIndicator
          status={busy ? "running" : selected?.ocrStatus === "complete" ? "complete" : "idle"}
          label={busy ? "OCR running" : selected?.ocrStatus === "complete" ? "OCR complete" : "Awaiting input"}
        />
      </div>

      <div
        style={{
          ...styles.dropzone,
          ...(hover ? styles.dropzoneHover : {}),
          pointerEvents: busy ? "none" : "auto",
        }}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setHover(true);
        }}
        onDragLeave={() => setHover(false)}
        onDrop={handleDrop}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div style={styles.dropIcon}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={styles.dropTitle}>Drop receipt image here</div>
        <div style={styles.dropHint}>PNG · JPG · up to 10 MB</div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/*"
          style={styles.input}
          onChange={handleInput}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <div className="eyebrow" style={{ paddingLeft: 4 }}>Or generate a sample</div>
        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" as const }}>
          {SAMPLE_FILES.map((f) => (
            <button
              key={f}
              type="button"
              disabled={busy}
              onClick={() => handleSample(f)}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                padding: "6px 10px",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                background: "var(--color-surface)",
                color: "var(--color-ink-muted)",
                cursor: busy ? "wait" : "pointer",
                transition: "all var(--duration-fast) var(--ease-out)",
                opacity: busy ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-ink)";
                e.currentTarget.style.color = "var(--color-ink-strong)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.color = "var(--color-ink-muted)";
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div style={styles.log}>
          {selected.ocrLog.map((line, i) => (
            <div key={`${selected.id}-${i}-${logTick}`} style={styles.logLine}>
              <span style={styles.logTime}>
                {String(Math.floor((i * 0.42))).padStart(2, "0")}.
                {String(((i * 7) % 100)).padStart(2, "0")}s
              </span>
              <span
                style={{
                  ...styles.logText,
                  ...(i === selected.ocrLog.length - 1 ? styles.logTextOk : {}),
                }}
              >
                {line}
              </span>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div style={styles.meta}>
          <div style={styles.metaItem}>
            <span style={styles.metaLabel}>Merchant</span>
            <span style={styles.metaValue}>{selected.merchant}</span>
          </div>
          <div style={styles.metaItem}>
            <span style={styles.metaLabel}>Date</span>
            <span style={styles.metaValue}>{AU.dateString(selected.date)}</span>
          </div>
          <div style={styles.metaItem}>
            <span style={styles.metaLabel}>Total</span>
            <span style={styles.metaValue}>{AU.currency(selected.total)}</span>
          </div>
          <div style={styles.metaItem}>
            <span style={styles.metaLabel}>Items</span>
            <span style={styles.metaValue}>{selected.lineItems.length}</span>
          </div>
          <div style={styles.metaItem}>
            <span style={styles.metaLabel}>Cash-out</span>
            <span style={{ ...styles.metaValue, color: selected.cashOut ? "var(--color-warning)" : "var(--color-success)" }}>
              {selected.cashOut ? "Yes" : "No"}
            </span>
          </div>
        </div>
      )}

      {selected && (
        <details style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
          <summary style={{
            padding: "var(--space-3) var(--space-4)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            color: "var(--color-ink-muted)",
            letterSpacing: "var(--tracking-wider)",
            cursor: "pointer",
            background: "var(--color-surface-sunken)",
            userSelect: "none",
          }}>
            📋 Raw AI response — {selected.ocrLog.at(-1)?.includes("server response") ? "Real GPT-4o" : "Simulated"}
          </summary>
          <pre style={{
            margin: 0,
            padding: "var(--space-4)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            lineHeight: 1.6,
            background: "var(--color-ink-strong)",
            color: "#e8e4dc",
            overflowX: "auto",
            maxHeight: 320,
            whiteSpace: "pre-wrap",
          }}>
{`{
  "id": "${selected.id}",
  "merchant": "${selected.merchant}",
  "date": "${selected.date}",
  "total": ${selected.total},
  "cashOut": ${selected.cashOut},
  "loyaltyPointsSpent": ${selected.loyaltyPointsSpent},
  "cardFeeAmount": ${selected.cardFeeAmount},
  "netGoodsAmount": ${selected.netGoodsAmount},
  "lineItems": [
${selected.lineItems.map((li, i) => `    { "id": "${li.id}", "description": "${li.description}", "amount": ${li.amount} }`).join(",\n")}
  ],
  "ocrStatus": "${selected.ocrStatus}",
  "ocrSource": "${selected.ocrLog.at(-1)?.includes("server response") ? "GPT-4o Vision API" : "Local simulation (no API key)"}"
}`}
          </pre>
        </details>
      )}

      {receipts.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <div className="eyebrow" style={{ paddingLeft: 4 }}>Uploaded receipts</div>
          <div style={styles.receiptGrid}>
            {receipts.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => selectReceipt(r.id)}
                style={{
                  ...styles.receiptCard,
                  ...(selectedReceiptId === r.id ? styles.receiptCardSelected : {}),
                  textAlign: "left",
                }}
              >
                <div style={styles.receiptFilename}>{r.filename}</div>
                <div style={styles.receiptMerchant}>{r.merchant}</div>
                <div style={styles.receiptRow}>
                  <span style={styles.receiptDate}>{AU.dateString(r.date)}</span>
                  <span style={styles.receiptTotal}>{AU.currency(r.total)}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <StatusIndicator
                    status={r.ocrStatus === "processing" ? "running" : r.ocrStatus === "complete" ? "complete" : "idle"}
                    label={`${r.lineItems.length} items`}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {receipts.length === 0 && !busy && (
        <div style={styles.noReceipts}>
          No receipts yet — drop a file or click a sample above.
        </div>
      )}
    </div>
  );
}
