"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardDesc, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Stars } from "@/components/ui/Stars";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { computeEventScore, splitEventsByTime } from "@/lib/demoData";
import { formatDateTime } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { MapPin, Clock, Users, ShieldCheck, ArrowLeft, Heart } from "lucide-react";
import { fetchEventById, toggleLike, fetchLikeCount, fetchUserLiked } from "@/lib/events";
import type { PartyEvent } from "@/lib/types";
import { useAuth } from "@/lib/useAuth";
import { runAuthedAction } from "@/lib/actionGuards";

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { hosts, user, reserveEvent, addRating } = useStore();
  const { user: sbUser } = useAuth();

  const [event, setEvent] = React.useState<PartyEvent | null>(null);
  const [loading, setLoading] = React.useState(true);

  const [stars, setStars] = React.useState(5);
  const [vibe, setVibe] = React.useState(5);
  const [safety, setSafety] = React.useState(5);
  const [comment, setComment] = React.useState("");

  const [liked, setLiked] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(0);
  const [liking, setLiking] = React.useState(false);
  const [likeErr, setLikeErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!params?.id) return;
    (async () => {
      setLoading(true);
      try {
        const e = await fetchEventById(params.id);
        setEvent(e);
        const c = await fetchLikeCount(params.id);
        setLikeCount(c);
        if (sbUser) {
          const l = await fetchUserLiked(params.id, sbUser.id);
          setLiked(l);
        }
      } catch (err) {
        console.error(err);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [params?.id, sbUser]);

  if (loading) return null;
  if (!event) {
    return (
      <Card>
        <div className="text-sm text-zinc-600">Event not found.</div>
        <div className="mt-3">
          <Link href="/events">
            <Button variant="outline">Back</Button>
          </Link>
        </div>
      </Card>
    );
  }

  const host = hosts.find((h) => h.id === event.hostId)!;
  const start = new Date(event.startAt);
  const end = new Date(event.endAt);

  const { past, ongoing, future } = splitEventsByTime([event]);
  const status = future.length ? "future" : ongoing.length ? "ongoing" : "past";

  const n = event.ratings.length;
  const avg = (arr: number[]) => arr.reduce((a,b)=>a+b,0) / Math.max(1, arr.length);
  const avgStars = n ? avg(event.ratings.map(r=>r.stars)) : 0;
  const avgVibe = n ? avg(event.ratings.map(r=>r.vibe)) : 0;
  const avgSafety = n ? avg(event.ratings.map(r=>r.safety)) : 0;
  const eventScore = n ? computeEventScore(avgStars, avgVibe, avgSafety, n) : 70;

  const canReserve = event.reservationMode === "Reservation Required" && user.verified;

  function submitRating() {
    const rating = {
      userId: user.id,
      stars: stars as 1|2|3|4|5,
      vibe: vibe as 1|2|3|4|5,
      safety: safety as 1|2|3|4|5,
      comment: comment.trim() || undefined,
      createdAt: new Date().toISOString()
    };
    if (event) {
      addRating(event.id, rating);
    }
    setComment("");
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-2">
        <Link href="/events" className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="flex items-center gap-2">
          <Badge className="bg-zinc-900 text-white">{status === "ongoing" ? "LIVE" : status.toUpperCase()}</Badge>
          <Badge>{host.college}</Badge>
          {event.theme && <Badge>Theme: {event.theme}</Badge>}
          {sbUser ? (
            <Button
              onClick={async () => {
                await runAuthedAction(
                  { user: sbUser, redirectToLogin: () => router.push("/login" as any), setLoading: setLiking, setError: setLikeErr },
                  async (u) => {
                    const out = await toggleLike(event.id, u.id);
                    const c = await fetchLikeCount(event.id);
                    setLikeCount(c);
                    setLiked(out.liked);
                    return out;
                  }
                );
              }}
              disabled={liking}
              variant={liked ? "primary" : "outline"}
            >
              <Heart className="h-4 w-4" />
              <span className="ml-2 text-xs">{liked ? `Liked (${likeCount})` : `Like (${likeCount})`}</span>
            </Button>
          ) : null}
        </div>
      </div>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle>{event.title}</CardTitle>
            <CardDesc>{event.description ?? "—"}</CardDesc>

            <div className="mt-4 grid gap-2 text-sm text-zinc-700 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-zinc-400" />
                <span className="truncate">{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-zinc-400" />
                <span className="truncate">
                  {formatDateTime(start)} → {formatDateTime(end)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-zinc-400" />
                <span>
                  {event.reservationMode === "Open"
                    ? "Open — walk in"
                    : `${event.reservedCount}${event.capacity ? `/${event.capacity}` : ""} reserved`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-zinc-400" />
                <span>Event score: {Math.round(eventScore)}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {event.dressCode && <Badge>Dress: {event.dressCode}</Badge>}
              {event.servicesHiring?.length ? <Badge>Hiring: {event.servicesHiring.join(", ")}</Badge> : <Badge>Hiring: none</Badge>}
              {event.whatToBring?.length ? <Badge>Bring: {event.whatToBring.join(", ")}</Badge> : <Badge>Bring: nothing</Badge>}
              <Badge>{event.reservationMode}</Badge>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:w-[260px]">
            <div className="text-xs text-zinc-500">Host</div>
            <div className="text-sm font-semibold">{host.name}</div>
            <div className="text-sm text-zinc-600">{host.college}</div>
            <div className="text-xs text-zinc-500">Host score</div>
            <div className="text-2xl font-semibold">{Math.round(host.hostScore)}</div>

            <div className="mt-2 flex flex-wrap gap-2">
              {host.instagram && <Badge>{host.instagram}</Badge>}
              {host.verified ? <Badge className="bg-emerald-50 text-emerald-700">Verified</Badge> : <Badge className="bg-amber-50 text-amber-700">Unverified</Badge>}
            </div>

            {status === "future" && event.reservationMode === "Reservation Required" && (
              <Button onClick={() => reserveEvent(event.id)} disabled={!canReserve}>
                Reserve
              </Button>
            )}
            {!user.verified && event.reservationMode === "Reservation Required" && (
              <div className="text-xs text-zinc-500">Verify with Rice email to reserve Rice-only events.</div>
            )}
          </div>
        </div>
      </Card>

      {status === "past" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <div className="text-base font-semibold">Rate this event</div>
            <div className="mt-3 grid gap-3">
              <div className="grid gap-1">
                <div className="text-xs text-zinc-500">Overall</div>
                <Stars value={stars} onChange={setStars} />
              </div>
              <div className="grid gap-1">
                <div className="text-xs text-zinc-500">Vibe</div>
                <Stars value={vibe} onChange={setVibe} />
              </div>
              <div className="grid gap-1">
                <div className="text-xs text-zinc-500">Safety</div>
                <Stars value={safety} onChange={setSafety} />
              </div>
              <div className="grid gap-1">
                <div className="text-xs text-zinc-500">Comment</div>
                <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Optional (keep it kind)" />
              </div>
              <Button onClick={submitRating}>Submit rating</Button>

              <div className="text-xs text-zinc-500">
                Rating model: EventScore = 50% Overall + 30% Vibe + 20% Safety, boosted by rating count confidence.
              </div>
            </div>
          </Card>

          <Card>
            <div className="text-base font-semibold">Community ratings</div>
            <div className="mt-2 text-sm text-zinc-600">
              {n ? (
                <>
                  Avg <span className="font-semibold">{avgStars.toFixed(1)}</span> · Vibe{" "}
                  <span className="font-semibold">{avgVibe.toFixed(1)}</span> · Safety{" "}
                  <span className="font-semibold">{avgSafety.toFixed(1)}</span> · {n} rating{n === 1 ? "" : "s"}
                </>
              ) : (
                "No ratings yet."
              )}
            </div>

            <div className="mt-4 grid gap-3">
              {event.ratings.slice(0, 8).map((r, idx) => (
                <div key={idx} className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <Stars value={r.stars} />
                    <div className="text-xs text-zinc-500">{new Date(r.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="mt-2 text-xs text-zinc-500">Vibe {r.vibe} · Safety {r.safety}</div>
                  {r.comment ? <div className="mt-2 text-sm text-zinc-700">{r.comment}</div> : null}
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        <Card>
          <div className="text-sm text-zinc-600">
            Ratings unlock after the party ends — so hosts can’t farm reviews early.
          </div>
        </Card>
      )}
    </div>
  );
}
