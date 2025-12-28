"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CalendarDays, MessageCircle, Trophy, User, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useStore } from "@/lib/store";

const nav: Array<{ href: string; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/connections", label: "Connections", icon: MessageCircle },
  { href: "/rankings", label: "Rankings", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useStore();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/events" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-zinc-900 text-white shadow-soft">
              <Sparkles className="h-4 w-4 wiggle" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Rice Party</div>
              <div className="text-xs text-zinc-500">minimal + playful</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {nav.map((n) => {
              const active = pathname.startsWith(n.href);
              const Icon = n.icon;
              return (
                <Link
                  key={n.href}
                  href={n.href as any}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                    active ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {user.verified ? (
              <Badge className="bg-emerald-50 text-emerald-700">Rice Verified</Badge>
            ) : (
              <Badge className="bg-amber-50 text-amber-700">Unverified</Badge>
            )}
            <div className="hidden text-sm text-zinc-600 sm:block">{user.name}</div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>

      <footer className="border-t border-zinc-200">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-zinc-500">
          Demo UI. Hook this up to Supabase tables/auth to go live.
        </div>
      </footer>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/90 backdrop-blur sm:hidden">
        <div className="mx-auto grid max-w-6xl grid-cols-4 gap-1 px-2 py-2">
          {nav.map((n) => {
            const active = pathname.startsWith(n.href);
            const Icon = n.icon;
            return (
              <Link
                key={n.href}
                href={n.href as any}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-2xl py-2 text-xs transition",
                  active ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                )}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="h-16 sm:hidden" />
    </div>
  );
}
