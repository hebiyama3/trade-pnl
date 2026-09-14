"use client";

import { useRef, useState } from "react";
import { DEFAULT_CATEGORIES, DEFAULT_CHART_SIGN_COLORS, DEFAULT_COLOR_RULES, DEFAULT_TAG_BACKGROUND, DEFAULT_TAG_COLOR, toColorInput } from "@/lib/colors";
import { BACKUP_FILENAME, downloadBackup, parseBackup, type BackupPayload } from "@/lib/backup";
import type { CategoryOption, ChartSignColors, ColorRule } from "@/types/trade";

type Props = {
  recordsCount: number;
  categories: CategoryOption[];
  colorRules: ColorRule[];
  baseCarryover: number;
  monthCarryovers: Record<string, number>;
  chartSignColors: ChartSignColors;
  onChangeCategories: (categories: CategoryOption[]) => void;
  onChangeRules: (rules: ColorRule[]) => void;
  onChangeBaseCarryover: (value: number) => void;
  onChangeChartSignColors: (colors: ChartSignColors) => void;
  onResetSample: () => void;
  onExportBackup: () => BackupPayload;
  onImportBackup: (payload: BackupPayload) => void;
};

export function SettingsView({
  recordsCount,
  categories,
  colorRules,
  baseCarryover,
  monthCarryovers,
  chartSignColors,
  onChangeCategories,
  onChangeRules,
  onChangeBaseCarryover,
  onChangeChartSignColors,
  onResetSample,
  onExportBackup,
  onImportBackup,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const updateRule = (id: string, patch: Partial<ColorRule>) => {
    onChangeRules(colorRules.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)));
  };

  const updateCategory = (index: number, patch: Partial<CategoryOption>) => {
    const next = [...categories];
    next[index] = { ...next[index], ...patch };
    onChangeCategories(next);
  };

  const handleImport = async (file: File | undefined) => {
    if (!file) return;
    try {
      const parsed = parseBackup(JSON.parse(await file.text()) as unknown);
      if (!parsed) {
        setImportMessage("JSONの形式が正しくありません。");
        return;
      }
      const ok = window.confirm(
        `「${file.name}」で現在のデータを上書きします。\n損益 ${parsed.records.length} 件 / 項目 ${parsed.settings.categories.length} 件`,
      );
      if (!ok) {
        setImportMessage("復元をキャンセルしました。");
        return;
      }
      onImportBackup(parsed);
      setImportMessage("データを復元しました。");
    } catch {
      setImportMessage("ファイルの読み込みに失敗しました。");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
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
            onClick={() =>
              onChangeCategories([
                ...categories,
                { name: `項目${categories.length + 1}`, background: DEFAULT_TAG_BACKGROUND, color: DEFAULT_TAG_COLOR },
              ])
            }
            className="rounded-md bg-sky-600 px-3 py-1.5 text-sm text-white hover:bg-sky-700"
          >
            追加
          </button>
        </div>
        <p className="mb-3 text-sm text-slate-500">項目タグの背景色と文字色を指定できます。</p>
        <div className="space-y-2">
          {categories.map((item, index) => (
            <div key={`${item.name}-${index}`} className="flex flex-wrap items-center gap-2">
              <input
                value={item.name}
                onChange={(event) => updateCategory(index, { name: event.target.value })}
                className="min-w-[8rem] flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
              <label className="flex items-center gap-1 text-xs text-slate-500">
                背景
                <input
                  type="color"
                  value={toColorInput(item.background, DEFAULT_TAG_BACKGROUND)}
                  onChange={(event) => updateCategory(index, { background: event.target.value })}
                />
              </label>
              <label className="flex items-center gap-1 text-xs text-slate-500">
                文字
                <input
                  type="color"
                  value={toColorInput(item.color, DEFAULT_TAG_COLOR)}
                  onChange={(event) => updateCategory(index, { color: event.target.value })}
                />
              </label>
              <span className="rounded px-2 py-1 text-sm" style={{ backgroundColor: item.background, color: item.color }}>
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
                  background: "#cee9fb",
                  color: "#323232",
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
                    <input type="color" value={toColorInput(rule.background, "#cee9fb")} onChange={(event) => updateRule(rule.id, { background: event.target.value })} />
                  </td>
                  <td className="px-2 py-2">
                    <input type="color" value={toColorInput(rule.color, "#323232")} onChange={(event) => updateRule(rule.id, { color: event.target.value })} />
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
        <h2 className="mb-2 text-lg font-medium text-slate-800">グラフ色変更</h2>
        <p className="mb-3 text-sm text-slate-500">
          グラフの「色変更」がオンのときのプラス／マイナス棒の色です。オフ時は <span className="font-mono">#fbc02d</span> のままです。
        </p>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            プラス
            <input
              type="color"
              value={toColorInput(chartSignColors.positive, DEFAULT_CHART_SIGN_COLORS.positive)}
              onChange={(event) => onChangeChartSignColors({ ...chartSignColors, positive: event.target.value })}
            />
            <span className="rounded px-2 py-1 text-xs" style={{ backgroundColor: chartSignColors.positive, color: "#323232" }}>
              ＋
            </span>
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            マイナス
            <input
              type="color"
              value={toColorInput(chartSignColors.negative, DEFAULT_CHART_SIGN_COLORS.negative)}
              onChange={(event) => onChangeChartSignColors({ ...chartSignColors, negative: event.target.value })}
            />
            <span className="rounded px-2 py-1 text-xs" style={{ backgroundColor: chartSignColors.negative, color: "#323232" }}>
              −
            </span>
          </label>
        </div>
        <button
          type="button"
          onClick={() => onChangeChartSignColors({ ...DEFAULT_CHART_SIGN_COLORS })}
          className="mt-3 text-sm text-sky-700 hover:underline"
        >
          グラフ色を初期値に戻す
        </button>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-medium text-slate-800">バックアップ</h2>
        <p className="mb-3 text-sm text-slate-500">
          損益データと設定（項目・配色・繰越金・グラフ色）を JSON で保存・復元します。復元は現在のデータを上書きします。
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => downloadBackup(onExportBackup())}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-700"
          >
            データ出力（Export）
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            データ復元（Import）
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => void handleImport(event.target.files?.[0])}
          />
        </div>
        <p className="mt-2 text-xs text-slate-400">
          出力ファイル名: {BACKUP_FILENAME} ／ 現在 {recordsCount} 件、繰越修正 {Object.keys(monthCarryovers).length} 件
        </p>
        {importMessage ? <p className="mt-2 text-sm text-slate-600">{importMessage}</p> : null}
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
