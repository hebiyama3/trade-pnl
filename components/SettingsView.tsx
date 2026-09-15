"use client";

import { useRef, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { DEFAULT_CATEGORIES, DEFAULT_CHART_SIGN_COLORS, DEFAULT_COLOR_RULES, DEFAULT_TAG_BACKGROUND, DEFAULT_TAG_COLOR, toColorInput } from "@/lib/colors";
import { BACKUP_FILENAME, downloadBackup, newCategoryId, parseBackup, type BackupPayload } from "@/lib/backup";
import { t } from "@/lib/i18n";
import type { CalendarPnlSize, CategoryOption, ChartSignColors, ColorRule, Locale } from "@/types/trade";

type Props = {
  locale: Locale;
  recordsCount: number;
  categories: CategoryOption[];
  colorRules: ColorRule[];
  baseCarryover: number;
  monthCarryovers: Record<string, number>;
  chartSignColors: ChartSignColors;
  calendarPnlSize: CalendarPnlSize;
  onChangeLocale: (locale: Locale) => void;
  onChangeCategories: (categories: CategoryOption[]) => void;
  onChangeRules: (rules: ColorRule[]) => void;
  onChangeBaseCarryover: (value: number) => void;
  onChangeChartSignColors: (colors: ChartSignColors) => void;
  onChangeCalendarPnlSize: (size: CalendarPnlSize) => void;
  onResetSample: () => void;
  onClearInputs: () => void;
  onExportBackup: () => BackupPayload;
  onImportBackup: (payload: BackupPayload) => void;
};

export function SettingsView({
  locale,
  recordsCount,
  categories,
  colorRules,
  baseCarryover,
  monthCarryovers,
  chartSignColors,
  calendarPnlSize,
  onChangeLocale,
  onChangeCategories,
  onChangeRules,
  onChangeBaseCarryover,
  onChangeChartSignColors,
  onChangeCalendarPnlSize,
  onResetSample,
  onClearInputs,
  onExportBackup,
  onImportBackup,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<string[]>(["categories"]);
  const [confirm, setConfirm] = useState<{ message: string; onOk: () => void } | null>(null);

  const toggleSection = (key: string) => {
    setOpenSections((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key]));
  };

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
        setImportMessage(t(locale, "importInvalid"));
        return;
      }
      setConfirm({
        message: t(locale, "importConfirm", {
          name: file.name,
          records: parsed.records.length,
          categories: parsed.settings.categories.length,
        }),
        onOk: () => {
          onImportBackup(parsed);
          setImportMessage(t(locale, "importDone"));
        },
      });
    } catch {
      setImportMessage(t(locale, "importFailed"));
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-medium text-slate-800">{t(locale, "carryoverTitle")}</h2>
        <p className="mb-3 text-sm text-slate-500">{t(locale, "carryoverHelp")}</p>
        <label className="flex max-w-xs flex-col gap-1 text-sm">
          <span className="text-slate-500">{t(locale, "baseCarryover")}</span>
          <input
            type="number"
            value={baseCarryover}
            onChange={(event) => onChangeBaseCarryover(Number(event.target.value) || 0)}
            className="rounded-md border border-slate-200 px-3 py-2"
          />
        </label>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
          <button
            type="button"
            onClick={() => toggleSection("categories")}
            className="flex min-w-0 flex-1 items-center gap-2 text-left text-lg font-medium text-slate-800"
          >
            {openSections.includes("categories") ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            {t(locale, "category")}
          </button>
          <button
            type="button"
            onClick={() =>
              onChangeCategories([
                ...categories,
                { name: t(locale, "newCategory", { n: categories.length + 1 }), id: newCategoryId(), background: DEFAULT_TAG_BACKGROUND, color: DEFAULT_TAG_COLOR },
              ])
            }
            className="rounded-md bg-sky-600 px-3 py-1.5 text-sm text-white hover:bg-sky-700"
          >
            {t(locale, "add")}
          </button>
        </div>
        {openSections.includes("categories") ? (
          <div className="border-t border-slate-100 px-4 py-3">
        <p className="mb-3 text-sm text-slate-500">{t(locale, "categoriesHelp")}</p>
        <div className="space-y-2">
          {categories.map((item, index) => (
            <div key={item.id} className="flex flex-wrap items-center gap-2">
              <input
                value={item.name}
                onChange={(event) => updateCategory(index, { name: event.target.value })}
                className="min-w-[8rem] flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
              <label className="flex items-center gap-1 text-xs text-slate-500">
                {t(locale, "background")}
                <input
                  type="color"
                  value={toColorInput(item.background, DEFAULT_TAG_BACKGROUND)}
                  onChange={(event) => updateCategory(index, { background: event.target.value })}
                />
              </label>
              <label className="flex items-center gap-1 text-xs text-slate-500">
                {t(locale, "textColor")}
                <input
                  type="color"
                  value={toColorInput(item.color, DEFAULT_TAG_COLOR)}
                  onChange={(event) => updateCategory(index, { color: event.target.value })}
                />
              </label>
              <span className="rounded px-2 py-1 text-sm" style={{ backgroundColor: item.background, color: item.color }}>
                {item.name || t(locale, "categoryFallback")}
              </span>
              <button
                type="button"
                onClick={() => onChangeCategories(categories.filter((_, i) => i !== index))}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                {t(locale, "delete")}
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => onChangeCategories(DEFAULT_CATEGORIES)} className="mt-3 text-sm text-sky-700 hover:underline">
          {t(locale, "resetCategories")}
        </button>
          </div>
        ) : null}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
          <button
            type="button"
            onClick={() => toggleSection("colors")}
            className="flex min-w-0 flex-1 items-center gap-2 text-left text-lg font-medium text-slate-800"
          >
            {openSections.includes("colors") ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            {t(locale, "pnlColors")}
          </button>
          <button
            type="button"
            onClick={() =>
              onChangeRules([
                ...colorRules,
                {
                  id: `custom-${Date.now()}`,
                  label: t(locale, "newRule"),
                  min: 0,
                  max: 0,
                  background: "#cee9fb",
                  color: "#323232",
                },
              ])
            }
            className="rounded-md bg-sky-600 px-3 py-1.5 text-sm text-white hover:bg-sky-700"
          >
            {t(locale, "addRule")}
          </button>
        </div>
        {openSections.includes("colors") ? (
          <div className="border-t border-slate-100 px-4 py-3">
        <p className="mb-3 text-sm text-slate-500">{t(locale, "pnlColorsHelp")}</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead className="bg-slate-100 text-left text-slate-600">
              <tr>
                <th className="px-2 py-2 font-medium">{t(locale, "label")}</th>
                <th className="px-2 py-2 font-medium">{t(locale, "min")}</th>
                <th className="px-2 py-2 font-medium">{t(locale, "max")}</th>
                <th className="px-2 py-2 font-medium">{t(locale, "background")}</th>
                <th className="px-2 py-2 font-medium">{t(locale, "textColor")}</th>
                <th className="px-2 py-2 font-medium">{t(locale, "preview")}</th>
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
                      {t(locale, "delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" onClick={() => onChangeRules(DEFAULT_COLOR_RULES)} className="mt-3 text-sm text-sky-700 hover:underline">
          {t(locale, "resetColorRules")}
        </button>
          </div>
        ) : null}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <button type="button" onClick={() => toggleSection("chart")} className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-slate-50">
          {openSections.includes("chart") ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <span className="text-lg font-medium text-slate-800">{t(locale, "chartColors")}</span>
        </button>
        {openSections.includes("chart") ? (
          <div className="border-t border-slate-100 px-4 py-3">
        <p className="mb-3 text-sm text-slate-500">{t(locale, "chartColorsHelp", { color: "#fbc02d" })}</p>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            {t(locale, "positive")}
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
            {t(locale, "negative")}
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
          {t(locale, "resetChartColors")}
        </button>
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-medium text-slate-800">{t(locale, "calendarSizeTitle")}</h2>
        <p className="mb-3 text-sm text-slate-500">{t(locale, "calendarSizeHelp")}</p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "s", labelKey: "sizeS" },
              { id: "m", labelKey: "sizeM" },
              { id: "l", labelKey: "sizeL" },
            ] as const
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onChangeCalendarPnlSize(option.id)}
              className={`rounded-md px-3 py-1.5 text-sm ${
                calendarPnlSize === option.id ? "bg-slate-800 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t(locale, option.labelKey)}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-medium text-slate-800">{t(locale, "backupTitle")}</h2>
        <p className="mb-3 text-sm text-slate-500">{t(locale, "backupHelp")}</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => downloadBackup(onExportBackup())}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-700"
          >
            {t(locale, "exportData")}
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            {t(locale, "importData")}
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
          {t(locale, "backupMeta", { file: BACKUP_FILENAME, records: recordsCount, carryovers: Object.keys(monthCarryovers).length })}
        </p>
        {importMessage ? <p className="mt-2 text-sm text-slate-600">{importMessage}</p> : null}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-medium text-slate-800">{t(locale, "dataTitle")}</h2>
        <p className="mb-3 text-sm text-slate-500">{t(locale, "dataHelp")}</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              setConfirm({
                message: t(locale, "resetSampleConfirm"),
                onOk: onResetSample,
              })
            }
            className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            {t(locale, "resetSample")}
          </button>
          <button
            type="button"
            onClick={() =>
              setConfirm({
                message: t(locale, "clearInputsConfirm"),
                onOk: onClearInputs,
              })
            }
            className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            {t(locale, "clearInputs")}
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-medium text-slate-800">{t(locale, "language")}</h2>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "ja", label: t(locale, "languageJa") },
              { id: "en", label: t(locale, "languageEn") },
            ] as const
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onChangeLocale(option.id)}
              className={`rounded-md px-3 py-1.5 text-sm ${
                locale === option.id ? "bg-slate-800 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      {confirm ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={() => setConfirm(null)}
        >
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg" onClick={(event) => event.stopPropagation()}>
            <p className="text-sm text-slate-700">{confirm.message}</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirm(null)}
                className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                {t(locale, "cancel")}
              </button>
              <button
                type="button"
                onClick={() => {
                  confirm.onOk();
                  setConfirm(null);
                }}
                className="rounded-md bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-900"
              >
                {t(locale, "ok")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
