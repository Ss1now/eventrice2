"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Stars } from "@/components/ui/Stars";

import { useStore } from "@/lib/store";
import { splitEventsByTime } from "@/lib/demoData";
import { useAuth } from "@/lib/useAuth";

export default function ProfilePage() {
  const router = useRouter();
  const { user: sbUser, loading } = useAuth();

  // ✅ Step 8: protect route
  React.useEffect(() => {
    if (!loading && !sbUser) {
      router.push("/login" as any);
    }
  }, [loading, sbUser, router]);

  // While checking session, render nothing (or a spinner)
  if (loading) return null;
  if (!sbUser) return null;

  // --- Your existing store-based UI (kept for now) ---
  const { user, setUser, events, hosts, verifyUser } = useStore();

  // Safety: if your store "user" exists but isn't tied to Supabase yet,
  // we still let the page render (Step 9 will connect them).
  const hosted = events.filter((e) => e.hostId === user.id);
  const attended = events.filter((e) => e.ratings.some((r) => r.userId === user.id));
  const { past, ongoing, future } = splitEventsByTime(hosted);

  const [name, setName] = React.useState(user.name);
  const [instagram, setInstagram] = React.useState(user.instagram ?? "");
  const [phone, setPhone] = React.useState(user.phone ?? "");

  function save() {
    setUser({ ...user, name, instagram: instagram || undefined, phone: phone || undefined });
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="text-2xl font-semibold tracking-tight">Profile</div>
          <div className="mt-1 text-sm text-zinc-600">Make it clean. Make it you.</div>
          <div className="mt-2 text-xs text-zinc-500">
            Signed in as: <span className="font-medium">{sbUser.email}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={"/login" as any}>
            <Button variant="outline">Account</Button>
          </Link>
          <Button onClick={save}>Save</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="sm:col-span-2">
          <div className="text-base font-semibold">Basics</div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <div className="text-xs text-zinc-500">Name</div>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <div className="text-xs text-zinc-500">College</div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
                {user.college}
              </div>
            </div>
            <div className="grid gap-2">
              <div className="text-xs text-zinc-500">Instagram</div>
              <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@yourhandle" />
            </div>
            <div className="grid gap-2">
              <div className="text-xs text-zinc-500">Phone</div>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(optional)" />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {user.verified ? (
              <Badge className="bg-emerald-50 text-emerald-700">Rice Verified</Badge>
            ) : (
              <Badge className="bg-amber-50 text-amber-700">Not verified</Badge>
            )}
            <div className="text-sm text-zinc-600">Verified users can reserve Rice-only events.</div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button variant={user.verified ? "outline" : "primary"} onClick={() => verifyUser(true)}>
              Verify with Rice email (demo)
            </Button>
            <Button variant="outline" onClick={() => verifyUser(false)}>
              Remove verification
            </Button>
          </div>
        </Card>

        <Card>
          <div className="text-base font-semibold">Your stats</div>
          <div className="mt-4 grid gap-3 text-sm text-zinc-700">
            <div className="flex items-center justify-between">
              <span>Host score</span>
              <span className="font-semibold">
                {Math.round(hosts.find((h) => h.id === user.id)?.hostScore ?? user.hostScore)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Hosted</span>
              <span className="font-semibold">{hosted.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Attended</span>
              <span className="font-semibold">{attended.length}</span>
            </div>
            <div className="pt-2 text-xs text-zinc-500">
              Hosting: Future {future.length} · Live {ongoing.length} · Past {past.length}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <div className="text-base font-semibold">Events you hosted</div>
          <div className="mt-4 grid gap-2">
            {hosted.length === 0 ? (
              <div className="text-sm text-zinc-600">No hosted events yet. Post one in Events.</div>
            ) : (
              hosted.slice(0, 6).map((e) => (
                <div key={e.id} className="rounded-2xl border border-zinc-200 p-4">
                  <div className="text-sm font-semibold">{e.title}</div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {new Date(e.startAt).toLocaleString()} · {e.location}
                  </div>
                  <div className="mt-2 text-xs text-zinc-500">{e.ratings.length} rating(s)</div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="text-base font-semibold">Events you rated</div>
          <div className="mt-4 grid gap-2">
            {attended.length === 0 ? (
              <div className="text-sm text-zinc-600">Rate past events to show up here.</div>
            ) : (
              attended.slice(0, 6).map((e) => {
                const your = e.ratings.find((r) => r.userId === user.id);
                return (
                  <div key={e.id} className="rounded-2xl border border-zinc-200 p-4">
                    <div className="text-sm font-semibold">{e.title}</div>
                    <div className="mt-1 text-xs text-zinc-500">
                      {new Date(e.startAt).toLocaleString()} · {e.location}
                    </div>
                    {your ? (
                      <div className="mt-2 flex items-center justify-between">
                        <Stars value={your.stars} />
                        <div className="text-xs text-zinc-500">
                          vibe {your.vibe} · safety {your.safety}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
