"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Segment<T extends string>({
  value,
  onChange,
  options
}: {
  value: T;
  onChange: (v: T) => void;
  options: { label: string; value: T }[];
}) {
  return (
    <div className="inline-flex rounded-2xl border border-zinc-200 bg-zinc-50 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          className={cn(
            "h-9 rounded-xl px-3 text-sm transition",
            value === o.value ? "bg-white text-zinc-900 shadow-soft" : "text-zinc-600 hover:text-zinc-900"
          )}
          onClick={() => onChange(o.value)}
          type="button"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
