"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
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
import { CHART_BAR_DEFAULT } from "@/lib/colors";
import { t } from "@/lib/i18n";
import { chartRangePoints, daysInMonth, formatMoney, lastDayOfMonth, toDateKey } from "@/lib/pnl";
import type { ChartSignColors, Currency, DailyPnl, Locale } from "@/types/trade";

const AXIS_COLOR = "#4b5563";
const LINE_COLOR = "#1c2534";

type Props = {
  locale: Locale;
  currency: Currency;
  records: DailyPnl[];
  year: number;
  month: number;
  chartSignColors: ChartSignColors;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
};

function DateTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  return (
    <g transform={`translate(${x ?? 0},${y ?? 0})`}>
      <text dy={8} fontSize={10} fill={AXIS_COLOR} textAnchor="end" transform="rotate(-45)">
        {payload?.value}
      </text>
    </g>
  );
}

export function ChartView({ locale, currency, records, year, month, chartSignColors, onPrev, onNext, onToday }: Props) {
  const defaultStart = toDateKey(year, month, 1);
  const defaultEnd = lastDayOfMonth(year, month);
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);
  const [showDaily, setShowDaily] = useState(true);
  const [showCumulative, setShowCumulative] = useState(true);
  const [colorBySign, setColorBySign] = useState(false);

  const applyMonth = (nextYear: number, nextMonth: number) => {
    setStart(toDateKey(nextYear, nextMonth, 1));
    setEnd(toDateKey(nextYear, nextMonth, daysInMonth(nextYear, nextMonth)));
  };

  useEffect(() => {
    applyMonth(year, month);
  }, [year, month]);

  const data = useMemo(() => chartRangePoints(records, start, end), [records, start, end]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-medium text-slate-800">{t(locale, "chartTitle")}</h2>
          <p className="text-sm text-slate-500">{t(locale, "chartHelp")}</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-xs text-slate-500">
            {t(locale, "startDate")}
            <input type="date" value={start} onChange={(event) => setStart(event.target.value)} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm" />
          </label>
          <span className="pb-2 text-slate-400">〜</span>
          <label className="flex flex-col gap-1 text-xs text-slate-500">
            {t(locale, "endDate")}
            <input type="date" value={end} onChange={(event) => setEnd(event.target.value)} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm" />
          </label>
          <div className="flex overflow-hidden rounded-md border border-slate-300 bg-white">
            <button type="button" onClick={onPrev} className="px-2 py-1.5 text-slate-500 hover:bg-slate-50" aria-label={t(locale, "prevMonth")}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={onNext} className="border-l border-slate-200 px-2 py-1.5 text-slate-500 hover:bg-slate-50" aria-label={t(locale, "nextMonth")}>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <button type="button" onClick={onToday} className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
            <Calendar className="h-4 w-4" />
            {t(locale, "today")}
          </button>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-4 text-sm text-slate-700">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={showDaily} onChange={(event) => setShowDaily(event.target.checked)} />
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: colorBySign ? chartSignColors.positive : CHART_BAR_DEFAULT }} />
            {t(locale, "dailyPnl")}
          </span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={showCumulative} onChange={(event) => setShowCumulative(event.target.checked)} />
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4" style={{ backgroundColor: LINE_COLOR }} />
            {t(locale, "periodCumulative")}
          </span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={colorBySign} onChange={(event) => setColorBySign(event.target.checked)} />
          {t(locale, "colorBySign")}
        </label>
      </div>

      {data.length === 0 || (!showDaily && !showCumulative) ? (
        <div className="flex h-[480px] items-center justify-center text-sm text-slate-400">
          {data.length === 0 ? t(locale, "chartNoData") : t(locale, "chartNoSeries")}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={560}>
          <ComposedChart data={data} margin={{ top: 16, right: 12, left: 8, bottom: 44 }}>
            <CartesianGrid stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="label"
              interval={0}
              height={72}
              tick={<DateTick />}
              tickLine={false}
              axisLine={{ stroke: "#cbd5e1" }}
            />
            <YAxis
              tick={{ fill: AXIS_COLOR, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => formatMoney(value, currency)}
            />
            <Tooltip
              formatter={(value, name) => [
                typeof value === "number" ? formatMoney(value, currency) : value,
                name,
              ]}
              labelFormatter={(label) => String(label)}
            />
            {showDaily ? (
              <Bar dataKey="daily" name={t(locale, "dailyPnl")} maxBarSize={22} isAnimationActive={false}>
                {data.map((entry) => (
                  <Cell
                    key={entry.date}
                    fill={colorBySign ? (entry.daily >= 0 ? chartSignColors.positive : chartSignColors.negative) : CHART_BAR_DEFAULT}
                  />
                ))}
              </Bar>
            ) : null}
            <ReferenceLine y={0} stroke={AXIS_COLOR} strokeWidth={1.5} ifOverflow="extendDomain" isFront />
            {showCumulative ? (
              <Line
                type="linear"
                dataKey="periodCumulative"
                name={t(locale, "periodCumulative")}
                stroke={LINE_COLOR}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
              />
            ) : null}
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}
