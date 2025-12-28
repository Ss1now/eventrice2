"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Segment } from "@/components/ui/Segment";
import { CreateEventModal } from "@/components/events/CreateEventModal";
import { EventCard } from "@/components/events/EventCard";
import { splitEventsByTime } from "@/lib/demoData";
import { useStore } from "@/lib/store";
import { useEffect } from "react";
import { fetchEvents } from "@/lib/events";
import { supabase } from "@/lib/supabaseClient";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";

type Tab = "future" | "ongoing" | "past";

export default function EventsPage() {
  const { events, hosts, setEvents } = useStore();
  useEffect(() => {
    (async () => {
      try {
        const list = await fetchEvents();
        setEvents(list);
      } catch (e) {
        console.error("Failed to fetch events", e);
      }
    })();
  }, [setEvents]);

  // Real-time updates: refresh events list when the events table changes
  React.useEffect(() => {
    const channel = supabase
      .channel("events-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        async () => {
          try {
            const list = await fetchEvents();
            setEvents(list);
          } catch (e) {
            console.error("Failed to refresh events from realtime", e);
          }
        }
      )
      .subscribe();

    return () => {
      // removeChannel is synchronous in supabase-js v2
      supabase.removeChannel(channel);
    };
  }, [setEvents]);
  const [tab, setTab] = React.useState<Tab>("future");
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");

  const { past, ongoing, future } = splitEventsByTime(events);
  const list = tab === "future" ? future : tab === "ongoing" ? ongoing : past;

  const filtered = list.filter((e) => {
    const host = hosts.find((h) => h.id === e.hostId);
    const hay = `${e.title} ${e.description ?? ""} ${e.location} ${e.theme ?? ""} ${host?.name ?? ""} ${host?.college ?? ""}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="text-2xl font-semibold tracking-tight">Event / Party Hub</div>
          <div className="mt-1 text-sm text-zinc-600">
            Post future parties. When the time comes → it becomes <span className="font-medium">LIVE</span>. After it ends → it lands in <span className="font-medium">Past</span> for ratings.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Segment<Tab>
            value={tab}
            onChange={setTab}
            options={[
              { label: "Future", value: "future" },
              { label: "Ongoing", value: "ongoing" },
              { label: "Past", value: "past" }
            ]}
          />
          <Button onClick={() => setOpen(true)}>Post a party</Button>
        </div>
      </div>

      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <Search className="h-4 w-4" />
          <span>Search</span>
        </div>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try “Jones”, “silent disco”, “rooftop”…" className="sm:max-w-md" />
      </Card>

      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <Card>
            <div className="text-sm text-zinc-600">No events found. Try a different search.</div>
          </Card>
        ) : (
          filtered.map((e) => {
            const host = hosts.find((h) => h.id === e.hostId)!;
            return <EventCard key={e.id} event={e} host={host} variant={tab} />;
          })
        )}
      </div>

      <CreateEventModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
