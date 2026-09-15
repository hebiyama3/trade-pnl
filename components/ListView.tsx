"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { CategoryTags } from "@/components/CategoryTag";
import { pnlStyle } from "@/lib/colors";
import { formatMonthLabel, t } from "@/lib/i18n";
import { formatSigned } from "@/lib/pnl";
import type { CategoryOption, ColorRule, Locale, MonthBlock } from "@/types/trade";

type Props = {
  locale: Locale;
  blocks: MonthBlock[];
  selectedDate: string;
  colorRules: ColorRule[];
  categories: CategoryOption[];
  onSelectDate: (date: string) => void;
};

export function ListView({ locale, blocks, selectedDate, colorRules, categories, onSelectDate }: Props) {
  const selectedKey = selectedDate.slice(0, 7);
  const [openKeys, setOpenKeys] = useState<string[]>([selectedKey]);

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
                  {t(locale, "carryover")} {formatSigned(block.carryover)}
                </span>
              </span>
              <span className="rounded px-2 py-1 text-sm" style={pnlStyle(block.total, colorRules)}>
                {formatSigned(block.total)}
              </span>
            </button>
            {open ? (
              <div className="overflow-x-auto border-t border-slate-100">
                <table className="w-full border-collapse text-right text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600">
                      <th className="px-3 py-2 font-medium">{t(locale, "date")}</th>
                      <th className="px-3 py-2 font-medium">{t(locale, "pnl")}</th>
                      <th className="px-3 py-2 font-medium">{t(locale, "monthlyPnl")}</th>
                      <th className="px-3 py-2 font-medium">{t(locale, "cumulativePnl")}</th>
                      <th className="px-3 py-2 font-medium">{t(locale, "category")}</th>
                      <th className="px-3 py-2 text-left font-medium">{t(locale, "memo")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row) => (
                      <tr
                        key={row.date}
                        onClick={() => onSelectDate(row.date)}
                        className={`cursor-pointer ${selectedDate === row.date ? "ring-2 ring-inset ring-sky-400" : ""}`}
                      >
                        <td className="border-t border-slate-100 px-3 py-2 text-center text-slate-600">{row.day}</td>
                        <td className="border-t border-slate-100 px-3 py-2" style={pnlStyle(row.profitLoss, colorRules)}>
                          {row.profitLoss === null ? "" : formatSigned(row.profitLoss)}
                        </td>
                        <td
                          className={`border-t border-slate-100 bg-white px-3 py-2 ${
                            row.monthlyCumulative > 0 ? "text-sky-700" : row.monthlyCumulative < 0 ? "text-rose-600" : "text-slate-700"
                          }`}
                        >
                          {formatSigned(row.monthlyCumulative)}
                        </td>
                        <td
                          className={`border-t border-slate-100 bg-white px-3 py-2 ${
                            row.cumulative > 0 ? "text-sky-700" : row.cumulative < 0 ? "text-rose-600" : "text-slate-700"
                          }`}
                        >
                          {formatSigned(row.cumulative)}
                        </td>
                        <td className="border-t border-slate-100 px-3 py-2 text-right">
                          <CategoryTags names={row.categories} categories={categories} className="justify-end" />
                        </td>
                        <td className="border-t border-slate-100 px-3 py-2 text-left text-slate-500">{row.memo}</td>
                      </tr>
                    ))}
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
