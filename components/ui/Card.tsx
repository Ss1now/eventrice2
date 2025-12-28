import { cn } from "@/lib/utils";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-zinc-200 bg-white p-5 shadow-soft", className)}>{children}</div>;
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-base font-semibold text-zinc-900">{children}</div>;
}

export function CardDesc({ children }: { children: React.ReactNode }) {
  return <div className="mt-1 text-sm text-zinc-600">{children}</div>;
}
