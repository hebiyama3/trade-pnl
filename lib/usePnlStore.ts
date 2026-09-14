"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_CATEGORIES, DEFAULT_CHART_SIGN_COLORS, DEFAULT_COLOR_RULES } from "@/lib/colors";
import {
  bindRecordCategories,
  migrateCategoryName,
  normalizeCategories,
  normalizeChartSignColors,
  normalizeColorRules,
  normalizeMonthCarryovers,
  type BackupPayload,
} from "@/lib/backup";
import { LEGACY_SETTINGS_KEYS, LEGACY_STORAGE_KEYS, STORAGE_RECORDS, STORAGE_SEED, STORAGE_SETTINGS, normalizeCategoryList } from "@/lib/pnl";
import { SAMPLE_RECORDS } from "@/lib/sample";
import type { CategoryOption, ChartSignColors, ColorRule, DailyPnl } from "@/types/trade";

export type StoredSettings = {
  categories: CategoryOption[];
  colorRules: ColorRule[];
  baseCarryover: number;
  monthCarryovers: Record<string, number>;
  chartSignColors: ChartSignColors;
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
    ).map(migrateCategoryName),
  };
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

function readSettings(): StoredSettings {
  const current = window.localStorage.getItem(STORAGE_SETTINGS);
  const raw = current ?? LEGACY_SETTINGS_KEYS.map((key) => window.localStorage.getItem(key)).find(Boolean) ?? null;
  if (!raw) {
    return {
      categories: DEFAULT_CATEGORIES,
      colorRules: DEFAULT_COLOR_RULES,
      baseCarryover: 0,
      monthCarryovers: {},
      chartSignColors: { ...DEFAULT_CHART_SIGN_COLORS },
    };
  }
  const parsed = JSON.parse(raw) as Partial<StoredSettings>;
  const categories = normalizeCategories(parsed.categories);
  const colorRules = normalizeColorRules(parsed.colorRules);
  return {
    categories: categories.length ? categories : DEFAULT_CATEGORIES,
    colorRules: colorRules.length ? colorRules : DEFAULT_COLOR_RULES,
    baseCarryover: typeof parsed.baseCarryover === "number" ? parsed.baseCarryover : 0,
    monthCarryovers: normalizeMonthCarryovers(parsed.monthCarryovers),
    chartSignColors: normalizeChartSignColors(parsed.chartSignColors),
  };
}

export function usePnlStore() {
  const [records, setRecords] = useState<DailyPnl[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>(DEFAULT_CATEGORIES);
  const [colorRules, setColorRules] = useState<ColorRule[]>(DEFAULT_COLOR_RULES);
  const [baseCarryover, setBaseCarryover] = useState(0);
  const [monthCarryovers, setMonthCarryovers] = useState<Record<string, number>>({});
  const [chartSignColors, setChartSignColors] = useState<ChartSignColors>(DEFAULT_CHART_SIGN_COLORS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const settings = readSettings();
      setRecords(bindRecordCategories(readRecords(), settings.categories));
      setCategories(settings.categories);
      setColorRules(settings.colorRules);
      setBaseCarryover(settings.baseCarryover);
      setMonthCarryovers(settings.monthCarryovers);
      setChartSignColors(settings.chartSignColors);
    } catch {
      setRecords(SAMPLE_RECORDS);
      setCategories(DEFAULT_CATEGORIES);
      setColorRules(DEFAULT_COLOR_RULES);
      setChartSignColors({ ...DEFAULT_CHART_SIGN_COLORS });
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_RECORDS, JSON.stringify(records));
    window.localStorage.setItem(
      STORAGE_SETTINGS,
      JSON.stringify({ categories, colorRules, baseCarryover, monthCarryovers, chartSignColors }),
    );
  }, [hydrated, records, categories, colorRules, baseCarryover, monthCarryovers, chartSignColors]);

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
    setChartSignColors({ ...DEFAULT_CHART_SIGN_COLORS });
    window.localStorage.setItem(STORAGE_SEED, "1");
  }, []);

  const applyBackup = useCallback((payload: BackupPayload) => {
    const categories = payload.settings.categories.length ? payload.settings.categories : DEFAULT_CATEGORIES;
    setRecords(bindRecordCategories(payload.records, categories));
    setCategories(categories);
    setColorRules(payload.settings.colorRules.length ? payload.settings.colorRules : DEFAULT_COLOR_RULES);
    setBaseCarryover(payload.settings.baseCarryover);
    setMonthCarryovers(payload.settings.monthCarryovers);
    setChartSignColors(payload.settings.chartSignColors);
  }, []);

  return {
    records,
    categories,
    colorRules,
    baseCarryover,
    monthCarryovers,
    chartSignColors,
    hydrated,
    upsert,
    remove,
    setCategories,
    setColorRules,
    setBaseCarryover,
    setMonthCarryover,
    setChartSignColors,
    resetSample,
    applyBackup,
  };
}
