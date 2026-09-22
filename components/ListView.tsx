"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { CategoryTags } from "@/components/CategoryTag";
import { pnlStyle } from "@/lib/colors";
import { formatMonthLabel, t } from "@/lib/i18n";
import { formatMoney, toDateKey } from "@/lib/pnl";
import type { CategoryOption, ColorRule, Currency, Locale, MonthBlock } from "@/types/trade";

const SELECTED = "#1e293b";

type Props = {
  locale: Locale;
  currency: Currency;
  blocks: MonthBlock[];
  selectedDate: string;
  colorRules: ColorRule[];
  categories: CategoryOption[];
  onSelectDate: (date: string) => void;
};

function selectedStyle(selected: boolean, edge: "first" | "middle" | "last", base?: CSSProperties): CSSProperties | undefined {
  if (!selected) return base;
  const topBottom = `inset 0 2px 0 0 ${SELECTED}, inset 0 -2px 0 0 ${SELECTED}`;
  const boxShadow =
    edge === "first"
      ? `inset 2px 0 0 0 ${SELECTED}, ${topBottom}`
      : edge === "last"
        ? `inset -2px 0 0 0 ${SELECTED}, ${topBottom}`
        : topBottom;
  return { ...base, boxShadow };
}

export function ListView({ locale, currency, blocks, selectedDate, colorRules, categories, onSelectDate }: Props) {
  const selectedKey = selectedDate.slice(0, 7);
  const [openKeys, setOpenKeys] = useState<string[]>([selectedKey]);
  const now = new Date();
  const todayKey = toDateKey(now.getFullYear(), now.getMonth() + 1, now.getDate());

  useEffect(() => {
    setOpenKeys((current) => (current.includes(selectedKey) ? current : [...current, selectedKey]));
  }, [selectedKey]);

  const toggle = (key: string) => {
    setOpenKeys((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key]));
  };

  if (blocks.length === 0) {
    return <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">{t(locale, "emptyData")}</div>;
  }

  return (
    <div className="space-y-3">
      {blocks.map((block) => {
        const key = `${block.year}-${String(block.month).padStart(2, "0")}`;
        const open = openKeys.includes(key);
        return (
          <section key={key} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => toggle(key)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50"
            >
              <span className="flex items-center gap-2 font-medium text-slate-800">
                {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                {formatMonthLabel(locale, block.year, block.month)}
                <span className="text-xs font-normal text-slate-500">
                  {t(locale, "carryover")} {formatMoney(block.carryover, currency)}
                </span>
              </span>
              <span className="rounded px-2 py-1 text-sm" style={pnlStyle(block.total, colorRules)}>
                {formatMoney(block.total, currency)}
              </span>
            </button>
            {open ? (
              <div className="overflow-x-auto border-t border-slate-100">
                <table className="w-full border-collapse text-right text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-center text-slate-600">
                      <th className="px-3 py-2 font-medium">{t(locale, "date")}</th>
                      <th className="px-3 py-2 font-medium">{t(locale, "pnl")}</th>
                      <th className="px-3 py-2 font-medium">{t(locale, "monthlyPnl")}</th>
                      <th className="px-3 py-2 font-medium">{t(locale, "cumulativePnl")}</th>
                      <th className="px-3 py-2 font-medium">{t(locale, "category")}</th>
                      <th className="px-3 py-2 font-medium">{t(locale, "memo")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row) => {
                      const selected = selectedDate === row.date;
                      const isToday = row.date === todayKey;
                      return (
                        <tr key={row.date} onClick={() => onSelectDate(row.date)} className="cursor-pointer">
                          <td
                            className={`border-t border-slate-100 px-3 py-2 text-center ${isToday ? "bg-slate-100 text-slate-800" : "text-slate-600"}`}
                            style={selectedStyle(selected, "first")}
                          >
                            {row.day}
                          </td>
                          <td
                            className="border-t border-slate-100 px-3 py-2"
                            style={selectedStyle(selected, "middle", pnlStyle(row.profitLoss, colorRules))}
                          >
                            {row.profitLoss === null
                              ? row.memo || row.categories.length
                                ? "—"
                                : ""
                              : formatMoney(row.profitLoss, currency)}
                          </td>
                          <td
                            className={`border-t border-slate-100 bg-white px-3 py-2 ${
                              row.monthlyCumulative > 0 ? "text-sky-700" : row.monthlyCumulative < 0 ? "text-rose-600" : "text-slate-700"
                            }`}
                            style={selectedStyle(selected, "middle")}
                          >
                            {formatMoney(row.monthlyCumulative, currency)}
                          </td>
                          <td
                            className={`border-t border-slate-100 bg-white px-3 py-2 ${
                              row.cumulative > 0 ? "text-sky-700" : row.cumulative < 0 ? "text-rose-600" : "text-slate-700"
                            }`}
                            style={selectedStyle(selected, "middle")}
                          >
                            {formatMoney(row.cumulative, currency)}
                          </td>
                          <td className="border-t border-slate-100 px-3 py-2 text-right" style={selectedStyle(selected, "middle")}>
                            <CategoryTags names={row.categories} categories={categories} className="justify-end" />
                          </td>
                          <td className="border-t border-slate-100 px-3 py-2 text-left text-slate-500" style={selectedStyle(selected, "last")}>
                            {row.memo}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
