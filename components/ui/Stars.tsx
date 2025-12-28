"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({
  value,
  onChange,
  size = 18
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
}) {
  const [hover, setHover] = React.useState<number | null>(null);
  const v = hover ?? value;

  return (
    <div className="inline-flex items-center gap-1">
      {[1,2,3,4,5].map((i) => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
          onClick={() => onChange?.(i)}
          className={cn("rounded-md p-0.5", onChange ? "cursor-pointer" : "cursor-default")}
          aria-label={`${i} star`}
        >
          <Star
            width={size}
            height={size}
            className={cn(
              i <= v ? "fill-zinc-900 text-zinc-900" : "fill-transparent text-zinc-300",
              "transition"
            )}
          />
        </button>
      ))}
    </div>
  );
}
