"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDesc, CardTitle } from "@/components/ui/Card";
import { deriveReservedLabel } from "@/lib/demoData";
import type { Host, PartyEvent } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { MapPin, Clock, Users, ShieldCheck, Heart } from "lucide-react";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/useAuth";
import { runAuthedAction } from "@/lib/actionGuards";
import { toggleLike, fetchLikeCount, fetchUserLiked } from "@/lib/likes";
import { supabase } from "@/lib/supabaseClient";

export function EventCard({ event, host, variant }: { event: PartyEvent; host: Host; variant: "past" | "ongoing" | "future" }) {
  const { reserveEvent, user } = useStore();
  const { user: sbUser } = useAuth();
  const router = useRouter();
  const [liked, setLiked] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(0);
  const [liking, setLiking] = React.useState(false);
  const [likeErr, setLikeErr] = React.useState<string | null>(null);
  const start = new Date(event.startAt);
  const end = new Date(event.endAt);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const c = await fetchLikeCount(event.id);
        if (mounted) setLikeCount(c);
        if (sbUser) {
          const l = await fetchUserLiked(event.id, sbUser.id);
          if (mounted) setLiked(l);
        }
      } catch (err) {
        console.error("Failed to load likes", err);
      }
    })();

    const channel = supabase
      .channel(`likes-event-${event.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "event_likes", filter: `event_id=eq.${event.id}` },
        async () => {
          try {
            const c = await fetchLikeCount(event.id);
            setLikeCount(c);
            if (sbUser) {
              const l = await fetchUserLiked(event.id, sbUser.id);
              setLiked(l);
            }
          } catch (err) {
            console.error("Failed to refresh likes", err);
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [event.id, sbUser]);

  const reservedLabel = deriveReservedLabel(event.reservationMode, event.reservedCount, event.capacity);

  // Demo rule: reservation-required events are treated as "Rice-only"
  const riceOnly = event.reservationMode === "Reservation Required";
  const canReserve = event.reservationMode === "Reservation Required" && (user.verified || !riceOnly);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle>
            <Link href={`/events/${event.id}`} className="hover:underline">
              {event.title}
            </Link>
          </CardTitle>
          <CardDesc>{event.description ?? "—"}</CardDesc>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge className="bg-zinc-900 text-white">{variant === "ongoing" ? "LIVE" : variant.toUpperCase()}</Badge>
            <Badge>{host.college}</Badge>
            {host.verified && <Badge className="bg-emerald-50 text-emerald-700">Verified host</Badge>}
            {event.theme && <Badge>Theme: {event.theme}</Badge>}
            {event.dressCode && <Badge>Dress: {event.dressCode}</Badge>}
          </div>
        </div>

        <Link href={`/events/${event.id}`} className="shrink-0">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-zinc-50 text-zinc-900">
            <span className="text-xs font-semibold">{start.toLocaleString(undefined, { month: "short" })}</span>
            <span className="text-lg font-bold leading-none">{start.getDate()}</span>
          </div>
        </Link>
      </div>

      <div className="grid gap-2 text-sm text-zinc-700 sm:grid-cols-2">
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
          <span>{reservedLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-zinc-400" />
          <span>Host score: {Math.round(host.hostScore)}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-zinc-500">
          Hosted by <span className="text-zinc-700">{host.name}</span>
          {host.instagram ? <span> · {host.instagram}</span> : null}
        </div>
        <div className="flex items-center gap-2">
          {variant === "future" && event.reservationMode === "Reservation Required" && (
            <Button
              onClick={() => reserveEvent(event.id)}
              disabled={!canReserve || (event.capacity ? event.reservedCount >= event.capacity : false)}
              title={!canReserve ? "Verify with Rice email to reserve Rice-only events (demo rule)" : undefined}
            >
              Reserve
            </Button>
          )}
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

          <Link href={`/events/${event.id}`}>
            <Button variant="outline">View</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
