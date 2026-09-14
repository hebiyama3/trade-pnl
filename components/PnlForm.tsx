"use client";

import { useEffect, useState } from "react";
import { CategoryMultiSelect } from "@/components/CategoryMultiSelect";
import type { CategoryOption, DailyPnl } from "@/types/trade";

type Props = {
  selectedDate: string;
  selectedRecord: DailyPnl | null;
  categories: CategoryOption[];
  onDateChange: (date: string) => void;
  onSave: (record: DailyPnl) => void;
  onDelete: (date: string) => void;
};

export function PnlForm({
  selectedDate,
  selectedRecord,
  categories,
  onDateChange,
  onSave,
  onDelete,
}: Props) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(selectedRecord?.categories ?? []);

  useEffect(() => {
    setSelectedCategories(selectedRecord?.categories ?? []);
  }, [selectedDate, selectedRecord]);

  return (
    <form
      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const date = String(data.get("date") ?? "");
        const raw = String(data.get("profitLoss") ?? "").replace(/,/g, "").trim();
        const memo = String(data.get("memo") ?? "");
        if (!date || raw === "") return;
        const profitLoss = Number(raw);
        if (Number.isNaN(profitLoss)) return;
        onSave({ date, profitLoss, memo, categories: selectedCategories });
      }}
    >
      <label className="flex min-w-[140px] flex-col gap-1 text-sm">
        <span className="text-slate-500">日付</span>
        <input
          name="date"
          type="date"
          required
          value={selectedDate}
          onChange={(event) => onDateChange(event.target.value)}
          className="rounded-md border border-slate-200 px-3 py-2 outline-none ring-sky-200 focus:ring"
        />
      </label>
      <label className="flex min-w-[140px] flex-col gap-1 text-sm">
        <span className="text-slate-500">損益金額</span>
        <input
          key={`${selectedDate}-amount-${selectedRecord?.profitLoss ?? "empty"}`}
          name="profitLoss"
          type="number"
          step="1"
          defaultValue={selectedRecord?.profitLoss ?? ""}
          placeholder="例: 18000"
          className="rounded-md border border-slate-200 px-3 py-2 outline-none ring-sky-200 focus:ring"
        />
      </label>
      <div className="flex min-w-[200px] flex-col gap-1 text-sm">
        <span className="text-slate-500">項目</span>
        <CategoryMultiSelect options={categories} value={selectedCategories} onChange={setSelectedCategories} />
      </div>
      <label className="flex min-w-[180px] flex-1 flex-col gap-1 text-sm">
        <span className="text-slate-500">メモ</span>
        <input
          key={`${selectedDate}-memo-${selectedRecord?.memo ?? ""}`}
          name="memo"
          type="text"
          defaultValue={selectedRecord?.memo ?? ""}
          placeholder="自由記述"
          className="rounded-md border border-slate-200 px-3 py-2 outline-none ring-sky-200 focus:ring"
        />
      </label>
      <div className="flex gap-2">
        <button type="submit" className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700">
          保存
        </button>
        <button
          type="button"
          onClick={() => onDelete(selectedDate)}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          削除
        </button>
      </div>
    </form>
  );
}
