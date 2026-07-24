import type { CSSProperties, ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: ReactNode;
  align?: "left" | "right" | "center";
  width?: string;
  mono?: boolean;
  render: (row: T, index: number) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  highlight?: (row: T) => boolean;
  emptyMessage?: ReactNode;
}

const styles: Record<string, CSSProperties> = {
  wrap: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
    boxShadow: "var(--shadow-sm)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "var(--text-sm)",
  },
  thead: {
    background: "var(--color-surface-sunken)",
    borderBottom: "1px solid var(--color-border)",
  },
  th: {
    padding: "var(--space-3) var(--space-4)",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    fontWeight: 500,
    letterSpacing: "var(--tracking-wider)",
    textTransform: "uppercase" as const,
    color: "var(--color-ink-muted)",
    textAlign: "left",
    whiteSpace: "nowrap" as const,
  },
  td: {
    padding: "var(--space-3) var(--space-4)",
    borderBottom: "1px solid var(--color-grid)",
    color: "var(--color-ink)",
    verticalAlign: "middle",
  },
  tdMono: {
    fontFamily: "var(--font-mono)",
    fontVariantNumeric: "tabular-nums",
    fontSize: "var(--text-sm)",
  },
  row: {
    transition: "background var(--duration-fast) var(--ease-out)",
  },
  highlightRow: {
    background: "var(--color-highlight-soft)",
  },
  empty: {
    padding: "var(--space-9)",
    textAlign: "center",
    color: "var(--color-ink-muted)",
    fontStyle: "italic",
  },
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  highlight,
  emptyMessage = "No data",
}: DataTableProps<T>) {
  return (
    <div style={styles.wrap}>
      <table style={styles.table}>
        <thead style={styles.thead}>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  ...styles.th,
                  textAlign: col.align ?? "left",
                  width: col.width,
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={styles.empty}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => {
              const isHighlighted = highlight ? highlight(row) : false;
              return (
                <tr
                  key={rowKey(row, i)}
                  style={{
                    ...styles.row,
                    ...(isHighlighted ? styles.highlightRow : {}),
                  }}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        ...styles.td,
                        ...(col.mono ? styles.tdMono : {}),
                        textAlign: col.align ?? "left",
                      }}
                    >
                      {col.render(row, i)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
