import type { CSSProperties } from "react";
import type { CategoryOption, ColorRule } from "@/types/trade";

export const COLOR = {
  posLightBg: "#E6F3FF",
  posLightFg: "#1D4ED8",
  posMidBg: "#5B9BD5",
  posMidFg: "#0B3A66",
  posVividBg: "#2F80ED",
  posVividFg: "#FFFFFF",
  posDarkBg: "#1E3A8A",
  posDarkFg: "#FFFFFF",
  negLightBg: "#FFE6EE",
  negLightFg: "#BE123C",
  negMidBg: "#F48FB1",
  negMidFg: "#831843",
  negDarkBg: "#DB2777",
  negDarkFg: "#FFFFFF",
  negVividBg: "#E11D48",
  negVividFg: "#FFFFFF",
} as const;

export const DEFAULT_CATEGORIES: CategoryOption[] = [
  { name: "1h", background: "#FFE082" },
  { name: "5m", background: "#C5E1A5" },
  { name: "DJI", background: "#90CAF9" },
];

export const DEFAULT_COLOR_RULES: ColorRule[] = [
  {
    id: "pos-light",
    label: "プラス 1 〜 9,999",
    min: 1,
    max: 9999,
    background: COLOR.posLightBg,
    color: COLOR.posLightFg,
  },
  {
    id: "pos-mid",
    label: "プラス 10,000 〜 29,999",
    min: 10000,
    max: 29999,
    background: COLOR.posMidBg,
    color: COLOR.posMidFg,
  },
  {
    id: "pos-vivid",
    label: "プラス 30,000 〜 99,999",
    min: 30000,
    max: 99999,
    background: COLOR.posVividBg,
    color: COLOR.posVividFg,
  },
  {
    id: "pos-dark",
    label: "プラス 100,000 以上",
    min: 100000,
    max: null,
    background: COLOR.posDarkBg,
    color: COLOR.posDarkFg,
  },
  {
    id: "neg-light",
    label: "マイナス -1 〜 -5,000",
    min: -5000,
    max: -1,
    background: COLOR.negLightBg,
    color: COLOR.negLightFg,
  },
  {
    id: "neg-mid",
    label: "マイナス -5,001 〜 -9,999",
    min: -9999,
    max: -5001,
    background: COLOR.negMidBg,
    color: COLOR.negMidFg,
  },
  {
    id: "neg-dark",
    label: "マイナス -10,000 〜 -19,999",
    min: -19999,
    max: -10000,
    background: COLOR.negDarkBg,
    color: COLOR.negDarkFg,
  },
  {
    id: "neg-vivid",
    label: "マイナス -20,000 以下",
    min: null,
    max: -20000,
    background: COLOR.negVividBg,
    color: COLOR.negVividFg,
  },
];

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

export function chartPalette(rules: ColorRule[]) {
  return {
    barPos: matchColorRule(15000, rules)?.background ?? COLOR.posMidBg,
    barNeg: matchColorRule(-7000, rules)?.background ?? COLOR.negMidBg,
  };
}

export function categoryStyle(name: string, categories: CategoryOption[]): CSSProperties {
  const found = categories.find((item) => item.name === name);
  if (!name || !found) return { color: "#334155" };
  return { backgroundColor: found.background, color: "#000000" };
}
