"use client";

import { DEFAULT_CATEGORIES, DEFAULT_COLOR_RULES } from "@/lib/colors";
import type { CategoryOption, ColorRule } from "@/types/trade";

type Props = {
  categories: CategoryOption[];
  colorRules: ColorRule[];
  baseCarryover: number;
  onChangeCategories: (categories: CategoryOption[]) => void;
  onChangeRules: (rules: ColorRule[]) => void;
  onChangeBaseCarryover: (value: number) => void;
  onResetSample: () => void;
};

export function SettingsView({
  categories,
  colorRules,
  baseCarryover,
  onChangeCategories,
  onChangeRules,
  onChangeBaseCarryover,
  onResetSample,
}: Props) {
  const updateRule = (id: string, patch: Partial<ColorRule>) => {
    onChangeRules(colorRules.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)));
  };

  const updateCategory = (index: number, patch: Partial<CategoryOption>) => {
    const next = [...categories];
    next[index] = { ...next[index], ...patch };
    onChangeCategories(next);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-medium text-slate-800">繰越金</h2>
        <p className="mb-3 text-sm text-slate-500">
          最初の月より前の残高です。年間リストの「修正後」に月末残高を入れると、翌月以降の通算はその数字から計算します。
        </p>
        <label className="flex max-w-xs flex-col gap-1 text-sm">
          <span className="text-slate-500">初期繰越金</span>
          <input
            type="number"
            value={baseCarryover}
            onChange={(event) => onChangeBaseCarryover(Number(event.target.value) || 0)}
            className="rounded-md border border-slate-200 px-3 py-2"
          />
        </label>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium text-slate-800">項目</h2>
          <button
            type="button"
            onClick={() => onChangeCategories([...categories, { name: `項目${categories.length + 1}`, background: "#E2E8F0" }])}
            className="rounded-md bg-sky-600 px-3 py-1.5 text-sm text-white hover:bg-sky-700"
          >
            追加
          </button>
        </div>
        <p className="mb-3 text-sm text-slate-500">項目タグの背景色を指定できます。文字色は黒固定です。</p>
        <div className="space-y-2">
          {categories.map((item, index) => (
            <div key={`${item.name}-${index}`} className="flex items-center gap-2">
              <input
                value={item.name}
                onChange={(event) => updateCategory(index, { name: event.target.value })}
                className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
              <input type="color" value={item.background} onChange={(event) => updateCategory(index, { background: event.target.value })} />
              <span className="rounded px-2 py-1 text-sm" style={{ backgroundColor: item.background, color: "#000000" }}>
                {item.name || "項目"}
              </span>
              <button
                type="button"
                onClick={() => onChangeCategories(categories.filter((_, i) => i !== index))}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                削除
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => onChangeCategories(DEFAULT_CATEGORIES)} className="mt-3 text-sm text-sky-700 hover:underline">
          項目を初期値に戻す
        </button>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium text-slate-800">損益カラー</h2>
          <button
            type="button"
            onClick={() =>
              onChangeRules([
                ...colorRules,
                {
                  id: `custom-${Date.now()}`,
                  label: "新しいルール",
                  min: 0,
                  max: 0,
                  background: "#E6F3FF",
                  color: "#1D4ED8",
                },
              ])
            }
            className="rounded-md bg-sky-600 px-3 py-1.5 text-sm text-white hover:bg-sky-700"
          >
            ルール追加
          </button>
        </div>
        <p className="mb-3 text-sm text-slate-500">数値セルの条件付き書式です。上から順に最初に一致したルールを適用します。</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead className="bg-slate-100 text-left text-slate-600">
              <tr>
                <th className="px-2 py-2 font-medium">ラベル</th>
                <th className="px-2 py-2 font-medium">最小</th>
                <th className="px-2 py-2 font-medium">最大</th>
                <th className="px-2 py-2 font-medium">背景</th>
                <th className="px-2 py-2 font-medium">文字</th>
                <th className="px-2 py-2 font-medium">プレビュー</th>
                <th className="px-2 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {colorRules.map((rule) => (
                <tr key={rule.id} className="border-t border-slate-100">
                  <td className="px-2 py-2">
                    <input
                      value={rule.label}
                      onChange={(event) => updateRule(rule.id, { label: event.target.value })}
                      className="w-full rounded border border-slate-200 px-2 py-1"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      value={rule.min ?? ""}
                      onChange={(event) => updateRule(rule.id, { min: event.target.value === "" ? null : Number(event.target.value) })}
                      className="w-28 rounded border border-slate-200 px-2 py-1"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      value={rule.max ?? ""}
                      onChange={(event) => updateRule(rule.id, { max: event.target.value === "" ? null : Number(event.target.value) })}
                      className="w-28 rounded border border-slate-200 px-2 py-1"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input type="color" value={rule.background} onChange={(event) => updateRule(rule.id, { background: event.target.value })} />
                  </td>
                  <td className="px-2 py-2">
                    <input type="color" value={rule.color} onChange={(event) => updateRule(rule.id, { color: event.target.value })} />
                  </td>
                  <td className="px-2 py-2">
                    <span className="rounded px-2 py-1" style={{ backgroundColor: rule.background, color: rule.color }}>
                      12,345
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    <button type="button" onClick={() => onChangeRules(colorRules.filter((item) => item.id !== rule.id))} className="text-slate-500 hover:text-rose-600">
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" onClick={() => onChangeRules(DEFAULT_COLOR_RULES)} className="mt-3 text-sm text-sky-700 hover:underline">
          配色ルールを初期値に戻す
        </button>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-medium text-slate-800">データ</h2>
        <p className="mb-3 text-sm text-slate-500">サンプル損益・項目・配色・繰越金を初期状態に戻します。</p>
        <button type="button" onClick={onResetSample} className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
          サンプルデータを再投入
        </button>
      </section>
    </div>
  );
}
