"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { chartRangePoints, daysInMonth, lastDayOfMonth, pad2, toDateKey } from "@/lib/pnl";
import type { DailyPnl } from "@/types/trade";

const AXIS_COLOR = "#4b5563";
const LINE_COLOR = "#1c2534";
const BAR_DEFAULT = "#fbc02d";
const BAR_POS = "#a2dafd";
const BAR_NEG = "#fdc1de";

type Props = {
  records: DailyPnl[];
  year: number;
  month: number;
};

export function ChartView({ records, year, month }: Props) {
  const defaultStart = toDateKey(year, month, 1);
  const defaultEnd = lastDayOfMonth(year, month);
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);
  const [showDaily, setShowDaily] = useState(true);
  const [showCumulative, setShowCumulative] = useState(true);
  const [colorBySign, setColorBySign] = useState(false);

  const data = useMemo(() => chartRangePoints(records, start, end), [records, start, end]);

  const applyMonth = (nextYear: number, nextMonth: number) => {
    setStart(toDateKey(nextYear, nextMonth, 1));
    setEnd(toDateKey(nextYear, nextMonth, daysInMonth(nextYear, nextMonth)));
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-medium text-slate-800">複合グラフ</h2>
          <p className="text-sm text-slate-500">開始日を0とした期間累計と日次損益を、単一のY軸で表示します。</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-xs text-slate-500">
            開始日
            <input type="date" value={start} onChange={(event) => setStart(event.target.value)} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm" />
          </label>
          <span className="pb-2 text-slate-400">〜</span>
          <label className="flex flex-col gap-1 text-xs text-slate-500">
            終了日
            <input type="date" value={end} onChange={(event) => setEnd(event.target.value)} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm" />
          </label>
          <button type="button" onClick={() => applyMonth(year, month)} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
            {year}/{pad2(month)}
          </button>
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              applyMonth(now.getFullYear(), now.getMonth() + 1);
            }}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            今月
          </button>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-4 text-sm text-slate-700">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={showDaily} onChange={(event) => setShowDaily(event.target.checked)} />
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: colorBySign ? BAR_POS : BAR_DEFAULT }} />
            日次損益
          </span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={showCumulative} onChange={(event) => setShowCumulative(event.target.checked)} />
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4" style={{ backgroundColor: LINE_COLOR }} />
            期間累計
          </span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={colorBySign} onChange={(event) => setColorBySign(event.target.checked)} />
          色変更
        </label>
      </div>

      {data.length === 0 || (!showDaily && !showCumulative) ? (
        <div className="flex h-[480px] items-center justify-center text-sm text-slate-400">
          {data.length === 0 ? "この期間の損益データがありません" : "表示する系列を選択してください"}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={520}>
          <ComposedChart data={data} margin={{ top: 16, right: 12, left: 8, bottom: 8 }}>
            <CartesianGrid stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: AXIS_COLOR, fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#cbd5e1" }} />
            <YAxis
              tick={{ fill: AXIS_COLOR, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => value.toLocaleString("en-US")}
            />
            <Tooltip
              formatter={(value, name) => [
                typeof value === "number" ? value.toLocaleString("en-US") : value,
                name,
              ]}
              labelFormatter={(label) => String(label)}
            />
            {showDaily ? (
              <Bar dataKey="daily" name="日次損益" maxBarSize={22} isAnimationActive={false}>
                {data.map((entry) => (
                  <Cell
                    key={entry.date}
                    fill={colorBySign ? (entry.daily >= 0 ? BAR_POS : BAR_NEG) : BAR_DEFAULT}
                  />
                ))}
              </Bar>
            ) : null}
            <ReferenceLine y={0} stroke={AXIS_COLOR} strokeWidth={1.5} ifOverflow="extendDomain" isFront />
            {showCumulative ? (
              <Line
                type="linear"
                dataKey="periodCumulative"
                name="期間累計"
                stroke={LINE_COLOR}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ) : null}
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}
