import { DEFAULT_CHART_SIGN_COLORS, DEFAULT_CALENDAR_PNL_SIZE, DEFAULT_TAG_BACKGROUND, DEFAULT_TAG_COLOR, normalizeCalendarPnlSize, toColorInput } from "@/lib/colors";
import { normalizeCategoryList } from "@/lib/pnl";
import type { CalendarPnlSize, CategoryOption, ChartSignColors, ColorRule, DailyPnl, Locale } from "@/types/trade";
import { DEFAULT_LOCALE, normalizeLocale } from "@/lib/i18n";

export const BACKUP_FILENAME = "trade_pnl_backup.json";

export type BackupPayload = {
  version: 1;
  exportedAt: string;
  records: DailyPnl[];
  settings: {
    categories: CategoryOption[];
    colorRules: ColorRule[];
    baseCarryover: number;
    monthCarryovers: Record<string, number>;
    chartSignColors: ChartSignColors;
    calendarPnlSize: CalendarPnlSize;
    locale: Locale;
  };
};

export function newCategoryId(): string {
  return `cat-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function normalizeCategories(value: unknown): CategoryOption[] {
  if (!Array.isArray(value) || value.length === 0) return [];
  const next: CategoryOption[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    let name = "";
    let id = "";
    let background = DEFAULT_TAG_BACKGROUND;
    let color = DEFAULT_TAG_COLOR;
    if (typeof item === "string" && item.trim()) {
      name = item.trim();
      id = name;
    } else if (item && typeof item === "object" && "name" in item && typeof (item as CategoryOption).name === "string") {
      const category = item as CategoryOption & { id?: unknown };
      name = category.name.trim();
      id = typeof category.id === "string" && category.id.trim() ? category.id.trim() : name;
      background = toColorInput(category.background, DEFAULT_TAG_BACKGROUND);
      color = toColorInput(category.color, DEFAULT_TAG_COLOR);
    }
    if (!name || seen.has(id)) continue;
    seen.add(id);
    next.push({ id, name, background, color });
  }
  return next;
}

export function bindRecordCategories(records: DailyPnl[], categories: CategoryOption[]): DailyPnl[] {
  return records.map((record) => ({
    ...record,
    categories: Array.from(
      new Set(
        record.categories.map((token) => {
          const byId = categories.find((item) => item.id === token);
          if (byId) return byId.id;
          const byName = categories.find((item) => item.name === token);
          if (byName) return byName.id;
          return token;
        }),
      ),
    ),
  }));
}

export function normalizeChartSignColors(value: unknown): ChartSignColors {
  if (!value || typeof value !== "object") return { ...DEFAULT_CHART_SIGN_COLORS };
  const parsed = value as Partial<ChartSignColors>;
  return {
    positive: toColorInput(parsed.positive, DEFAULT_CHART_SIGN_COLORS.positive),
    negative: toColorInput(parsed.negative, DEFAULT_CHART_SIGN_COLORS.negative),
  };
}

export function normalizeMonthCarryovers(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object") return {};
  const next: Record<string, number> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (typeof raw === "number" && Number.isFinite(raw)) next[key] = raw;
  }
  return next;
}

export function normalizeColorRules(value: unknown): ColorRule[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const rule = item as Partial<ColorRule>;
      if (typeof rule.id !== "string" || typeof rule.label !== "string") return null;
      if (typeof rule.background !== "string" || typeof rule.color !== "string") return null;
      const min = rule.min === null || typeof rule.min === "number" ? rule.min : null;
      const max = rule.max === null || typeof rule.max === "number" ? rule.max : null;
      return { id: rule.id, label: rule.label, min, max, background: rule.background, color: rule.color };
    })
    .filter((item): item is ColorRule => item !== null);
}

export function buildBackup(input: {
  records: DailyPnl[];
  categories: CategoryOption[];
  colorRules: ColorRule[];
  baseCarryover: number;
  monthCarryovers: Record<string, number>;
  chartSignColors: ChartSignColors;
  calendarPnlSize: CalendarPnlSize;
  locale: Locale;
}): BackupPayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    records: input.records,
    settings: {
      categories: input.categories,
      colorRules: input.colorRules,
      baseCarryover: input.baseCarryover,
      monthCarryovers: input.monthCarryovers,
      chartSignColors: input.chartSignColors,
      calendarPnlSize: input.calendarPnlSize,
      locale: input.locale,
    },
  };
}

export function parseBackup(raw: unknown): BackupPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Partial<BackupPayload> & { records?: unknown; settings?: Partial<BackupPayload["settings"]> };
  if (!Array.isArray(data.records)) return null;
  const records = data.records
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Partial<DailyPnl> & { category?: unknown };
      if (typeof record.date !== "string" || typeof record.profitLoss !== "number") return null;
      return {
        date: record.date,
        profitLoss: record.profitLoss,
        memo: typeof record.memo === "string" ? record.memo : "",
        categories: normalizeCategoryList(record.categories ?? record.category),
      } satisfies DailyPnl;
    })
    .filter((item): item is DailyPnl => item !== null);

  const settings: Partial<BackupPayload["settings"]> = data.settings ?? {};
  const categories = normalizeCategories(settings.categories);
  const colorRules = normalizeColorRules(settings.colorRules);
  if (records.length === 0 && categories.length === 0 && colorRules.length === 0) return null;

  return {
    version: 1,
    exportedAt: typeof data.exportedAt === "string" ? data.exportedAt : new Date().toISOString(),
    records: bindRecordCategories(records, categories),
    settings: {
      categories,
      colorRules,
      baseCarryover: typeof settings.baseCarryover === "number" ? settings.baseCarryover : 0,
      monthCarryovers: normalizeMonthCarryovers(settings.monthCarryovers),
      chartSignColors: normalizeChartSignColors(settings.chartSignColors),
      calendarPnlSize: normalizeCalendarPnlSize(settings.calendarPnlSize),
      locale: normalizeLocale(settings.locale ?? DEFAULT_LOCALE),
    },
  };
}

export function downloadBackup(payload: BackupPayload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = BACKUP_FILENAME;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
