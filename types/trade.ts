export type ViewMode = "list" | "chart" | "calendar" | "year" | "settings";

export type DailyPnl = {
  date: string;
  profitLoss: number;
  memo: string;
  categories: string[];
};

export type CategoryOption = {
  id: string;
  name: string;
  background: string;
  color: string;
};

export type ChartSignColors = {
  positive: string;
  negative: string;
};

export type CalendarPnlSize = "s" | "m" | "l";

export type Locale = "ja" | "en";

export type MonthRow = {
  day: number;
  date: string;
  profitLoss: number | null;
  monthlyCumulative: number;
  cumulative: number;
  memo: string;
  categories: string[];
};

export type MonthBlock = {
  year: number;
  month: number;
  rows: MonthRow[];
  total: number;
  carryover: number;
  equity: number;
};

export type CalendarCell = {
  date: string;
  day: number;
  inCurrentMonth: boolean;
  profitLoss: number | null;
  memo: string;
  categories: string[];
};

export type ColorRule = {
  id: string;
  label: string;
  min: number | null;
  max: number | null;
  background: string;
  color: string;
};

export type YearColumn = {
  year: number;
  month: number;
  key: string;
  label: string;
  days: number;
  values: (number | null)[];
  total: number;
  carryover: number;
  equity: number;
};
