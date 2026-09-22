import type { CalendarCell, Currency, DailyPnl, MonthBlock, MonthRow, YearColumn } from "@/types/trade";

export const STORAGE_RECORDS = "trade-pnl.records.v3";
export const STORAGE_SETTINGS = "trade-pnl.settings.v7";
export const LEGACY_SETTINGS_KEYS = ["trade-pnl.settings.v6", "trade-pnl.settings.v5", "trade-pnl.settings.v4", "trade-pnl.settings.v3"];
export const STORAGE_SEED = "trade-pnl.seed.sep2026-v3";
export const STORAGE_SEED_JUNJUL = "trade-pnl.seed.junjul2026-v1";
export const LEGACY_STORAGE_KEYS = ["trade-pnl.records.v2", "trade-pnl.records.v1"];

export function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function parseDateKey(date: string): { year: number; month: number; day: number } {
  const [year, month, day] = date.split("-").map(Number);
  return { year, month, day };
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function monthKey(year: number, month: number): string {
  return `${year}-${pad2(month)}`;
}

export function monthLabel(year: number, month: number): string {
  return `${year}年${month}月`;
}

export function monthShortLabel(year: number, month: number): string {
  return `${pad2(year % 100)}-${pad2(month)}`;
}

export function monthTitle(year: number, month: number): string {
  return `${year}年${month}月`;
}

export const DEFAULT_CURRENCY: Currency = "¥";
export const CURRENCIES: Currency[] = ["¥", "$", "€"];

export function normalizeCurrency(value: unknown): Currency {
  return value === "$" || value === "€" ? value : DEFAULT_CURRENCY;
}

export function formatSigned(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function formatMoney(value: number, currency: Currency = DEFAULT_CURRENCY): string {
  const abs = Math.abs(value).toLocaleString("en-US");
  return value < 0 ? `-${currency}${abs}` : `${currency}${abs}`;
}

export function formatYen(value: number): string {
  return formatMoney(value, DEFAULT_CURRENCY);
}

export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const date = new Date(year, month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function normalizeCategoryList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim() !== "").map((item) => item.trim());
  }
  if (typeof value === "string" && value.trim() !== "") return [value.trim()];
  return [];
}

export function normalizeDailyPnl(value: unknown): DailyPnl | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Partial<DailyPnl> & { category?: unknown };
  if (typeof record.date !== "string") return null;

  let profitLoss: number | null;
  if (record.profitLoss === null || record.profitLoss === undefined) {
    profitLoss = null;
  } else if (typeof record.profitLoss === "number" && Number.isFinite(record.profitLoss)) {
    profitLoss = record.profitLoss;
  } else {
    return null;
  }

  const memo = typeof record.memo === "string" ? record.memo : "";
  const categories = normalizeCategoryList(record.categories ?? record.category);
  if (profitLoss === null && memo.trim() === "" && categories.length === 0) return null;

  return { date: record.date, profitLoss, memo, categories };
}

export function recordsByDate(records: DailyPnl[]): Map<string, DailyPnl> {
  const map = new Map<string, DailyPnl>();
  for (const record of records) map.set(record.date, record);
  return map;
}

export function monthPnlTotal(records: DailyPnl[], year: number, month: number): number {
  const prefix = `${monthKey(year, month)}-`;
  return records.filter((item) => item.date.startsWith(prefix)).reduce((sum, item) => sum + (item.profitLoss ?? 0), 0);
}

export function consecutiveMonths(
  records: DailyPnl[],
  extraStart = 0,
  extraEnd = 0,
): { year: number; month: number }[] {
  if (records.length === 0) return [];
  const parsed = records.map((item) => parseDateKey(item.date));
  parsed.sort((a, b) => a.year - b.year || a.month - b.month);
  let start = shiftMonth(parsed[0].year, parsed[0].month, extraStart);
  const end = shiftMonth(parsed[parsed.length - 1].year, parsed[parsed.length - 1].month, extraEnd);
  const list: { year: number; month: number }[] = [];
  while (start.year < end.year || (start.year === end.year && start.month <= end.month)) {
    list.push(start);
    start = shiftMonth(start.year, start.month, 1);
  }
  return list;
}

export function resolveMonthCarryover(
  year: number,
  month: number,
  records: DailyPnl[],
  monthEndCorrections: Record<string, number>,
  baseCarryover: number,
): number {
  const months = consecutiveMonths(records);
  if (months.length === 0) return baseCarryover;

  const first = months[0];
  const targetIndex = (year - first.year) * 12 + (month - first.month);
  if (targetIndex <= 0) return baseCarryover;

  let startBalance = baseCarryover;
  let cursor = first;
  for (let i = 0; i < targetIndex; i += 1) {
    const cursorKey = monthKey(cursor.year, cursor.month);
    const autoEnd = startBalance + monthPnlTotal(records, cursor.year, cursor.month);
    startBalance = Object.prototype.hasOwnProperty.call(monthEndCorrections, cursorKey)
      ? monthEndCorrections[cursorKey] ?? autoEnd
      : autoEnd;
    cursor = shiftMonth(cursor.year, cursor.month, 1);
  }
  return startBalance;
}

export function buildMonthRows(
  records: DailyPnl[],
  year: number,
  month: number,
  carryover = 0,
): MonthRow[] {
  const byDate = recordsByDate(records);
  const lastDay = daysInMonth(year, month);
  const rows: MonthRow[] = [];
  let monthlyCumulative = 0;
  let cumulative = carryover;

  for (let day = 1; day <= lastDay; day += 1) {
    const date = toDateKey(year, month, day);
    const record = byDate.get(date);
    const profitLoss = record ? record.profitLoss : null;
    if (profitLoss !== null) {
      monthlyCumulative += profitLoss;
      cumulative += profitLoss;
    }
    rows.push({
      day,
      date,
      profitLoss,
      monthlyCumulative,
      cumulative,
      memo: record?.memo ?? "",
      categories: record?.categories ?? [],
    });
  }
  return rows;
}

export function monthTotal(rows: MonthRow[]): number {
  return rows.reduce((sum, row) => sum + (row.profitLoss ?? 0), 0);
}

export function monthsWithRecords(records: DailyPnl[]): { year: number; month: number }[] {
  const keys = new Set<string>();
  const list: { year: number; month: number }[] = [];
  for (const record of records) {
    const { year, month } = parseDateKey(record.date);
    const key = monthKey(year, month);
    if (keys.has(key)) continue;
    keys.add(key);
    list.push({ year, month });
  }
  return list.sort((a, b) => b.year - a.year || b.month - a.month);
}

export function buildRecordedMonthBlocks(
  records: DailyPnl[],
  monthCarryovers: Record<string, number> = {},
  baseCarryover = 0,
): MonthBlock[] {
  return monthsWithRecords(records).map(({ year, month }) => {
    const carryover = resolveMonthCarryover(year, month, records, monthCarryovers, baseCarryover);
    const rows = buildMonthRows(records, year, month, carryover);
    const total = monthTotal(rows);
    return { year, month, rows, total, carryover, equity: carryover + total };
  });
}

export function buildYearColumns(
  records: DailyPnl[],
  monthCarryovers: Record<string, number>,
  baseCarryover: number,
  extraStart = 0,
  extraEnd = 0,
): YearColumn[] {
  const byDate = recordsByDate(records);
  return consecutiveMonths(records, extraStart, extraEnd).map(({ year, month }) => {
    const days = daysInMonth(year, month);
    const values: (number | null)[] = [];
    for (let day = 1; day <= 31; day += 1) {
      if (day > days) {
        values.push(null);
        continue;
      }
      const record = byDate.get(toDateKey(year, month, day));
      values.push(record ? record.profitLoss : null);
    }
    const total = monthPnlTotal(records, year, month);
    const carryover = resolveMonthCarryover(year, month, records, monthCarryovers, baseCarryover);
    return {
      year,
      month,
      key: monthKey(year, month),
      label: monthShortLabel(year, month),
      days,
      values,
      total,
      carryover,
      equity: carryover + total,
    };
  });
}

export function buildCalendarCells(records: DailyPnl[], year: number, month: number): CalendarCell[] {
  const byDate = recordsByDate(records);
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const currentDays = daysInMonth(year, month);
  const prev = shiftMonth(year, month, -1);
  const prevDays = daysInMonth(prev.year, prev.month);
  const next = shiftMonth(year, month, 1);
  const cells: CalendarCell[] = [];

  const pushCell = (date: string, day: number, inCurrentMonth: boolean) => {
    const record = byDate.get(date);
    cells.push({
      date,
      day,
      inCurrentMonth,
      profitLoss: record ? record.profitLoss : null,
      memo: record?.memo ?? "",
      categories: record?.categories ?? [],
    });
  };

  for (let i = firstWeekday - 1; i >= 0; i -= 1) {
    pushCell(toDateKey(prev.year, prev.month, prevDays - i), prevDays - i, false);
  }
  for (let day = 1; day <= currentDays; day += 1) {
    pushCell(toDateKey(year, month, day), day, true);
  }
  let nextDay = 1;
  const weeks = Math.ceil(cells.length / 7);
  const cellCount = weeks * 7;
  while (cells.length < cellCount) {
    pushCell(toDateKey(next.year, next.month, nextDay), nextDay, false);
    nextDay += 1;
  }
  return cells;
}

export function lastDayOfMonth(year: number, month: number): string {
  return toDateKey(year, month, daysInMonth(year, month));
}

export function addDays(date: string, delta: number): string {
  const { year, month, day } = parseDateKey(date);
  const next = new Date(year, month - 1, day + delta);
  return toDateKey(next.getFullYear(), next.getMonth() + 1, next.getDate());
}

export function compactDateLabel(date: string): string {
  const { year, month, day } = parseDateKey(date);
  return `${year}${pad2(month)}${pad2(day)}`;
}

export function chartRangePoints(records: DailyPnl[], start: string, end: string, today?: string) {
  if (!start || !end || start > end) return [];
  const todayKey =
    today ??
    (() => {
      const now = new Date();
      return toDateKey(now.getFullYear(), now.getMonth() + 1, now.getDate());
    })();
  const byDate = recordsByDate(records);
  let lastRecordKey = "";
  for (const record of records) {
    if (record.date >= start && record.date <= end && record.date > lastRecordKey) lastRecordKey = record.date;
  }
  const cumulativeUntil = lastRecordKey > todayKey ? lastRecordKey : todayKey;
  const points: { date: string; label: string; daily: number; periodCumulative: number | null }[] = [];
  let running = 0;
  let cursor = start;
  while (cursor <= end) {
    const record = byDate.get(cursor);
    if (cursor < todayKey && !record) {
      cursor = addDays(cursor, 1);
      continue;
    }
    const daily = record?.profitLoss ?? 0;
    running += daily;
    points.push({
      date: cursor,
      label: compactDateLabel(cursor),
      daily,
      periodCumulative: cursor > cumulativeUntil ? null : running,
    });
    cursor = addDays(cursor, 1);
  }
  return points;
}
