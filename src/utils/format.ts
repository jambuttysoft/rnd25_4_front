const NBSP = "\u00A0";

const currencyFormatter = new Intl.NumberFormat("en-AU", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("en-AU", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat("en-AU", {
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-AU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-AU", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export function formatAUD(value: number, opts: { signed?: boolean } = {}): string {
  if (!Number.isFinite(value)) return "—";
  const sign = opts.signed && value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}$${currencyFormatter.format(Math.abs(value))}`;
}

export function formatNumber(value: number, fractionDigits: number = 2): string {
  if (!Number.isFinite(value)) return "—";
  const formatter =
    fractionDigits === 2
      ? numberFormatter
      : new Intl.NumberFormat("en-AU", {
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits,
        });
  return formatter.format(value);
}

export function formatInteger(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return integerFormatter.format(value);
}

export function formatPercent(value: number, fractionDigits: number = 0): string {
  if (!Number.isFinite(value)) return "—";
  const scaled = value * 100;
  const digits = fractionDigits;
  const text = scaled.toFixed(digits);
  const parts = text.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return `${parts.join(",")}%`;
}

export function formatPercentRaw(value: number, fractionDigits: number = 1): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(fractionDigits).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)}%`;
}

export function formatDateAU(date: Date): string {
  return dateFormatter.format(date);
}

export function formatDateStringAU(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return dateFormatter.format(date);
}

export function formatTimeAU(date: Date): string {
  return timeFormatter.format(date);
}

export function formatLatency(ms: number): string {
  if (!Number.isFinite(ms)) return "—";
  if (ms < 1) return `${ms.toFixed(2)}${NBSP}ms`;
  if (ms < 10) return `${ms.toFixed(1)}${NBSP}ms`;
  return `${Math.round(ms)}${NBSP}ms`;
}

export function formatThroughput(tps: number): string {
  if (!Number.isFinite(tps)) return "—";
  return `${numberFormatter.format(tps)}${NBSP}t/s`;
}

export function formatDelta(actual: number, expected: number): string {
  if (!Number.isFinite(actual) || !Number.isFinite(expected)) return "—";
  const delta = actual - expected;
  const sign = delta > 0 ? "+" : delta < 0 ? "−" : "";
  return `${sign}${numberFormatter.format(Math.abs(delta))}`;
}

export const AU = {
  currency: formatAUD,
  number: formatNumber,
  integer: formatInteger,
  percent: formatPercent,
  percentRaw: formatPercentRaw,
  date: formatDateAU,
  dateString: formatDateStringAU,
  time: formatTimeAU,
  latency: formatLatency,
  throughput: formatThroughput,
  delta: formatDelta,
  NBSP,
};
