"use client";

import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { CategoryTags } from "@/components/CategoryTag";
import { pnlStyle } from "@/lib/colors";
import { formatYen } from "@/lib/pnl";
import type { CalendarCell, CategoryOption, ColorRule } from "@/types/trade";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Props = {
  title: string;
  cells: CalendarCell[];
  selectedDate: string;
  colorRules: ColorRule[];
  categories: CategoryOption[];
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onSelectDate: (date: string) => void;
};

export function CalendarView({
  title,
  cells,
  selectedDate,
  colorRules,
  categories,
  onPrev,
  onNext,
  onToday,
  onSelectDate,
}: Props) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <h2 className="text-xl font-medium text-slate-700">{title}</h2>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <div className="flex overflow-hidden rounded-md border border-slate-200">
            <button type="button" onClick={onPrev} className="px-2 py-1.5 text-slate-500 hover:bg-slate-50" aria-label="前月">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={onNext} className="border-l border-slate-200 px-2 py-1.5 text-slate-500 hover:bg-slate-50" aria-label="翌月">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <button type="button" onClick={onToday} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-slate-600 hover:bg-slate-50">
            <Calendar className="h-4 w-4" />
            Today
          </button>
        </div>
      </header>

      <div className="grid grid-cols-7 border-b border-slate-100 bg-white text-center text-base font-semibold text-slate-700">
        {WEEKDAYS.map((label) => (
          <div key={label} className="px-2 py-2.5">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((cell) => {
          const selected = cell.date === selectedDate;
          return (
            <button
              type="button"
              key={cell.date}
              onClick={() => onSelectDate(cell.date)}
              className={`min-h-[118px] border-b border-r border-slate-100 p-2 text-left ${
                cell.inCurrentMonth ? "bg-white" : "bg-slate-50"
              } ${selected ? "ring-2 ring-inset ring-sky-400" : ""}`}
            >
              <div className={`mb-1 text-base font-medium ${cell.inCurrentMonth ? "text-slate-700" : "text-slate-300"}`}>
                {cell.day}
              </div>
              <div
                className="mb-1 truncate rounded px-1.5 py-0.5 text-xs"
                style={cell.profitLoss === null ? { color: "#94a3b8" } : pnlStyle(cell.profitLoss, colorRules)}
              >
                {cell.profitLoss === null ? "—" : formatYen(cell.profitLoss)}
              </div>
              <div className="mb-1 flex flex-wrap gap-1">
                {cell.categories.length ? <CategoryTags names={cell.categories} categories={categories} /> : "\u00A0"}
              </div>
              <div className={`truncate text-[11px] ${cell.inCurrentMonth ? "text-slate-500" : "text-slate-400"}`}>
                {cell.memo || "\u00A0"}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
