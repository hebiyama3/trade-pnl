"use client";

import { categoryStyle } from "@/lib/colors";
import type { CategoryOption } from "@/types/trade";

export function CategoryTag({ name, categories }: { name: string; categories: CategoryOption[] }) {
  if (!name) return null;
  return (
    <span className="inline-block rounded px-1.5 py-0.5 text-xs" style={categoryStyle(name, categories)}>
      {name}
    </span>
  );
}

export function CategoryTags({
  names,
  categories,
  className = "",
}: {
  names: string[];
  categories: CategoryOption[];
  className?: string;
}) {
  if (!names.length) return null;
  return (
    <span className={`inline-flex flex-wrap items-center gap-1 ${className}`}>
      {names.map((name) => (
        <CategoryTag key={name} name={name} categories={categories} />
      ))}
    </span>
  );
}
