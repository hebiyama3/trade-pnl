import type { CSSProperties } from "react";
import type { CategoryOption, ChartSignColors, ColorRule } from "@/types/trade";

export const DEFAULT_TAG_COLOR = "#000000";
export const DEFAULT_TAG_BACKGROUND = "#e5e7eb";
export const CHART_BAR_DEFAULT = "#fbc02d";

export const DEFAULT_CHART_SIGN_COLORS: ChartSignColors = {
  positive: "#a2dafd",
  negative: "#fdc1de",
};

export const DEFAULT_CATEGORIES: CategoryOption[] = [
  { id: "1h", name: "1h", background: "#FFE082", color: DEFAULT_TAG_COLOR },
  { id: "5m", name: "5m", background: "#C5E1A5", color: DEFAULT_TAG_COLOR },
  { id: "NG", name: "NG", background: DEFAULT_TAG_BACKGROUND, color: DEFAULT_TAG_COLOR },
];

export const DEFAULT_COLOR_RULES: ColorRule[] = [
  {
    id: "pos-light",
    label: "1 〜 9,999",
    min: 1,
    max: 9999,
    background: "#cee9fb",
    color: "#323232",
  },
  {
    id: "pos-mid",
    label: "10,000 〜 29,999",
    min: 10000,
    max: 29999,
    background: "#a2dafd",
    color: "#323232",
  },
  {
    id: "pos-vivid",
    label: "30,000 〜 99,999",
    min: 30000,
    max: 99999,
    background: "#6fc6fe",
    color: "#323232",
  },
  {
    id: "pos-dark",
    label: "100,000 以上",
    min: 100000,
    max: null,
    background: "#32abfe",
    color: "#323232",
  },
  {
    id: "neg-light",
    label: "-1 〜 -4,999",
    min: -4999,
    max: -1,
    background: "#fbddef",
    color: "#323232",
  },
  {
    id: "neg-mid",
    label: "-5,000 〜 -19,999",
    min: -19999,
    max: -5000,
    background: "#fdc1df",
    color: "#323232",
  },
  {
    id: "neg-dark",
    label: "-20,000 〜 -29,999",
    min: -29999,
    max: -20000,
    background: "#fea0ce",
    color: "#323232",
  },
  {
    id: "neg-vivid",
    label: "-30,000 以下",
    min: null,
    max: -30000,
    background: "#ef75b0",
    color: "#323232",
  },
];

export function toColorInput(value: string | undefined, fallback: string): string {
  return value && /^#[0-9A-Fa-f]{6}$/.test(value) ? value : fallback;
}

export function matchColorRule(value: number, rules: ColorRule[]): ColorRule | null {
  return (
    rules.find((rule) => {
      const minOk = rule.min === null || value >= rule.min;
      const maxOk = rule.max === null || value <= rule.max;
      return minOk && maxOk;
    }) ?? null
  );
}

export function pnlStyle(value: number | null | undefined, rules: ColorRule[]): CSSProperties {
  if (value === null || value === undefined || value === 0) {
    return { backgroundColor: "#ffffff", color: "#334155" };
  }
  const rule = matchColorRule(value, rules);
  if (!rule) return { backgroundColor: "#ffffff", color: "#334155" };
  return { backgroundColor: rule.background, color: rule.color };
}

export function findCategory(key: string, categories: CategoryOption[]): CategoryOption | undefined {
  return categories.find((item) => item.id === key) ?? categories.find((item) => item.name === key);
}

export function categoryLabel(key: string, categories: CategoryOption[]): string {
  return findCategory(key, categories)?.name || key;
}

export function categoryStyle(key: string, categories: CategoryOption[]): CSSProperties {
  const found = findCategory(key, categories);
  if (!key || !found) return { color: "#334155" };
  return { backgroundColor: found.background, color: found.color || DEFAULT_TAG_COLOR };
}
