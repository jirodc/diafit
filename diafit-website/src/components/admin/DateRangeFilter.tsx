"use client";

import type { DateRange } from "@/lib/adminData";

const OPTIONS: { value: DateRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "all", label: "All" },
];

export function DateRangeFilter({
  value,
  onChange,
  className = "",
}: {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-slate-600">Period:</span>
      <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              value === opt.value
                ? "bg-[var(--diafit-blue)] text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
