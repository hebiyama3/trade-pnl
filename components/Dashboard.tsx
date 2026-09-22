"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, CalendarDays, List, Settings, Table2 } from "lucide-react";
import { CalendarView } from "@/components/CalendarView";
import { ChartView } from "@/components/ChartView";
import { ListView } from "@/components/ListView";
import { PnlForm } from "@/components/PnlForm";
import { SettingsView } from "@/components/SettingsView";
import { YearListView } from "@/components/YearListView";
import { formatMonthLabel, t } from "@/lib/i18n";
import {
  buildCalendarCells,
  buildRecordedMonthBlocks,
  monthPnlTotal,
  parseDateKey,
  shiftMonth,
  toDateKey,
} from "@/lib/pnl";
import { usePnlStore } from "@/lib/usePnlStore";
import { VIEW_PATHS, viewFromPath } from "@/lib/views";
import { buildBackup } from "@/lib/backup";
import type { ViewMode } from "@/types/trade";

const TABS: { id: ViewMode; icon: typeof List; labelKey: "tabList" | "tabChart" | "tabCalendar" | "tabYear" | "tabSettings" }[] = [
  { id: "calendar", labelKey: "tabCalendar", icon: CalendarDays },
  { id: "list", labelKey: "tabList", icon: List },
  { id: "chart", labelKey: "tabChart", icon: BarChart3 },
  { id: "year", labelKey: "tabYear", icon: Table2 },
  { id: "settings", labelKey: "tabSettings", icon: Settings },
];

function todayStamp() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    date: toDateKey(now.getFullYear(), now.getMonth() + 1, now.getDate()),
  };
}

export function Dashboard() {
  const store = usePnlStore();
  const locale = store.locale;
  const currency = store.currency;
  const pathname = usePathname();
  const router = useRouter();
  const view = viewFromPath(pathname);
  const [year, setYear] = useState(() => todayStamp().year);
  const [month, setMonth] = useState(() => todayStamp().month);
  const [selectedDate, setSelectedDate] = useState(() => todayStamp().date);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = t(locale, "appTitle");
  }, [locale]);

  const selectedRecord = store.records.find((item) => item.date === selectedDate) ?? null;
  const blocks = useMemo(
    () => buildRecordedMonthBlocks(store.records, store.monthCarryovers, store.baseCarryover),
    [store.records, store.monthCarryovers, store.baseCarryover],
  );
  const cells = useMemo(() => buildCalendarCells(store.records, year, month), [store.records, year, month]);

  const selectDate = (date: string) => {
    const parsed = parseDateKey(date);
    setSelectedDate(date);
    setYear(parsed.year);
    setMonth(parsed.month);
  };

  const goMonth = (delta: number) => {
    const next = shiftMonth(year, month, delta);
    setYear(next.year);
    setMonth(next.month);
  };

  const goToday = () => {
    selectDate(todayStamp().date);
  };

  return (
    <main className={`mx-auto px-4 py-6 sm:px-6 ${view === "year" ? "max-w-[1800px]" : "max-w-[1400px]"}`}>
      <header className="mb-5">
        <p className="text-xs font-medium tracking-wide text-slate-500">{t(locale, "brandKicker")}</p>
        <h1 className="text-2xl font-semibold text-slate-800">{t(locale, "appTitle")}</h1>
        <div className="mt-4 flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = view === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => router.push(VIEW_PATHS[tab.id])}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                  active ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t(locale, tab.labelKey)}
              </button>
            );
          })}
        </div>
      </header>

      {store.hydrated && view !== "settings" && view !== "chart" ? (
        <div className="mb-4">
          <PnlForm
            locale={locale}
            selectedDate={selectedDate}
            selectedRecord={selectedRecord}
            categories={store.categories}
            onDateChange={selectDate}
            onSave={store.upsert}
            onDelete={store.remove}
          />
        </div>
      ) : null}

      {!store.hydrated ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">{t(locale, "loading")}</div>
      ) : view === "list" ? (
        <ListView
          locale={locale}
          currency={currency}
          blocks={blocks}
          selectedDate={selectedDate}
          colorRules={store.colorRules}
          categories={store.categories}
          onSelectDate={selectDate}
        />
      ) : view === "chart" ? (
        <ChartView
          locale={locale}
          currency={currency}
          records={store.records}
          year={year}
          month={month}
          chartSignColors={store.chartSignColors}
          onPrev={() => goMonth(-1)}
          onNext={() => goMonth(1)}
          onToday={goToday}
        />
      ) : view === "calendar" ? (
        <CalendarView
          locale={locale}
          currency={currency}
          title={formatMonthLabel(locale, year, month)}
          monthTotal={monthPnlTotal(store.records, year, month)}
          cells={cells}
          selectedDate={selectedDate}
          colorRules={store.colorRules}
          categories={store.categories}
          pnlSize={store.calendarPnlSize}
          display={store.calendarDisplay}
          onChangePnlSize={store.setCalendarPnlSize}
          onChangeDisplay={store.setCalendarDisplay}
          onPrev={() => goMonth(-1)}
          onNext={() => goMonth(1)}
          onToday={goToday}
          onSelectDate={selectDate}
        />
      ) : view === "year" ? (
        <YearListView
          locale={locale}
          currency={currency}
          records={store.records}
          colorRules={store.colorRules}
          monthCarryovers={store.monthCarryovers}
          baseCarryover={store.baseCarryover}
          selectedDate={selectedDate}
          onSelectDate={selectDate}
          onChangeCarryover={store.setMonthCarryover}
        />
      ) : (
        <SettingsView
          locale={locale}
          currency={currency}
          recordsCount={store.records.length}
          categories={store.categories}
          colorRules={store.colorRules}
          baseCarryover={store.baseCarryover}
          monthCarryovers={store.monthCarryovers}
          chartSignColors={store.chartSignColors}
          onChangeLocale={store.setLocale}
          onChangeCurrency={store.setCurrency}
          onChangeCategories={store.setCategories}
          onChangeRules={store.setColorRules}
          onChangeBaseCarryover={store.setBaseCarryover}
          onChangeChartSignColors={store.setChartSignColors}
          onResetSample={store.resetSample}
          onClearInputs={store.clearInputs}
          onExportBackup={() =>
            buildBackup({
              records: store.records,
              categories: store.categories,
              colorRules: store.colorRules,
              baseCarryover: store.baseCarryover,
              monthCarryovers: store.monthCarryovers,
              chartSignColors: store.chartSignColors,
              calendarPnlSize: store.calendarPnlSize,
              calendarDisplay: store.calendarDisplay,
              locale: store.locale,
              currency: store.currency,
            })
          }
          onImportBackup={store.applyBackup}
        />
      )}
    </main>
  );
}
