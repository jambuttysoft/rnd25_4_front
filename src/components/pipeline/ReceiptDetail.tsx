import { usePipeline } from "../../state/PipelineContext";
import { StatusIndicator } from "../StatusIndicator";
import { AU } from "../../utils/format";
import { CATEGORY_COLOR_VARS, EXPENSE_CATEGORIES } from "../../types/pipeline";
import type { CSSProperties, ReactNode } from "react";

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
  select: {
    padding: "var(--space-3) var(--space-4)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    background: "var(--color-surface)",
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-sm)",
    color: "var(--color-ink)",
    cursor: "pointer",
    minWidth: 280,
  },
  card: {
    background: "var(--color-surface-sunken)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-5)",
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-4)",
  },
  topRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "var(--space-5)",
  },
  merchantBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-1)",
  },
  merchant: {
    fontFamily: "var(--font-display)",
    fontSize: "var(--text-3xl)",
    color: "var(--color-ink-strong)",
    lineHeight: 1.1,
    letterSpacing: "var(--tracking-tight)",
  },
  filename: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-wide)",
  },
  total: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 2,
  },
  totalLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-wider)",
    textTransform: "uppercase" as const,
  },
  totalValue: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-4xl)",
    fontWeight: 600,
    color: "var(--color-ink-strong)",
    lineHeight: 1,
    letterSpacing: "var(--tracking-tight)",
    fontVariantNumeric: "tabular-nums" as const,
  },
  fieldGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "var(--space-3)",
    paddingTop: "var(--space-4)",
    borderTop: "1px dashed var(--color-border)",
  },
  fieldItem: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  fieldLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-wider)",
    textTransform: "uppercase" as const,
  },
  fieldValue: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-md)",
    fontWeight: 600,
    color: "var(--color-ink-strong)",
    fontVariantNumeric: "tabular-nums" as const,
  },
  fieldFlag: {
    color: "var(--color-warning)",
  },
  fieldOk: {
    color: "var(--color-success)",
  },
  lineItemsTitle: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-wider)",
    textTransform: "uppercase" as const,
    paddingTop: "var(--space-3)",
  },
  lineTable: {
    width: "100%",
    borderCollapse: "collapse" as const,
  },
  lineHead: {
    textAlign: "left",
    padding: "var(--space-2) var(--space-3)",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-wider)",
    textTransform: "uppercase" as const,
    borderBottom: "1px solid var(--color-border)",
  },
  lineCell: {
    padding: "var(--space-3)",
    borderBottom: "1px solid var(--color-grid)",
    fontSize: "var(--text-sm)",
    color: "var(--color-ink)",
    verticalAlign: "middle" as const,
  },
  lineCellMono: {
    padding: "var(--space-3)",
    borderBottom: "1px solid var(--color-grid)",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-sm)",
    color: "var(--color-ink-strong)",
    fontVariantNumeric: "tabular-nums" as const,
    textAlign: "right" as const,
    verticalAlign: "middle" as const,
  },
  catChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "2px 8px",
    borderRadius: "var(--radius-full)",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    fontWeight: 600,
  },
  noReceipt: {
    padding: "var(--space-7)",
    textAlign: "center",
    color: "var(--color-ink-muted)",
    fontStyle: "italic",
    background: "var(--color-surface-sunken)",
    borderRadius: "var(--radius-md)",
    border: "1px dashed var(--color-border)",
  },
};

export function ReceiptDetail() {
  const { receipts, selectedReceipt, selectedReceiptId, selectReceipt } = usePipeline();

  let cardContent: ReactNode = null;

  if (selectedReceipt) {
    if (selectedReceipt.ocrStatus === "error") {
      cardContent = (
        <div style={{
          ...styles.noReceipt,
          color: "var(--color-error)",
          border: "1px solid var(--color-error)",
          background: "var(--color-error-soft)",
          fontStyle: "normal",
        }}>
          <span style={{ fontWeight: 600 }}>OCR failed</span><br />
          <span style={{ fontSize: "var(--text-xs)" }}>The receipt could not be processed. Check the server logs.</span>
        </div>
      );
    } else if (selectedReceipt.ocrStatus !== "complete") {
      cardContent = (
        <div style={styles.noReceipt}>
          <div style={{
            display: "inline-block", width: 18, height: 18,
            borderRadius: "50%", border: "2px solid var(--color-border-strong)",
            borderTopColor: "var(--color-accent-deep)",
            animation: "spin 0.8s linear infinite",
            marginBottom: "var(--space-3)",
          }} />
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Processing OCR…</div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--color-ink-subtle)" }}>
            Running GPT-4o Vision analysis
          </div>
        </div>
      );
    } else {
      cardContent = (
        <div style={styles.card}>
          <div style={styles.topRow}>
            <div style={styles.merchantBlock}>
              <span style={styles.filename}>{selectedReceipt.filename}</span>
              <span style={styles.merchant}>{selectedReceipt.merchant}</span>
              <span style={{ fontSize: "var(--text-sm)", color: "var(--color-ink-muted)" }}>
                {AU.dateString(selectedReceipt.date)} · {selectedReceipt.lineItems.length} line items
              </span>
            </div>
            <div style={styles.total}>
              <span style={styles.totalLabel}>Total</span>
              <span style={styles.totalValue}>{AU.currency(selectedReceipt.total)}</span>
              <StatusIndicator
                status={selectedReceipt.ocrStatus === "complete" ? "complete" : "running"}
                label="OCR"
              />
            </div>
          </div>
          <div style={styles.fieldGrid}>
            <div style={styles.fieldItem}>
              <span style={styles.fieldLabel}>Cash-out</span>
              <span style={{ ...styles.fieldValue, color: selectedReceipt.cashOut ? "var(--color-warning)" : "var(--color-success)", display: "flex", flexDirection: "column", gap: 2 }}>
                <span>{selectedReceipt.cashOut ? "Detected" : "None"}</span>
                {selectedReceipt.cashOut && (selectedReceipt.paidByCard ?? 0) > 0 && (selectedReceipt.changeAmount ?? 0) > 0 && (
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--color-ink-muted)" }}>
                    Card payment + ${selectedReceipt.changeAmount!.toFixed(2)} cash change
                  </span>
                )}
              </span>
            </div>
            {(selectedReceipt.paidByCard ?? 0) > 0 && (
              <div style={styles.fieldItem}>
                <span style={styles.fieldLabel}>Paid by card</span>
                <span style={styles.fieldValue}>{AU.currency(selectedReceipt.paidByCard!)}</span>
              </div>
            )}
            {(selectedReceipt.changeAmount ?? 0) > 0 && (
              <div style={styles.fieldItem}>
                <span style={styles.fieldLabel}>Change given</span>
                <span style={styles.fieldValue}>{AU.currency(selectedReceipt.changeAmount!)}</span>
              </div>
            )}
            <div style={styles.fieldItem}>
              <span style={styles.fieldLabel}>Loyalty spent</span>
              <span style={styles.fieldValue}>{AU.integer(selectedReceipt.loyaltyPointsSpent)} pts</span>
            </div>
            <div style={styles.fieldItem}>
              <span style={styles.fieldLabel}>Card fee</span>
              <span style={styles.fieldValue}>{AU.currency(selectedReceipt.cardFeeAmount)}</span>
            </div>
            <div style={styles.fieldItem}>
              <span style={styles.fieldLabel}>Net goods</span>
              <span style={styles.fieldValue}>{AU.currency(selectedReceipt.netGoodsAmount)}</span>
            </div>
            <div style={styles.fieldItem}>
              <span style={styles.fieldLabel}>Uploaded</span>
              <span style={{ ...styles.fieldValue, fontSize: "var(--text-sm)" }}>
                {new Date(selectedReceipt.uploadedAt).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: false })}
              </span>
            </div>
            <div style={styles.fieldItem}>
              <span style={styles.fieldLabel}>ID</span>
              <span style={{ ...styles.fieldValue, fontSize: "var(--text-sm)" }}>{selectedReceipt.id}</span>
            </div>
          </div>
          <div style={styles.lineItemsTitle}>Line items</div>
          <div style={{ overflowX: "auto" as const }}>
            <table style={styles.lineTable}>
              <thead>
                <tr>
                  <th style={styles.lineHead}>Description</th>
                  <th style={styles.lineHead}>Category</th>
                  <th style={{ ...styles.lineHead, textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {selectedReceipt.lineItems.map((li) => {
                  const cat = (li.category ?? "Other") as keyof typeof CATEGORY_COLOR_VARS;
                  const colors = CATEGORY_COLOR_VARS[cat] ?? CATEGORY_COLOR_VARS.Other;
                  return (
                    <tr key={li.id}>
                      <td style={styles.lineCell}>{li.description}</td>
                      <td style={styles.lineCell}>
                        <span style={{ ...styles.catChip, background: colors.bg, color: colors.fg }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: colors.fg, display: "inline-block" }} />
                          {li.category ?? "Other"}
                        </span>
                      </td>
                      <td style={styles.lineCellMono}>{AU.currency(li.amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "var(--space-2)", paddingTop: "var(--space-3)" }}>
            {EXPENSE_CATEGORIES.map((c) => {
              const colors = CATEGORY_COLOR_VARS[c];
              return (
                <span key={c} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: "var(--radius-full)", background: colors.bg, color: colors.fg, fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: colors.fg }} />
                  {c}
                </span>
              );
            })}
          </div>
        </div>
      );
    } // end else (completed)
  } // end if selectedReceipt

  if (receipts.length === 0) {
    return (
      <div style={styles.section}>
        <div style={styles.header}>
          <div style={styles.headerText}>
            <span style={styles.stepBadge}>STEP 02 — SELECT &amp; VIEW</span>
            <h3 style={styles.title}>Receipt detail</h3>
            <p style={styles.subtitle}>
              After OCR completes, the structured receipt is selectable here with all
              line items and detected fields.
            </p>
          </div>
        </div>
        <div style={styles.noReceipt}>Upload a receipt to begin.</div>
      </div>
    );
  }

  return (
    <div style={styles.section}>
      <div style={styles.header}>
        <div style={styles.headerText}>
          <span style={styles.stepBadge}>STEP 02 — SELECT &amp; VIEW</span>
          <h3 style={styles.title}>Receipt detail</h3>
          <p style={styles.subtitle}>
            Browse every receipt in the in-memory store. Selecting one populates the
            pipeline input node and any downstream validation.
          </p>
        </div>
        <select
          style={styles.select}
          value={selectedReceiptId ?? ""}
          onChange={(e) => selectReceipt(e.target.value || null)}
        >
          {receipts.map((r) => (
            <option key={r.id} value={r.id}>
              {r.filename} — {r.merchant}
            </option>
          ))}
        </select>
      </div>

      {selectedReceipt ? cardContent : (
        <div style={styles.noReceipt}>Select a receipt from the list above.</div>
      )}
    </div>
  );
}
