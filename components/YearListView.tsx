"use client";

import { useMemo } from "react";
import { pnlStyle } from "@/lib/colors";
import { t } from "@/lib/i18n";
import { buildYearColumns, formatSigned, toDateKey } from "@/lib/pnl";
import type { ColorRule, DailyPnl, Locale, YearColumn } from "@/types/trade";

const CELL = "border border-[#b8bfc9]";
const STICKY = "sticky left-0 z-10 w-[4.6rem] min-w-[4.6rem] max-w-[4.6rem]";
const BASE_DIGITS = formatSigned(-999999).length;

function signedText(value: number) {
  return value > 0 ? "text-sky-700" : value < 0 ? "text-rose-600" : "text-slate-700";
}

function columnWidthCh(column: YearColumn, monthCarryovers: Record<string, number>): number {
  const texts = [formatSigned(column.total), formatSigned(column.equity)];
  for (const value of column.values) {
    if (value !== null) texts.push(formatSigned(value));
  }
  if (Object.prototype.hasOwnProperty.call(monthCarryovers, column.key)) {
    texts.push(formatSigned(monthCarryovers[column.key] ?? 0));
  }
  const widest = Math.max(BASE_DIGITS, ...texts.map((text) => text.length));
  return widest + 1;
}

type Props = {
  locale: Locale;
  records: DailyPnl[];
  colorRules: ColorRule[];
  monthCarryovers: Record<string, number>;
  baseCarryover: number;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onChangeCarryover: (monthKey: string, value: number | null) => void;
};

export function YearListView({
  locale,
  records,
  colorRules,
  monthCarryovers,
  baseCarryover,
  selectedDate,
  onSelectDate,
  onChangeCarryover,
}: Props) {
  const columns = useMemo(
    () => buildYearColumns(records, monthCarryovers, baseCarryover),
    [records, monthCarryovers, baseCarryover],
  );
  const widths = columns.map((column) => columnWidthCh(column, monthCarryovers));
  const sticky = locale === "en" ? "sticky left-0 z-10 w-[6.6rem] min-w-[6.6rem] max-w-[6.6rem]" : STICKY;
  const tableWidth = `calc(${locale === "en" ? "6.6rem" : "4.6rem"} + ${widths.reduce((sum, width) => sum + width, 0)}ch)`;

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-lg font-medium text-slate-800">{t(locale, "yearListTitle")}</h2>
        <p className="text-xs text-slate-500">{t(locale, "yearListHelp")}</p>
      </header>
      <div className="overflow-auto">
        <table className="table-fixed border-collapse text-right text-xs" style={{ width: tableWidth }}>
          <colgroup>
            <col style={{ width: locale === "en" ? "6.6rem" : "4.6rem" }} />
            {widths.map((width, index) => (
              <col key={columns[index].key} style={{ width: `${width}ch` }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th className={`${sticky} z-20 bg-slate-100 px-1 py-2 font-medium text-slate-500 ${CELL}`} />
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`overflow-hidden bg-slate-100 px-0.5 py-2 text-center font-bold text-slate-800 ${CELL}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
              <tr key={day}>
                <td className={`${sticky} bg-slate-100 px-1 py-1 text-center text-slate-600 ${CELL}`}>
                  {day}
                </td>
                {columns.map((column) => {
                  const invalid = day > column.days;
                  const value = invalid ? null : column.values[day - 1];
                  const date = toDateKey(column.year, column.month, day);
                  return (
                    <td
                      key={`${column.key}-${day}`}
                      onClick={() => {
                        if (!invalid) onSelectDate(date);
                      }}
                      className={`whitespace-nowrap py-1 pl-[1ch] pr-0.5 ${CELL} ${invalid ? "bg-slate-50" : "cursor-pointer"} ${
                        selectedDate === date ? "outline outline-2 outline-offset-[-2px] outline-sky-500" : ""
                      }`}
                      style={invalid || value === null ? undefined : pnlStyle(value, colorRules)}
                    >
                      {invalid || value === null ? "" : formatSigned(value)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className={`${sticky} bg-white px-1 py-2 font-medium text-slate-700 ${CELL}`}>{t(locale, "monthTotal")}</td>
              {columns.map((column) => (
                <td key={`${column.key}-total`} className={`whitespace-nowrap bg-white py-2 pl-[1ch] pr-0.5 font-medium ${CELL} ${signedText(column.total)}`}>
                  {formatSigned(column.total)}
                </td>
              ))}
            </tr>
            <tr>
              <td className={`${sticky} bg-white px-1 py-2 font-medium text-slate-700 ${CELL}`}>{t(locale, "cumulativePnl")}</td>
              {columns.map((column) => (
                <td key={`${column.key}-equity`} className={`whitespace-nowrap bg-white py-2 pl-[1ch] pr-0.5 font-medium ${CELL} ${signedText(column.equity)}`}>
                  {formatSigned(column.equity)}
                </td>
              ))}
            </tr>
            <tr>
              <td className={`${sticky} bg-white px-1 py-2 font-medium text-slate-700 ${CELL}`}>{t(locale, "adjusted")}</td>
              {columns.map((column) => (
                <td key={`${column.key}-corrected`} className={`bg-white py-1 pl-[1ch] pr-0.5 ${CELL}`}>
                  <input
                    type="number"
                    value={Object.prototype.hasOwnProperty.call(monthCarryovers, column.key) ? monthCarryovers[column.key] : ""}
                    placeholder={formatSigned(column.equity)}
                    onChange={(event) => {
                      const raw = event.target.value.trim();
                      if (raw === "") {
                        onChangeCarryover(column.key, null);
                        return;
                      }
                      const next = Number(raw);
                      if (!Number.isNaN(next)) onChangeCarryover(column.key, next);
                    }}
                    className="w-full bg-white py-0.5 text-right text-[11px] outline-none"
                    title={t(locale, "adjustedTitle")}
                  />
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
