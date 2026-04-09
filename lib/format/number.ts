export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "APY 暂无数据";
  }

  return `${value.toFixed(value >= 10 ? 1 : 2)}%`;
}

export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-";
  }

  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "USD",
    notation: value >= 1_000_000 ? "compact" : "standard",
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value);
}

export function formatTokenAmount(value: number | null | undefined, symbol?: string, maximumFractionDigits = 4) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return symbol ? `- ${symbol}` : "-";
  }

  return `${new Intl.NumberFormat("zh-CN", {
    maximumFractionDigits,
  }).format(value)}${symbol ? ` ${symbol}` : ""}`;
}
