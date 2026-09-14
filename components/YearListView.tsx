"use client";

import { useMemo } from "react";
import { pnlStyle } from "@/lib/colors";
import { buildYearColumns, formatSigned, toDateKey } from "@/lib/pnl";
import type { ColorRule, DailyPnl } from "@/types/trade";

const CELL = "border border-[#b8bfc9]";
const STICKY = "sticky left-0 z-10 w-[4.6rem] min-w-[4.6rem] max-w-[4.6rem]";

function signedText(value: number) {
  return value > 0 ? "text-sky-700" : value < 0 ? "text-rose-600" : "text-slate-700";
}

type Props = {
  records: DailyPnl[];
  colorRules: ColorRule[];
  monthCarryovers: Record<string, number>;
  baseCarryover: number;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onChangeCarryover: (monthKey: string, value: number | null) => void;
};

export function YearListView({
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

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-lg font-medium text-slate-800">年間リスト</h2>
        <p className="text-xs text-slate-500">「修正後」に月末残高を入れると、翌月以降の通算はその数字から計算します。</p>
      </header>
      <div className="overflow-auto">
        <table className="border-collapse text-right text-xs">
          <thead>
            <tr>
              <th className={`${STICKY} z-20 bg-slate-100 px-1 py-2 font-medium text-slate-500 ${CELL}`} />
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`w-[4.8rem] min-w-[4.8rem] max-w-[4.8rem] bg-slate-100 px-1 py-2 text-center font-bold text-slate-800 ${CELL}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
              <tr key={day}>
                <td className={`${STICKY} bg-slate-100 px-1 py-1 text-center text-slate-600 ${CELL}`}>
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
                      className={`w-[4.8rem] min-w-[4.8rem] max-w-[4.8rem] px-1 py-1 ${CELL} ${invalid ? "bg-slate-50" : "cursor-pointer"} ${
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
              <td className={`${STICKY} bg-white px-1 py-2 font-medium text-slate-700 ${CELL}`}>月次合計</td>
              {columns.map((column) => (
                <td key={`${column.key}-total`} className={`bg-white px-1 py-2 font-medium ${CELL} ${signedText(column.total)}`}>
                  {formatSigned(column.total)}
                </td>
              ))}
            </tr>
            <tr>
              <td className={`${STICKY} bg-white px-1 py-2 font-medium text-slate-700 ${CELL}`}>通算損益</td>
              {columns.map((column) => (
                <td key={`${column.key}-equity`} className={`bg-white px-1 py-2 font-medium ${CELL} ${signedText(column.equity)}`}>
                  {formatSigned(column.equity)}
                </td>
              ))}
            </tr>
            <tr>
              <td className={`${STICKY} bg-white px-1 py-2 font-medium text-slate-700 ${CELL}`}>修正後</td>
              {columns.map((column) => (
                <td key={`${column.key}-corrected`} className={`bg-white px-0.5 py-1 ${CELL}`}>
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
                    className="w-full bg-white px-0.5 py-0.5 text-right text-[11px] outline-none"
                    title="修正後の月末残高（翌月の起点）"
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
