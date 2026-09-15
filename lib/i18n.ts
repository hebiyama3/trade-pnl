import type { Locale } from "@/types/trade";

export type { Locale };

export const DEFAULT_LOCALE: Locale = "ja";

export function normalizeLocale(value: unknown): Locale {
  return value === "en" ? "en" : "ja";
}

const ja = {
  brandKicker: "PERSONAL DAY TRADE",
  appTitle: "損益管理",
  tabList: "リスト",
  tabChart: "グラフ",
  tabCalendar: "カレンダー",
  tabYear: "年間リスト",
  tabSettings: "設定",
  loading: "データを読み込み中です…",
  emptyData: "データがありません。",

  date: "日付",
  pnlAmount: "損益金額",
  amountPlaceholder: "例: 18000",
  category: "項目",
  memo: "メモ",
  memoPlaceholder: "自由記述",
  save: "保存",
  delete: "削除",
  selectCategory: "項目を選択",
  categoryFallback: "項目",

  carryover: "繰越",
  pnl: "損益",
  monthlyPnl: "月次損益",
  cumulativePnl: "通算損益",

  chartTitle: "複合グラフ",
  chartHelp: "開始日を0とした期間累計と日次損益を、単一のY軸で表示します。",
  startDate: "開始日",
  endDate: "終了日",
  thisMonth: "今月",
  dailyPnl: "日次損益",
  periodCumulative: "期間累計",
  colorBySign: "色変更",
  chartNoData: "この期間の損益データがありません",
  chartNoSeries: "表示する系列を選択してください",

  prevMonth: "前月",
  nextMonth: "翌月",
  today: "今日",
  weekdaySun: "日",
  weekdayMon: "月",
  weekdayTue: "火",
  weekdayWed: "水",
  weekdayThu: "木",
  weekdayFri: "金",
  weekdaySat: "土",

  yearListTitle: "年間リスト",
  yearListHelp: "「修正後」に月末残高を入れると、翌月以降の通算はその数字から計算します。",
  monthTotal: "月次合計",
  adjusted: "修正後",
  adjustedTitle: "修正後の月末残高（翌月の起点）",

  language: "言語 / Language",
  languageJa: "日本語",
  languageEn: "English",

  carryoverTitle: "繰越金",
  carryoverHelp: "最初の月より前の残高です。年間リストの「修正後」に月末残高を入れると、翌月以降の通算はその数字から計算します。",
  baseCarryover: "初期繰越金",

  categoriesHelp: "項目タグの背景色と文字色を指定できます。名前を変えても、既存データは同じ項目のまま新しい表記で表示されます。",
  add: "追加",
  background: "背景",
  textColor: "文字",
  resetCategories: "項目を初期値に戻す",
  newCategory: "項目{n}",

  pnlColors: "損益カラー",
  addRule: "ルール追加",
  pnlColorsHelp: "数値セルの条件付き書式です。上から順に最初に一致したルールを適用します。",
  label: "ラベル",
  min: "最小",
  max: "最大",
  preview: "プレビュー",
  resetColorRules: "配色ルールを初期値に戻す",
  newRule: "新しいルール",

  chartColors: "グラフ色変更",
  chartColorsHelp: "グラフの「色変更」がオンのときのプラス／マイナス棒の色です。オフ時は {color} のままです。",
  positive: "プラス",
  negative: "マイナス",
  resetChartColors: "グラフ色を初期値に戻す",

  calendarSizeTitle: "カレンダー文字サイズ",
  calendarSizeHelp: "損益数字の大きさです。小が初期値、大は日付と同じサイズです。",
  sizeS: "小",
  sizeM: "中",
  sizeL: "大",

  backupTitle: "バックアップ",
  backupHelp: "損益データと設定（項目・配色・繰越金・グラフ色）を JSON で保存・復元します。復元は現在のデータを上書きします。",
  exportData: "データ出力（Export）",
  importData: "データ復元（Import）",
  backupMeta: "出力ファイル名: {file} ／ 現在 {records} 件、繰越修正 {carryovers} 件",
  importInvalid: "JSONの形式が正しくありません。",
  importCancelled: "復元をキャンセルしました。",
  importDone: "データを復元しました。",
  importFailed: "ファイルの読み込みに失敗しました。",
  importConfirm: "「{name}」で現在のデータを上書きします。損益 {records} 件 / 項目 {categories} 件",

  dataTitle: "データ",
  dataHelp: "サンプルの再投入は損益と設定を初期状態に戻します。入力値のクリアは損益と繰越金だけを空にし、項目や配色は残します。",
  resetSample: "サンプルデータを再投入",
  clearInputs: "入力値をすべてクリア",
  resetSampleConfirm: "サンプルデータを再投入します。現在の損益と設定は初期状態に戻ります。よろしいですか？",
  clearInputsConfirm: "入力した損益と繰越金をすべて削除し、空の状態で始めます。項目や配色の設定は残ります。よろしいですか？",
  cancel: "キャンセル",
  ok: "OK",
} as const;

const en: { [K in keyof typeof ja]: string } = {
  brandKicker: "PERSONAL DAY TRADE",
  appTitle: "P&L Tracker",
  tabList: "List",
  tabChart: "Chart",
  tabCalendar: "Calendar",
  tabYear: "Year list",
  tabSettings: "Settings",
  loading: "Loading data…",
  emptyData: "No data yet.",

  date: "Date",
  pnlAmount: "P&L",
  amountPlaceholder: "e.g. 18000",
  category: "Tags",
  memo: "Memo",
  memoPlaceholder: "Optional notes",
  save: "Save",
  delete: "Delete",
  selectCategory: "Select tags",
  categoryFallback: "Tag",

  carryover: "Carry",
  pnl: "P&L",
  monthlyPnl: "Month P&L",
  cumulativePnl: "Cumulative",

  chartTitle: "Combined chart",
  chartHelp: "Daily P&L and period cumulative from the start date, on a single Y-axis.",
  startDate: "Start",
  endDate: "End",
  thisMonth: "This month",
  dailyPnl: "Daily P&L",
  periodCumulative: "Period total",
  colorBySign: "Color by sign",
  chartNoData: "No P&L in this range",
  chartNoSeries: "Select a series to display",

  prevMonth: "Previous month",
  nextMonth: "Next month",
  today: "Today",
  weekdaySun: "Sun",
  weekdayMon: "Mon",
  weekdayTue: "Tue",
  weekdayWed: "Wed",
  weekdayThu: "Thu",
  weekdayFri: "Fri",
  weekdaySat: "Sat",

  yearListTitle: "Year list",
  yearListHelp: "Enter a month-end balance in Adjusted to use it as the next month’s starting equity.",
  monthTotal: "Month total",
  adjusted: "Adjusted",
  adjustedTitle: "Adjusted month-end balance (next month start)",

  language: "言語 / Language",
  languageJa: "日本語",
  languageEn: "English",

  carryoverTitle: "Carryover",
  carryoverHelp: "Balance before the first month. An Adjusted month-end value in Year list becomes the next month’s starting equity.",
  baseCarryover: "Opening carryover",

  categoriesHelp: "Set tag background and text colors. Renaming a tag keeps existing records on the same tag.",
  add: "Add",
  background: "Fill",
  textColor: "Text",
  resetCategories: "Reset tags to defaults",
  newCategory: "Tag {n}",

  pnlColors: "P&L colors",
  addRule: "Add rule",
  pnlColorsHelp: "Conditional formatting for number cells. The first matching rule from the top is applied.",
  label: "Label",
  min: "Min",
  max: "Max",
  preview: "Preview",
  resetColorRules: "Reset color rules",
  newRule: "New rule",

  chartColors: "Chart colors",
  chartColorsHelp: "Bar colors when Color by sign is on. Off stays {color}.",
  positive: "Plus",
  negative: "Minus",
  resetChartColors: "Reset chart colors",

  calendarSizeTitle: "Calendar number size",
  calendarSizeHelp: "Size of P&L numbers. Small is the default; Large matches the date.",
  sizeS: "S",
  sizeM: "M",
  sizeL: "L",

  backupTitle: "Backup",
  backupHelp: "Export or restore P&L and settings (tags, colors, carryover, chart colors) as JSON. Restore overwrites current data.",
  exportData: "Export",
  importData: "Import",
  backupMeta: "File: {file}  /  {records} records, {carryovers} adjusted months",
  importInvalid: "This JSON file is not valid.",
  importCancelled: "Restore cancelled.",
  importDone: "Data restored.",
  importFailed: "Could not read the file.",
  importConfirm: "Overwrite current data with “{name}”? {records} records / {categories} tags",

  dataTitle: "Data",
  dataHelp: "Reload sample resets P&L and settings. Clear inputs removes P&L and carryover only; tags and colors stay.",
  resetSample: "Reload sample data",
  clearInputs: "Clear all inputs",
  resetSampleConfirm: "Reload sample data? Current P&L and settings will be reset.",
  clearInputsConfirm: "Delete all P&L and carryover and start empty? Tags and colors will be kept.",
  cancel: "Cancel",
  ok: "OK",
};

export const dictionaries: Record<Locale, { [K in keyof typeof ja]: string }> = { ja, en };

export type MessageKey = keyof typeof ja;

export function t(locale: Locale, key: MessageKey, vars?: Record<string, string | number>): string {
  let text = dictionaries[locale][key];
  if (!vars) return text;
  for (const [name, value] of Object.entries(vars)) {
    text = text.replaceAll(`{${name}}`, String(value));
  }
  return text;
}

export function formatMonthLabel(locale: Locale, year: number, month: number): string {
  if (locale === "en") {
    return new Date(year, month - 1, 1).toLocaleString("en-US", { month: "short", year: "numeric" });
  }
  return `${year}年${month}月`;
}

export const WEEKDAY_KEYS = [
  "weekdaySun",
  "weekdayMon",
  "weekdayTue",
  "weekdayWed",
  "weekdayThu",
  "weekdayFri",
  "weekdaySat",
] as const satisfies readonly MessageKey[];
