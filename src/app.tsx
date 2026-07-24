import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { PipelineProvider } from "./state/PipelineContext";
import { UploadReceiptTab } from "./components/pipeline/UploadReceiptTab";
import { BuildPipelineTab } from "./components/pipeline/BuildPipelineTab";
import { ViewExpenseMapTab } from "./components/pipeline/ViewExpenseMapTab";
import { StatusIndicator } from "./components/StatusIndicator";
import { AU } from "./utils/format";
import type { CSSProperties } from "react";

const styles: Record<string, CSSProperties> = {
  app: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    zIndex: 2,
  },
  topBar: {
    background: "var(--color-surface)",
    borderBottom: "1px solid var(--color-border)",
    padding: "var(--space-5) var(--space-7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 100,
    backdropFilter: "blur(8px)",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-4)",
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: "var(--radius-md)",
    background: "var(--color-ink-strong)",
    color: "var(--color-paper)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-sm)",
    fontWeight: 700,
    letterSpacing: "var(--tracking-tight)",
  },
  brandText: {
    display: "flex",
    flexDirection: "column",
    gap: 1,
  },
  brandTitle: {
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-md)",
    fontWeight: 600,
    color: "var(--color-ink-strong)",
    letterSpacing: "var(--tracking-tight)",
    lineHeight: 1,
  },
  brandSub: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-wider)",
  },
  topMeta: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-6)",
  },
  topMetaItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 2,
  },
  topMetaLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-wider)",
    textTransform: "uppercase" as const,
  },
  topMetaValue: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-sm)",
    fontWeight: 600,
    color: "var(--color-ink)",
    fontVariantNumeric: "tabular-nums",
  },
  tabBar: {
    background: "var(--color-surface)",
    borderBottom: "1px solid var(--color-border)",
    padding: "0 var(--space-7)",
    display: "flex",
    alignItems: "stretch",
    gap: "var(--space-2)",
    position: "sticky",
    top: 76,
    zIndex: 90,
  },
  tab: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "var(--space-4) var(--space-4) var(--space-3)",
    borderBottomWidth: "2px",
    borderBottomStyle: "solid",
    borderBottomColor: "transparent",
    marginBottom: -1,
    cursor: "pointer",
    transition: "all var(--duration-base) var(--ease-out)",
    position: "relative",
    gap: 2,
    minWidth: 220,
    textDecoration: "none",
    background: "transparent",
  },
  tabActive: {
    borderBottomColor: "var(--color-ink-strong)",
  },
  tabNum: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-widest)",
    textTransform: "uppercase" as const,
  },
  tabLabel: {
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-md)",
    fontWeight: 600,
    color: "var(--color-ink)",
    lineHeight: 1.2,
  },
  tabActiveLabel: {
    color: "var(--color-ink-strong)",
  },
  main: {
    flex: 1,
    padding: "var(--space-9) var(--space-7) var(--space-12)",
    maxWidth: "var(--max-width)",
    width: "100%",
    margin: "0 auto",
  },
  footer: {
    borderTop: "1px solid var(--color-border)",
    padding: "var(--space-6) var(--space-7)",
    background: "var(--color-surface)",
    marginTop: "auto",
  },
  footerContainer: {
    maxWidth: "var(--max-width)",
    margin: "0 auto",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "var(--space-6)",
  },
  footerBrandCol: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-1)",
  },
  footerBrandName: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-sm)",
    fontWeight: 700,
    color: "var(--color-ink-strong)",
    letterSpacing: "var(--tracking-wider)",
  },
  footerEngineName: {
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-sm)",
    fontWeight: 600,
    color: "var(--color-ink)",
  },
  footerPlatform: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
    letterSpacing: "var(--tracking-wide)",
  },
  footerRightCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "var(--space-1)",
    textAlign: "right" as const,
  },
  footerProgramme: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    fontWeight: 600,
    color: "var(--color-ink)",
    letterSpacing: "var(--tracking-wide)",
  },
  footerCopyright: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
  },
  footerLegal: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    color: "var(--color-ink-muted)",
  },
};

const TABS = [
  { to: "/upload", num: "01", label: "Upload Receipt", subtitle: "Capture & OCR" },
  { to: "/build", num: "02", label: "Build Pipeline", subtitle: "Compose & configure" },
  { to: "/map", num: "03", label: "View Expense Map", subtitle: "Review & export" },
] as const;

function TabBar() {
  return (
    <nav style={styles.tabBar} role="tablist">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          role="tab"
          style={({ isActive }) => ({
            ...styles.tab,
            ...(isActive ? styles.tabActive : {}),
          })}
        >
          {({ isActive }) => (
            <>
              <span style={styles.tabNum}>
                {tab.num} — {tab.subtitle}
              </span>
              <span
                style={{
                  ...styles.tabLabel,
                  ...(isActive ? styles.tabActiveLabel : {}),
                }}
              >
                {tab.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function Shell() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="paper-grain" style={styles.app}>
      <header style={styles.topBar}>
        <div style={styles.brand}>
          <div style={styles.brandMark}>R&amp;D</div>
          <div style={styles.brandText}>
            <div style={styles.brandTitle}>Financial Document Verification</div>
            <div style={styles.brandSub}>VISUAL PIPELINE · JUNE 2025 · 04</div>
          </div>
        </div>
        <div style={styles.topMeta}>
          <div style={styles.topMetaItem}>
            <span style={styles.topMetaLabel}>Generated</span>
            <span style={styles.topMetaValue}>
              {AU.date(now)} {AU.time(now)}
            </span>
          </div>
          <div style={styles.topMetaItem}>
            <span style={styles.topMetaLabel}>Locale</span>
            <span style={styles.topMetaValue}>en-AU</span>
          </div>
          <div style={styles.topMetaItem}>
            <StatusIndicator status="complete" label="In-memory" />
          </div>
        </div>
      </header>

      <TabBar />

      <main style={styles.main}>
        <Routes>
          <Route path="/" element={<Navigate to="/upload" replace />} />
          <Route path="/upload" element={<UploadReceiptTab />} />
          <Route path="/build" element={<BuildPipelineTab />} />
          <Route path="/map" element={<ViewExpenseMapTab />} />
          <Route path="*" element={<Navigate to="/upload" replace />} />
        </Routes>
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerContainer}>
          <div style={styles.footerBrandCol}>
            <span style={styles.footerBrandName}>totalflow</span>
            <span style={styles.footerEngineName}>Financial Document Verification Engine</span>
            <span style={styles.footerPlatform}>VSUAL PIPELINE</span>
          </div>
          <div style={styles.footerRightCol}>
            <span style={styles.footerProgramme}>Research Programme • R&amp;D 2025</span>
            <span style={styles.footerCopyright}>© 2025–26 3030 Technologies</span>
            <span style={styles.footerLegal}>All Rights Reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <PipelineProvider>
        <Shell />
      </PipelineProvider>
    </BrowserRouter>
  );
}
