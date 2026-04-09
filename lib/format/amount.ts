import { formatUnits, parseUnits } from "viem";

function sanitizeAmount(amount: string) {
  const normalized = amount.replace(/[^\d.]/g, "").trim();
  return normalized || "0";
}

export function toMinimalUnit(amount: string, decimals: number) {
  return parseUnits(sanitizeAmount(amount), decimals).toString();
}

export function fromMinimalUnit(amount: string, decimals: number) {
  return Number(formatUnits(BigInt(amount || "0"), decimals));
}

export function safeNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function isNativeToken(address?: string | null) {
  if (!address) {
    return false;
  }

  const normalized = address.toLowerCase();
  return (
    normalized === "0x0000000000000000000000000000000000000000" ||
    normalized === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
  );
}
