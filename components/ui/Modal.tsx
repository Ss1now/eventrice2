"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  children
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <button
        aria-label="Close modal backdrop"
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      <div className={cn("relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-5 shadow-soft")}>
        <div className="flex items-start justify-between gap-3">
          <div className="text-base font-semibold">{title ?? "Dialog"}</div>
          <button className="rounded-xl p-2 hover:bg-zinc-100" onClick={onClose} aria-label="Close modal">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
