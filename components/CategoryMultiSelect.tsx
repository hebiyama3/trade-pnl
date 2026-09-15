"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { CategoryTags } from "@/components/CategoryTag";
import { t } from "@/lib/i18n";
import type { CategoryOption, Locale } from "@/types/trade";

type Props = {
  locale: Locale;
  options: CategoryOption[];
  value: string[];
  onChange: (value: string[]) => void;
};

export function CategoryMultiSelect({ locale, options, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    return () => window.removeEventListener("mousedown", onPointer);
  }, []);

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);
  };

  return (
    <div ref={rootRef} className="relative min-w-[180px]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-[42px] w-full items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-sm outline-none ring-sky-200 focus:ring"
      >
        {value.length ? <CategoryTags names={value} categories={options} /> : <span className="text-slate-400">{t(locale, "selectCategory")}</span>}
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>
      {open ? (
        <div className="absolute z-30 mt-1 w-full rounded-md border border-slate-200 bg-white p-2 shadow-lg">
          {options.map((item) => (
            <label key={item.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-slate-50">
              <input type="checkbox" checked={value.includes(item.id)} onChange={() => toggle(item.id)} />
              <span className="rounded px-1.5 py-0.5 text-xs" style={{ backgroundColor: item.background, color: item.color }}>
                {item.name}
              </span>
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}
