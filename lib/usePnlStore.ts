"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_CATEGORIES, DEFAULT_COLOR_RULES } from "@/lib/colors";
import { LEGACY_STORAGE_KEYS, STORAGE_RECORDS, STORAGE_SEED, STORAGE_SETTINGS, normalizeCategoryList } from "@/lib/pnl";
import { SAMPLE_RECORDS } from "@/lib/sample";
import type { CategoryOption, ColorRule, DailyPnl } from "@/types/trade";

type Settings = {
  categories: CategoryOption[];
  colorRules: ColorRule[];
  baseCarryover: number;
  monthCarryovers: Record<string, number>;
};

function normalizeRecord(value: unknown): DailyPnl | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Partial<DailyPnl>;
  if (typeof record.date !== "string" || typeof record.profitLoss !== "number") return null;
  return {
    date: record.date,
    profitLoss: record.profitLoss,
    memo: typeof record.memo === "string" ? record.memo : "",
    categories: normalizeCategoryList(
      (record as { categories?: unknown; category?: unknown }).categories ??
        (record as { category?: unknown }).category,
    ),
  };
}

function normalizeCategories(value: unknown): CategoryOption[] {
  if (!Array.isArray(value) || value.length === 0) return DEFAULT_CATEGORIES;
  const next: CategoryOption[] = [];
  for (const item of value) {
    if (typeof item === "string" && item.trim()) {
      const fallback = DEFAULT_CATEGORIES.find((category) => category.name === item);
      next.push({ name: item, background: fallback?.background ?? "#E2E8F0" });
    } else if (item && typeof item === "object" && "name" in item && typeof (item as CategoryOption).name === "string") {
      const category = item as CategoryOption;
      next.push({
        name: category.name,
        background: typeof category.background === "string" ? category.background : "#E2E8F0",
      });
    }
  }
  return next.length ? next : DEFAULT_CATEGORIES;
}

function applySeptemberSeed(records: DailyPnl[]): DailyPnl[] {
  const september = SAMPLE_RECORDS.filter((item) => item.date.startsWith("2026-09-"));
  const others = records.filter((item) => !item.date.startsWith("2026-09-"));
  return [...others, ...september].sort((a, b) => a.date.localeCompare(b.date));
}

function readRecords(): DailyPnl[] {
  const current = window.localStorage.getItem(STORAGE_RECORDS);
  const legacy = LEGACY_STORAGE_KEYS.map((key) => window.localStorage.getItem(key)).find(Boolean) ?? null;
  const raw = current ?? legacy;
  if (!raw) {
    window.localStorage.setItem(STORAGE_SEED, "1");
    return SAMPLE_RECORDS;
  }
  const parsed = JSON.parse(raw) as unknown;
  let records = Array.isArray(parsed)
    ? parsed.map(normalizeRecord).filter((item): item is DailyPnl => item !== null)
    : [];
  if (records.length === 0) {
    window.localStorage.setItem(STORAGE_SEED, "1");
    return SAMPLE_RECORDS;
  }
  if (!window.localStorage.getItem(STORAGE_SEED)) {
    records = applySeptemberSeed(records);
    window.localStorage.setItem(STORAGE_SEED, "1");
  }
  return records;
}

function readSettings(): Settings {
  const current = window.localStorage.getItem(STORAGE_SETTINGS);
  const legacy =
    current ?? window.localStorage.getItem("trade-pnl.settings.v4") ?? window.localStorage.getItem("trade-pnl.settings.v3");
  if (!legacy) {
    return { categories: DEFAULT_CATEGORIES, colorRules: DEFAULT_COLOR_RULES, baseCarryover: 0, monthCarryovers: {} };
  }
  const parsed = JSON.parse(legacy) as Partial<Settings>;
  return {
    categories: normalizeCategories(parsed.categories),
    colorRules: Array.isArray(parsed.colorRules) && parsed.colorRules.length > 0 ? parsed.colorRules : DEFAULT_COLOR_RULES,
    baseCarryover: typeof parsed.baseCarryover === "number" ? parsed.baseCarryover : 0,
    monthCarryovers:
      current && parsed.monthCarryovers && typeof parsed.monthCarryovers === "object" ? parsed.monthCarryovers : {},
  };
}

export function usePnlStore() {
  const [records, setRecords] = useState<DailyPnl[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>(DEFAULT_CATEGORIES);
  const [colorRules, setColorRules] = useState<ColorRule[]>(DEFAULT_COLOR_RULES);
  const [baseCarryover, setBaseCarryover] = useState(0);
  const [monthCarryovers, setMonthCarryovers] = useState<Record<string, number>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setRecords(readRecords());
      const settings = readSettings();
      setCategories(settings.categories);
      setColorRules(settings.colorRules);
      setBaseCarryover(settings.baseCarryover);
      setMonthCarryovers(settings.monthCarryovers);
    } catch {
      setRecords(SAMPLE_RECORDS);
      setCategories(DEFAULT_CATEGORIES);
      setColorRules(DEFAULT_COLOR_RULES);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_RECORDS, JSON.stringify(records));
    window.localStorage.setItem(
      STORAGE_SETTINGS,
      JSON.stringify({ categories, colorRules, baseCarryover, monthCarryovers }),
    );
  }, [hydrated, records, categories, colorRules, baseCarryover, monthCarryovers]);

  const upsert = useCallback((nextRecord: DailyPnl) => {
    setRecords((current) => {
      const next = current.filter((item) => item.date !== nextRecord.date);
      next.push(nextRecord);
      next.sort((a, b) => a.date.localeCompare(b.date));
      return next;
    });
  }, []);

  const remove = useCallback((date: string) => {
    setRecords((current) => current.filter((item) => item.date !== date));
  }, []);

  const setMonthCarryover = useCallback((key: string, value: number | null) => {
    setMonthCarryovers((current) => {
      const next = { ...current };
      if (value === null) delete next[key];
      else next[key] = value;
      return next;
    });
  }, []);

  const resetSample = useCallback(() => {
    setRecords(SAMPLE_RECORDS);
    setCategories(DEFAULT_CATEGORIES);
    setColorRules(DEFAULT_COLOR_RULES);
    setBaseCarryover(0);
    setMonthCarryovers({});
    window.localStorage.setItem(STORAGE_SEED, "1");
  }, []);

  return {
    records,
    categories,
    colorRules,
    baseCarryover,
    monthCarryovers,
    hydrated,
    upsert,
    remove,
    setCategories,
    setColorRules,
    setBaseCarryover,
    setMonthCarryover,
    resetSample,
  };
}
