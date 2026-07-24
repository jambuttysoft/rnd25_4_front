import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { usePipeline } from "../../state/PipelineContext";
import type { PipelineTemplate } from "../../types/pipeline";

const styles: Record<string, CSSProperties> = {
  wrap: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-sm)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "var(--space-5) var(--space-6)",
    borderBottom: "1px solid var(--color-border)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "var(--space-5)",
    background:
      "linear-gradient(180deg, var(--color-surface) 0%, var(--color-paper-deep) 100%)",
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
    margin: 0,
  },
  subtitle: {
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    lineHeight: 1.5,
    maxWidth: 520,
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-3)",
    flexShrink: 0,
  },
  headerCount: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-subtle)",
    letterSpacing: "var(--tracking-wider)",
    textTransform: "uppercase" as const,
  },
  saveBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--space-2)",
    padding: "var(--space-3) var(--space-4)",
    background: "var(--color-ink-strong)",
    color: "var(--color-paper)",
    border: "1px solid var(--color-ink-strong)",
    borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-sm)",
    fontWeight: 600,
    letterSpacing: "var(--tracking-tight)",
    cursor: "pointer",
    transition: "all var(--duration-fast) var(--ease-out)",
    boxShadow: "var(--shadow-sm)",
  },
  saveBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  saveForm: {
    padding: "var(--space-5) var(--space-6)",
    borderBottom: "1px solid var(--color-border)",
    background: "var(--color-surface-sunken)",
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-4)",
  },
  saveFormHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "var(--space-3)",
  },
  saveFormTitle: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-widest)",
    textTransform: "uppercase" as const,
  },
  saveFormFields: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 2fr)",
    gap: "var(--space-4)",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-2)",
  },
  fieldLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-wider)",
    textTransform: "uppercase" as const,
  },
  fieldRequired: {
    color: "var(--color-highlight)",
    marginLeft: 2,
  },
  textInput: {
    padding: "var(--space-3) var(--space-4)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    background: "var(--color-surface)",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-sm)",
    color: "var(--color-ink-strong)",
    outline: "none",
    transition: "border-color var(--duration-fast) var(--ease-out)",
  },
  textInputError: {
    borderColor: "var(--color-error)",
  },
  fieldHelp: {
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-subtle)",
  },
  fieldError: {
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-xs)",
    color: "var(--color-error)",
  },
  saveFormActions: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-3)",
  },
  confirmBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--space-2)",
    padding: "var(--space-2) var(--space-4)",
    background: "var(--color-ink-strong)",
    color: "var(--color-paper)",
    border: "1px solid var(--color-ink-strong)",
    borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-sm)",
    fontWeight: 600,
    letterSpacing: "var(--tracking-tight)",
    cursor: "pointer",
  },
  ghostBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--space-2)",
    padding: "var(--space-2) var(--space-3)",
    background: "transparent",
    color: "var(--color-ink-muted)",
    border: "1px solid var(--color-border-strong)",
    borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-sm)",
    cursor: "pointer",
    transition: "all var(--duration-fast) var(--ease-out)",
  },
  body: {
    padding: "var(--space-5) var(--space-6) var(--space-6)",
    background: "var(--color-paper-deep)",
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-4)",
  },
  sectionLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-subtle)",
    letterSpacing: "var(--tracking-widest)",
    textTransform: "uppercase" as const,
    display: "flex",
    alignItems: "center",
    gap: "var(--space-3)",
  },
  sectionLabelRule: {
    flex: 1,
    height: 1,
    background: "var(--color-border)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "var(--space-4)",
  },
  card: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-5)",
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-3)",
    boxShadow: "var(--shadow-sm)",
    position: "relative",
    transition: "all var(--duration-base) var(--ease-out)",
  },
  cardIndex: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-faint)",
    letterSpacing: "var(--tracking-widest)",
  },
  cardName: {
    fontFamily: "var(--font-display)",
    fontSize: "var(--text-xl)",
    color: "var(--color-ink-strong)",
    letterSpacing: "var(--tracking-tight)",
    lineHeight: 1.15,
    margin: 0,
  },
  cardRenameInput: {
    fontFamily: "var(--font-display)",
    fontSize: "var(--text-xl)",
    color: "var(--color-ink-strong)",
    letterSpacing: "var(--tracking-tight)",
    lineHeight: 1.15,
    padding: "var(--space-1) var(--space-2)",
    border: "1px solid var(--color-ink)",
    borderRadius: "var(--radius-sm)",
    background: "var(--color-surface)",
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const,
  },
  cardDesc: {
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-sm)",
    color: "var(--color-ink-muted)",
    lineHeight: 1.5,
    margin: 0,
    flex: 1,
  },
  cardMeta: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-2)",
    flexWrap: "wrap" as const,
  },
  metaPill: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    padding: "2px 8px",
    borderRadius: "var(--radius-full)",
    letterSpacing: "var(--tracking-wide)",
    textTransform: "uppercase" as const,
    background: "var(--color-surface-sunken)",
    color: "var(--color-ink-muted)",
    border: "1px solid var(--color-border)",
  },
  metaPillBuiltIn: {
    background: "var(--color-accent-soft)",
    color: "var(--color-accent-deep)",
    borderColor: "var(--color-accent-soft)",
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "var(--space-2)",
    paddingTop: "var(--space-3)",
    borderTop: "1px dashed var(--color-border)",
  },
  actionGroup: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-2)",
  },
  actionBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "var(--space-2) var(--space-3)",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    color: "var(--color-ink)",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    letterSpacing: "var(--tracking-wider)",
    textTransform: "uppercase" as const,
    cursor: "pointer",
    transition: "all var(--duration-fast) var(--ease-out)",
  },
  actionBtnPrimary: {
    background: "var(--color-ink-strong)",
    color: "var(--color-paper)",
    borderColor: "var(--color-ink-strong)",
  },
  actionBtnDanger: {
    color: "var(--color-error)",
    borderColor: "var(--color-error)",
  },
  actionBtnActive: {
    background: "var(--color-surface-sunken)",
    borderColor: "var(--color-ink)",
  },
  empty: {
    padding: "var(--space-7)",
    textAlign: "center",
    color: "var(--color-ink-muted)",
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-sm)",
    background: "var(--color-surface)",
    border: "1px dashed var(--color-border-strong)",
    borderRadius: "var(--radius-md)",
  },
  errorBanner: {
    padding: "var(--space-3) var(--space-4)",
    background: "var(--color-error-soft)",
    border: "1px solid var(--color-error)",
    borderRadius: "var(--radius-md)",
    color: "var(--color-error)",
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-sm)",
  },
};

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2 6.5L4.5 9L10 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2 3H10M4.5 3V2H7.5V3M3 3L3.5 10.5H8.5L9 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LoadIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M6 1.5V8M6 8L3 5M6 8L9 5M2 10H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface TemplateCardProps {
  template: PipelineTemplate;
  index: number;
  onLoad: () => void;
  onRename: (newName: string) => void;
  onDelete: () => void;
}

function TemplateCard({ template, index, onLoad, onRename, onDelete }: TemplateCardProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(template.name);
  const [hover, setHover] = useState<"load" | "rename" | "delete" | null>(null);
  const renameRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isRenaming) {
      renameRef.current?.focus();
      renameRef.current?.select();
    }
  }, [isRenaming]);

  const commitRename = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== template.name) {
      onRename(trimmed);
    } else {
      setRenameValue(template.name);
    }
    setIsRenaming(false);
  };

  const cancelRename = () => {
    setRenameValue(template.name);
    setIsRenaming(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitRename();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelRename();
    }
  };

  const nodeCount = template.nodes.length;
  const edgeCount = template.edges.length;
  const indexLabel = String(index + 1).padStart(2, "0");

  return (
    <div style={styles.card}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-3)" }}>
        <span style={styles.cardIndex}>N°{indexLabel}</span>
        <div style={styles.cardMeta}>
          {template.isBuiltIn ? (
            <span style={{ ...styles.metaPill, ...styles.metaPillBuiltIn }}>Built-in</span>
          ) : (
            <span style={styles.metaPill}>Custom</span>
          )}
        </div>
      </div>

      {isRenaming ? (
        <input
          ref={renameRef}
          type="text"
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitRename}
          style={styles.cardRenameInput}
          aria-label="Rename template"
        />
      ) : (
        <h4 style={styles.cardName}>{template.name}</h4>
      )}

      <p style={styles.cardDesc}>{template.description || "No description provided."}</p>

      <div style={styles.cardMeta}>
        <span style={styles.metaPill}>
          {nodeCount} module{nodeCount === 1 ? "" : "s"}
        </span>
        <span style={styles.metaPill}>
          {edgeCount} wire{edgeCount === 1 ? "" : "s"}
        </span>
      </div>

      <div style={styles.cardFooter}>
        <button
          type="button"
          onClick={onLoad}
          onMouseEnter={() => setHover("load")}
          onMouseLeave={() => setHover(null)}
          style={{
            ...styles.actionBtn,
            ...(hover === "load" ? styles.actionBtnActive : {}),
            ...styles.actionBtnPrimary,
            ...(hover === "load" ? { background: "var(--color-ink)", borderColor: "var(--color-ink)" } : {}),
          }}
        >
          <LoadIcon />
          <span>Load</span>
        </button>
        <div style={styles.actionGroup}>
          {!template.isBuiltIn && (
            <>
              <button
                type="button"
                onClick={() => setIsRenaming(true)}
                onMouseEnter={() => setHover("rename")}
                onMouseLeave={() => setHover(null)}
                aria-label={`Rename ${template.name}`}
                style={{
                  ...styles.actionBtn,
                  ...(hover === "rename" ? styles.actionBtnActive : {}),
                }}
              >
                <PencilIcon />
                <span>Rename</span>
              </button>
              <button
                type="button"
                onClick={onDelete}
                onMouseEnter={() => setHover("delete")}
                onMouseLeave={() => setHover(null)}
                aria-label={`Delete ${template.name}`}
                style={{
                  ...styles.actionBtn,
                  ...(hover === "delete" ? { ...styles.actionBtnActive, ...styles.actionBtnDanger } : {}),
                }}
              >
                <TrashIcon />
                <span>Delete</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function TemplateManager() {
  const { templates, nodes, loadTemplate, saveTemplate, renameTemplate, deleteTemplate } = usePipeline();
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveDescription, setSaveDescription] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (showSaveForm) {
      setTimeout(() => nameInputRef.current?.focus(), 0);
    }
  }, [showSaveForm]);

  const builtIn = templates.filter((t) => t.isBuiltIn);
  const userTemplates = templates.filter((t) => !t.isBuiltIn);

  const openSaveForm = () => {
    if (nodes.length === 0) {
      setGlobalError("Add modules to the canvas before saving a template.");
      return;
    }
    setGlobalError(null);
    setNameError(null);
    setShowSaveForm(true);
  };

  const cancelSave = () => {
    setShowSaveForm(false);
    setSaveName("");
    setSaveDescription("");
    setNameError(null);
  };

  const handleSave = () => {
    const trimmed = saveName.trim();
    if (!trimmed) {
      setNameError("Name is required.");
      return;
    }
    try {
      saveTemplate(trimmed, saveDescription);
      cancelSave();
    } catch (err) {
      setNameError(err instanceof Error ? err.message : "Failed to save template.");
    }
  };

  const handleLoad = (id: string) => {
    loadTemplate(id);
  };

  const handleRename = (id: string, newName: string) => {
    renameTemplate(id, newName);
  };

  const handleDelete = (id: string, name: string) => {
    const ok = window.confirm(`Delete template "${name}"? This cannot be undone.`);
    if (ok) {
      deleteTemplate(id);
    }
  };

  const userTemplateCount = userTemplates.length;
  const totalCount = templates.length;

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.headerText}>
          <span style={styles.stepBadge}>LIBRARY · TEMPLATES</span>
          <h3 style={styles.title}>Pipeline templates</h3>
          <p style={styles.subtitle}>
            Save the current canvas as a reusable template, or load a preset to
            jump-start a new verification chain. Built-in templates are protected
            from deletion; your custom templates persist across sessions.
          </p>
        </div>
        <div style={styles.headerActions}>
          <span style={styles.headerCount}>
            {totalCount} template{totalCount === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            onClick={openSaveForm}
            disabled={nodes.length === 0}
            style={{
              ...styles.saveBtn,
              ...(nodes.length === 0 ? styles.saveBtnDisabled : {}),
            }}
            title={nodes.length === 0 ? "Add modules to the canvas first" : "Save current pipeline as a template"}
          >
            <PlusIcon />
            <span>Save current</span>
          </button>
        </div>
      </div>

      {showSaveForm && (
        <div style={styles.saveForm}>
          <div style={styles.saveFormHeader}>
            <span style={styles.saveFormTitle}>New template</span>
            <button
              type="button"
              onClick={cancelSave}
              aria-label="Cancel"
              style={{ ...styles.ghostBtn, padding: "var(--space-1) var(--space-2)" }}
            >
              <XIcon />
            </button>
          </div>
          <div style={styles.saveFormFields}>
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>
                Name<span style={styles.fieldRequired}>*</span>
              </label>
              <input
                ref={nameInputRef}
                type="text"
                value={saveName}
                onChange={(e) => {
                  setSaveName(e.target.value);
                  if (nameError) setNameError(null);
                }}
                placeholder="e.g. Q3 audit flow"
                style={{
                  ...styles.textInput,
                  ...(nameError ? styles.textInputError : {}),
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") cancelSave();
                }}
              />
              {nameError ? (
                <span style={styles.fieldError}>{nameError}</span>
              ) : (
                <span style={styles.fieldHelp}>A short, recognisable label.</span>
              )}
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>Description</label>
              <input
                type="text"
                value={saveDescription}
                onChange={(e) => setSaveDescription(e.target.value)}
                placeholder="What does this pipeline do?"
                style={styles.textInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") cancelSave();
                }}
              />
              <span style={styles.fieldHelp}>Optional. Helps you remember the use case.</span>
            </div>
          </div>
          <div style={styles.saveFormActions}>
            <button type="button" onClick={handleSave} style={styles.confirmBtn}>
              <CheckIcon />
              <span>Save template</span>
            </button>
            <button type="button" onClick={cancelSave} style={styles.ghostBtn}>
              <XIcon />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}

      {globalError && (
        <div style={{ padding: "var(--space-3) var(--space-6)" }}>
          <div style={styles.errorBanner}>{globalError}</div>
        </div>
      )}

      <div style={styles.body}>
        <div style={styles.sectionLabel}>
          <span>Built-in</span>
          <span style={styles.sectionLabelRule} />
          <span style={{ color: "var(--color-ink-faint)" }}>{builtIn.length}</span>
        </div>
        {builtIn.length === 0 ? (
          <div style={styles.empty}>No built-in templates available.</div>
        ) : (
          <div style={styles.grid}>
            {builtIn.map((t, i) => (
              <TemplateCard
                key={t.id}
                template={t}
                index={i}
                onLoad={() => handleLoad(t.id)}
                onRename={(newName) => handleRename(t.id, newName)}
                onDelete={() => handleDelete(t.id, t.name)}
              />
            ))}
          </div>
        )}

        <div style={{ ...styles.sectionLabel, marginTop: "var(--space-3)" }}>
          <span>Your templates</span>
          <span style={styles.sectionLabelRule} />
          <span style={{ color: "var(--color-ink-faint)" }}>{userTemplateCount}</span>
        </div>
        {userTemplates.length === 0 ? (
          <div style={styles.empty}>
            {nodes.length === 0
              ? "Build a pipeline on the canvas, then click Save current to capture it here."
              : "No saved templates yet. Click Save current to keep this pipeline for later."}
          </div>
        ) : (
          <div style={styles.grid}>
            {userTemplates.map((t, i) => (
              <TemplateCard
                key={t.id}
                template={t}
                index={builtIn.length + i}
                onLoad={() => handleLoad(t.id)}
                onRename={(newName) => handleRename(t.id, newName)}
                onDelete={() => handleDelete(t.id, t.name)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
