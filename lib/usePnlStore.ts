"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { DEFAULT_CALENDAR_PNL_SIZE, DEFAULT_CATEGORIES, DEFAULT_CHART_SIGN_COLORS, DEFAULT_COLOR_RULES, normalizeCalendarPnlSize } from "@/lib/colors";
import { DEFAULT_LOCALE, normalizeLocale } from "@/lib/i18n";
import {
  bindRecordCategories,
  normalizeCategories,
  normalizeChartSignColors,
  normalizeColorRules,
  normalizeMonthCarryovers,
  type BackupPayload,
} from "@/lib/backup";
import { DEFAULT_CURRENCY, LEGACY_SETTINGS_KEYS, LEGACY_STORAGE_KEYS, STORAGE_RECORDS, STORAGE_SEED, STORAGE_SEED_JUNJUL, STORAGE_SETTINGS, normalizeCategoryList, normalizeCurrency } from "@/lib/pnl";
import { SAMPLE_RECORDS } from "@/lib/sample";
import type { CalendarPnlSize, CategoryOption, ChartSignColors, ColorRule, Currency, DailyPnl, Locale } from "@/types/trade";

export type StoredSettings = {
  categories: CategoryOption[];
  colorRules: ColorRule[];
  baseCarryover: number;
  monthCarryovers: Record<string, number>;
  chartSignColors: ChartSignColors;
  calendarPnlSize: CalendarPnlSize;
  locale: Locale;
  currency: Currency;
};

type Snapshot = StoredSettings & { records: DailyPnl[] };

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

function applySeptemberSeed(records: DailyPnl[]): DailyPnl[] {
  const september = SAMPLE_RECORDS.filter((item) => item.date.startsWith("2026-09-"));
  const others = records.filter((item) => !item.date.startsWith("2026-09-"));
  return [...others, ...september].sort((a, b) => a.date.localeCompare(b.date));
}

function applyJuneJulySeed(records: DailyPnl[]): DailyPnl[] {
  const injected = SAMPLE_RECORDS.filter((item) => item.date.startsWith("2026-06-") || item.date.startsWith("2026-07-"));
  const others = records.filter((item) => !item.date.startsWith("2026-06-") && !item.date.startsWith("2026-07-"));
  return [...others, ...injected].sort((a, b) => a.date.localeCompare(b.date));
}

function markSampleSeeds() {
  window.localStorage.setItem(STORAGE_SEED, "1");
  window.localStorage.setItem(STORAGE_SEED_JUNJUL, "1");
}

function readRecords(): DailyPnl[] {
  const current = window.localStorage.getItem(STORAGE_RECORDS);
  const legacy = LEGACY_STORAGE_KEYS.map((key) => window.localStorage.getItem(key)).find(Boolean) ?? null;
  const raw = current ?? legacy;
  if (!raw) {
    markSampleSeeds();
    return SAMPLE_RECORDS;
  }
  const parsed = JSON.parse(raw) as unknown;
  let records = Array.isArray(parsed)
    ? parsed.map(normalizeRecord).filter((item): item is DailyPnl => item !== null)
    : [];
  if (records.length === 0) {
    markSampleSeeds();
    return SAMPLE_RECORDS;
  }
  let seeded = false;
  if (!window.localStorage.getItem(STORAGE_SEED)) {
    records = applySeptemberSeed(records);
    window.localStorage.setItem(STORAGE_SEED, "1");
    seeded = true;
  }
  if (!window.localStorage.getItem(STORAGE_SEED_JUNJUL)) {
    records = applyJuneJulySeed(records);
    window.localStorage.setItem(STORAGE_SEED_JUNJUL, "1");
    seeded = true;
  }
  if (seeded) window.localStorage.setItem(STORAGE_RECORDS, JSON.stringify(records));
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
      calendarPnlSize: DEFAULT_CALENDAR_PNL_SIZE,
      locale: DEFAULT_LOCALE,
      currency: DEFAULT_CURRENCY,
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
    calendarPnlSize: normalizeCalendarPnlSize(parsed.calendarPnlSize),
    locale: normalizeLocale(parsed.locale),
    currency: normalizeCurrency(parsed.currency),
  };
}

function writeSnapshot(snapshot: Snapshot) {
  window.localStorage.setItem(STORAGE_RECORDS, JSON.stringify(snapshot.records));
  window.localStorage.setItem(
    STORAGE_SETTINGS,
    JSON.stringify({
      categories: snapshot.categories,
      colorRules: snapshot.colorRules,
      baseCarryover: snapshot.baseCarryover,
      monthCarryovers: snapshot.monthCarryovers,
      chartSignColors: snapshot.chartSignColors,
      calendarPnlSize: snapshot.calendarPnlSize,
      locale: snapshot.locale,
      currency: snapshot.currency,
    }),
  );
}

function loadSnapshot(): Snapshot {
  const settings = readSettings();
  return {
    ...settings,
    records: bindRecordCategories(readRecords(), settings.categories),
  };
}

export function usePnlStore() {
  const [records, setRecords] = useState<DailyPnl[]>([]);
  const [categories, setCategoriesState] = useState<CategoryOption[]>(DEFAULT_CATEGORIES);
  const [colorRules, setColorRulesState] = useState<ColorRule[]>(DEFAULT_COLOR_RULES);
  const [baseCarryover, setBaseCarryoverState] = useState(0);
  const [monthCarryovers, setMonthCarryoversState] = useState<Record<string, number>>({});
  const [chartSignColors, setChartSignColorsState] = useState<ChartSignColors>(DEFAULT_CHART_SIGN_COLORS);
  const [calendarPnlSize, setCalendarPnlSizeState] = useState<CalendarPnlSize>(DEFAULT_CALENDAR_PNL_SIZE);
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY);
  const [hydrated, setHydrated] = useState(false);
  const snapshotRef = useRef<Snapshot | null>(null);

  const persist = useCallback((patch: Partial<Snapshot>) => {
    const current = snapshotRef.current;
    if (!current) return;
    const next = { ...current, ...patch };
    snapshotRef.current = next;
    writeSnapshot(next);
  }, []);

  useLayoutEffect(() => {
    try {
      const snapshot = loadSnapshot();
      snapshotRef.current = snapshot;
      setRecords(snapshot.records);
      setCategoriesState(snapshot.categories);
      setColorRulesState(snapshot.colorRules);
      setBaseCarryoverState(snapshot.baseCarryover);
      setMonthCarryoversState(snapshot.monthCarryovers);
      setChartSignColorsState(snapshot.chartSignColors);
      setCalendarPnlSizeState(snapshot.calendarPnlSize);
      setLocaleState(snapshot.locale);
      setCurrencyState(snapshot.currency);
    } catch {
      const fallback: Snapshot = {
        records: SAMPLE_RECORDS,
        categories: DEFAULT_CATEGORIES,
        colorRules: DEFAULT_COLOR_RULES,
        baseCarryover: 0,
        monthCarryovers: {},
        chartSignColors: { ...DEFAULT_CHART_SIGN_COLORS },
        calendarPnlSize: DEFAULT_CALENDAR_PNL_SIZE,
        locale: DEFAULT_LOCALE,
        currency: DEFAULT_CURRENCY,
      };
      snapshotRef.current = fallback;
      setRecords(fallback.records);
      setCategoriesState(fallback.categories);
      setColorRulesState(fallback.colorRules);
      setChartSignColorsState(fallback.chartSignColors);
      setCalendarPnlSizeState(fallback.calendarPnlSize);
      setLocaleState(fallback.locale);
      setCurrencyState(fallback.currency);
    } finally {
      setHydrated(true);
    }

    const flush = () => {
      if (snapshotRef.current) writeSnapshot(snapshotRef.current);
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", flush);
    };
  }, []);

  const upsert = useCallback(
    (nextRecord: DailyPnl) => {
      setRecords((current) => {
        const next = current.filter((item) => item.date !== nextRecord.date);
        next.push(nextRecord);
        next.sort((a, b) => a.date.localeCompare(b.date));
        persist({ records: next });
        return next;
      });
    },
    [persist],
  );

  const remove = useCallback(
    (date: string) => {
      setRecords((current) => {
        const next = current.filter((item) => item.date !== date);
        persist({ records: next });
        return next;
      });
    },
    [persist],
  );

  const setCategories = useCallback(
    (next: CategoryOption[]) => {
      persist({ categories: next });
      setCategoriesState(next);
    },
    [persist],
  );

  const setColorRules = useCallback(
    (next: ColorRule[]) => {
      persist({ colorRules: next });
      setColorRulesState(next);
    },
    [persist],
  );

  const setBaseCarryover = useCallback(
    (value: number) => {
      persist({ baseCarryover: value });
      setBaseCarryoverState(value);
    },
    [persist],
  );

  const setMonthCarryover = useCallback(
    (key: string, value: number | null) => {
      setMonthCarryoversState((current) => {
        const next = { ...current };
        if (value === null) delete next[key];
        else next[key] = value;
        persist({ monthCarryovers: next });
        return next;
      });
    },
    [persist],
  );

  const setChartSignColors = useCallback(
    (next: ChartSignColors) => {
      persist({ chartSignColors: next });
      setChartSignColorsState(next);
    },
    [persist],
  );

  const setCalendarPnlSize = useCallback(
    (next: CalendarPnlSize) => {
      persist({ calendarPnlSize: next });
      setCalendarPnlSizeState(next);
    },
    [persist],
  );

  const setLocale = useCallback(
    (next: Locale) => {
      persist({ locale: next });
      setLocaleState(next);
    },
    [persist],
  );

  const setCurrency = useCallback(
    (next: Currency) => {
      persist({ currency: next });
      setCurrencyState(next);
    },
    [persist],
  );

  const resetSample = useCallback(() => {
    const locale = snapshotRef.current?.locale ?? DEFAULT_LOCALE;
    const currency = snapshotRef.current?.currency ?? DEFAULT_CURRENCY;
    const snapshot: Snapshot = {
      records: SAMPLE_RECORDS,
      categories: DEFAULT_CATEGORIES,
      colorRules: DEFAULT_COLOR_RULES,
      baseCarryover: 0,
      monthCarryovers: {},
      chartSignColors: { ...DEFAULT_CHART_SIGN_COLORS },
      calendarPnlSize: DEFAULT_CALENDAR_PNL_SIZE,
      locale,
      currency,
    };
    snapshotRef.current = snapshot;
    writeSnapshot(snapshot);
    markSampleSeeds();
    setRecords(snapshot.records);
    setCategoriesState(snapshot.categories);
    setColorRulesState(snapshot.colorRules);
    setBaseCarryoverState(0);
    setMonthCarryoversState({});
    setChartSignColorsState(snapshot.chartSignColors);
    setCalendarPnlSizeState(snapshot.calendarPnlSize);
    setLocaleState(locale);
    setCurrencyState(currency);
  }, []);

  const clearInputs = useCallback(() => {
    persist({ records: [], baseCarryover: 0, monthCarryovers: {} });
    setRecords([]);
    setBaseCarryoverState(0);
    setMonthCarryoversState({});
  }, [persist]);

  const applyBackup = useCallback((payload: BackupPayload) => {
    const nextCategories = payload.settings.categories.length ? payload.settings.categories : DEFAULT_CATEGORIES;
    const snapshot: Snapshot = {
      records: bindRecordCategories(payload.records, nextCategories),
      categories: nextCategories,
      colorRules: payload.settings.colorRules.length ? payload.settings.colorRules : DEFAULT_COLOR_RULES,
      baseCarryover: payload.settings.baseCarryover,
      monthCarryovers: payload.settings.monthCarryovers,
      chartSignColors: payload.settings.chartSignColors,
      calendarPnlSize: payload.settings.calendarPnlSize,
      locale: payload.settings.locale ?? snapshotRef.current?.locale ?? DEFAULT_LOCALE,
      currency: payload.settings.currency ?? snapshotRef.current?.currency ?? DEFAULT_CURRENCY,
    };
    snapshotRef.current = snapshot;
    writeSnapshot(snapshot);
    setRecords(snapshot.records);
    setCategoriesState(snapshot.categories);
    setColorRulesState(snapshot.colorRules);
    setBaseCarryoverState(snapshot.baseCarryover);
    setMonthCarryoversState(snapshot.monthCarryovers);
    setChartSignColorsState(snapshot.chartSignColors);
    setCalendarPnlSizeState(snapshot.calendarPnlSize);
    setLocaleState(snapshot.locale);
    setCurrencyState(snapshot.currency);
  }, []);

  return {
    records,
    categories,
    colorRules,
    baseCarryover,
    monthCarryovers,
    chartSignColors,
    calendarPnlSize,
    locale,
    currency,
    hydrated,
    upsert,
    remove,
    setCategories,
    setColorRules,
    setBaseCarryover,
    setMonthCarryover,
    setChartSignColors,
    setCalendarPnlSize,
    setLocale,
    setCurrency,
    resetSample,
    clearInputs,
    applyBackup,
  };
}
