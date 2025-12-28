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
import { fetchMyProfile, upsertMyProfile } from "@/lib/profiles";


export default function ProfilePage() {
  const router = useRouter();
  const { user: sbUser, loading } = useAuth();

  const [saving, setSaving] = React.useState(false);
  const [loadingProfile, setLoadingProfile] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Supabase-backed fields
  const [name, setName] = React.useState("");
  const [instagram, setInstagram] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [college, setCollege] = React.useState("Rice University");
  const [verified, setVerified] = React.useState(false);

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
  const { user, setUser, events, hosts } = useStore();

  const hosted = events.filter((e) => e.hostId === user.id);
  const attended = events.filter((e) => e.ratings.some((r) => r.userId === user.id));
  const { past, ongoing, future } = splitEventsByTime(hosted);

  // Step 9: load profile from Supabase
  React.useEffect(() => {
    if (!sbUser) return;
    (async () => {
      try {
        setLoadingProfile(true);
        setErrorMsg(null);

        const p = await fetchMyProfile(sbUser.id);

        setName(p?.full_name ?? (sbUser.email?.split("@")[0] ?? ""));
        setInstagram(p?.instagram ?? "");
        setPhone(p?.phone ?? "");
        setCollege(p?.college ?? "Rice University");
        setVerified(p?.verified ?? false);

        // Keep store in sync (optional, helps other pages still using demo store)
        setUser((prev) => ({
          ...prev,
          name: p?.full_name ?? prev.name,
          instagram: p?.instagram ?? prev.instagram,
          phone: p?.phone ?? prev.phone,
          verified: p?.verified ?? prev.verified,
          college: (p?.college ?? prev.college) as any,
        }));
      } catch (e: any) {
        setErrorMsg(e?.message ?? "Failed to load profile");
      } finally {
        setLoadingProfile(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sbUser]);

  async function save() {
    try {
      setSaving(true);
      setErrorMsg(null);

      if (!sbUser) throw new Error("no auth user");

      const saved = await upsertMyProfile({
        userId: sbUser.id,
        full_name: name.trim() || null,
        instagram: instagram.trim() || null,
        phone: phone.trim() || null,
        college: college || "Rice University",
        verified,
      });

      // Keep store in sync (optional)
      setUser((prev) => ({
        ...prev,
        name: saved.full_name ?? prev.name,
        instagram: saved.instagram ?? prev.instagram,
        phone: saved.phone ?? prev.phone,
        verified: saved.verified ?? prev.verified,
        college: (saved.college ?? prev.college) as any,
      }));
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loadingProfile) return null;

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
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {errorMsg ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      ) : null}

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
                {college}
              </div>
            </div>
            <div className="grid gap-2">
              <div className="text-xs text-zinc-500">Instagram</div>
              <Input
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@yourhandle"
              />
            </div>
            <div className="grid gap-2">
              <div className="text-xs text-zinc-500">Phone</div>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(optional)" />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {verified ? (
              <Badge className="bg-emerald-50 text-emerald-700">Rice Verified</Badge>
            ) : (
              <Badge className="bg-amber-50 text-amber-700">Not verified</Badge>
            )}
            <div className="text-sm text-zinc-600">Verified users can reserve Rice-only events.</div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button variant={verified ? "outline" : "primary"} onClick={() => setVerified(true)}>
              Verify with Rice email (demo)
            </Button>
            <Button variant="outline" onClick={() => setVerified(false)}>
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
