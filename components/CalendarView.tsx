"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { CategoryTags } from "@/components/CategoryTag";
import { calendarPnlSizeClass, pnlStyle } from "@/lib/colors";
import { t, WEEKDAY_KEYS } from "@/lib/i18n";
import { formatMoney } from "@/lib/pnl";
import type { CalendarCell, CalendarDisplay, CalendarPnlSize, CategoryOption, ColorRule, Currency, Locale } from "@/types/trade";

type Props = {
  locale: Locale;
  currency: Currency;
  title: string;
  monthTotal: number;
  cells: CalendarCell[];
  selectedDate: string;
  colorRules: ColorRule[];
  categories: CategoryOption[];
  pnlSize: CalendarPnlSize;
  display: CalendarDisplay;
  onChangePnlSize: (size: CalendarPnlSize) => void;
  onChangeDisplay: (patch: Partial<CalendarDisplay>) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onSelectDate: (date: string) => void;
};

export function CalendarView({
  locale,
  currency,
  title,
  monthTotal,
  cells,
  selectedDate,
  colorRules,
  categories,
  pnlSize,
  display,
  onChangePnlSize,
  onChangeDisplay,
  onPrev,
  onNext,
  onToday,
  onSelectDate,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    return () => window.removeEventListener("mousedown", onPointer);
  }, []);

  const compact = !display.showCategories && !display.showMemos;
  const menuToggleClass = (active: boolean) =>
    `flex-1 rounded-md px-2 py-1 text-sm ${
      active ? "bg-slate-800 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
    }`;

  return (
    <section className="overflow-hidden rounded-xl border border-slate-400 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-100 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="rounded-md p-1.5 text-slate-600 hover:bg-slate-200"
              aria-label={t(locale, "calendarMenu")}
            >
              <Menu className="h-5 w-5" />
            </button>
            {menuOpen ? (
              <div className="absolute left-0 z-30 mt-1 w-64 rounded-md border border-slate-200 bg-white p-2 shadow-lg">
                <div className="px-2 pt-1">
                  <p className="mb-2 text-xs text-slate-500">{t(locale, "calendarDisplayTitle")}</p>
                  <div className="mb-1 flex gap-1">
                    <button
                      type="button"
                      aria-pressed={display.showCategories}
                      onClick={() => onChangeDisplay({ showCategories: !display.showCategories })}
                      className={menuToggleClass(display.showCategories)}
                    >
                      {t(locale, "category")}
                    </button>
                    <button
                      type="button"
                      aria-pressed={display.showMemos}
                      onClick={() => onChangeDisplay({ showMemos: !display.showMemos })}
                      className={menuToggleClass(display.showMemos)}
                    >
                      {t(locale, "memo")}
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      aria-pressed={display.showMonthTotal}
                      onClick={() => onChangeDisplay({ showMonthTotal: !display.showMonthTotal })}
                      className={menuToggleClass(display.showMonthTotal)}
                    >
                      {t(locale, "displayTotal")}
                    </button>
                    <button
                      type="button"
                      aria-pressed={display.showAdjacentDays}
                      onClick={() => onChangeDisplay({ showAdjacentDays: !display.showAdjacentDays })}
                      className={menuToggleClass(display.showAdjacentDays)}
                    >
                      {t(locale, "displayAdjacent")}
                    </button>
                  </div>
                </div>
                <div className="mt-2 border-t border-slate-100 px-2 pt-2">
                  <p className="mb-2 text-xs text-slate-500">{t(locale, "calendarSizeTitle")}</p>
                  <div className="flex gap-1">
                    {(
                      [
                        { id: "s", labelKey: "sizeS" },
                        { id: "m", labelKey: "sizeM" },
                        { id: "l", labelKey: "sizeL" },
                      ] as const
                    ).map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => onChangePnlSize(option.id)}
                        className={menuToggleClass(pnlSize === option.id)}
                      >
                        {t(locale, option.labelKey)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          <h2 className="text-xl font-medium text-slate-700">{title}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <div className="flex overflow-hidden rounded-md border border-slate-300 bg-white">
            <button type="button" onClick={onPrev} className="px-2 py-1.5 text-slate-500 hover:bg-slate-50" aria-label={t(locale, "prevMonth")}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={onNext} className="border-l border-slate-200 px-2 py-1.5 text-slate-500 hover:bg-slate-50" aria-label={t(locale, "nextMonth")}>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <button type="button" onClick={onToday} className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-slate-600 hover:bg-slate-50">
            <Calendar className="h-4 w-4" />
            {t(locale, "today")}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-7 border-b border-slate-100 bg-white text-center text-base font-semibold text-slate-700">
        {WEEKDAY_KEYS.map((key) => (
          <div key={key} className="px-2 py-2.5">
            {t(locale, key)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((cell) => {
          const selected = cell.date === selectedDate;
          const showContent = cell.inCurrentMonth || display.showAdjacentDays;
          return (
            <button
              type="button"
              key={cell.date}
              onClick={() => onSelectDate(cell.date)}
              className={`${compact ? "min-h-[88px]" : "min-h-[118px]"} border-b border-r border-slate-100 p-2 text-left ${
                cell.inCurrentMonth || !display.showAdjacentDays ? "bg-white" : "bg-slate-50"
              } ${selected ? "ring-2 ring-inset ring-slate-800" : ""}`}
            >
              {showContent ? (
                <>
                  <div className={`mb-1 text-base font-medium ${cell.inCurrentMonth ? "text-slate-700" : "text-slate-300"}`}>
                    {cell.day}
                  </div>
                  <div
                    className={`mb-1 inline-block max-w-full truncate rounded-md px-2.5 py-1 ${calendarPnlSizeClass(pnlSize)}`}
                    style={cell.profitLoss === null ? { color: "#94a3b8" } : pnlStyle(cell.profitLoss, colorRules)}
                  >
                    {cell.profitLoss === null ? "—" : formatMoney(cell.profitLoss, currency)}
                  </div>
                  {display.showCategories ? (
                    <div className="mb-1 flex flex-wrap gap-1">
                      {cell.categories.length ? <CategoryTags names={cell.categories} categories={categories} /> : "\u00A0"}
                    </div>
                  ) : null}
                  {display.showMemos ? (
                    <div className={`truncate text-[11px] ${cell.inCurrentMonth ? "text-slate-500" : "text-slate-400"}`}>
                      {cell.memo || "\u00A0"}
                    </div>
                  ) : null}
                </>
              ) : null}
            </button>
          );
        })}
      </div>

      {display.showMonthTotal ? (
        <footer className="flex items-center justify-center border-t border-slate-100 bg-white px-4 py-4">
          <span
            className={`text-2xl font-medium ${
              monthTotal > 0 ? "text-sky-700" : monthTotal < 0 ? "text-rose-600" : "text-slate-700"
            }`}
          >
            {formatMoney(monthTotal, currency)}
          </span>
        </footer>
      ) : null}
    </section>
  );
}
