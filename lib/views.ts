import type { ViewMode } from "@/types/trade";

export const VIEW_PATHS: Record<ViewMode, string> = {
  calendar: "/",
  list: "/list",
  chart: "/chart",
  year: "/year",
  settings: "/settings",
};

export function viewFromPath(pathname: string): ViewMode {
  if (pathname === "/list") return "list";
  if (pathname === "/chart") return "chart";
  if (pathname === "/year") return "year";
  if (pathname === "/settings") return "settings";
  return "calendar";
}
