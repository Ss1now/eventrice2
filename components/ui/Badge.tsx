import { cn } from "@/lib/utils";

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700", className)}>
      {children}
    </span>
  );
}
