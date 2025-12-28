"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { PartyEvent, ReservationMode, ServiceNeed } from "@/lib/types";
import { useStore } from "@/lib/store";
import { createEvent, fetchEvents } from "@/lib/events";
import { useAuth } from "@/lib/useAuth";

const services: ServiceNeed[] = ["DJ","Photographer","Bartender","Door/Check-in","Cleanup","Security","Caregiver/Designated Driver"];

export function CreateEventModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user: storeUser, setEvents } = useStore();
  const { user: sbUser } = useAuth();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [startAt, setStartAt] = React.useState("");
  const [endAt, setEndAt] = React.useState("");
  const [dressCode, setDressCode] = React.useState("");
  const [theme, setTheme] = React.useState("");
  const [mode, setMode] = React.useState<ReservationMode>("Open");
  const [capacity, setCapacity] = React.useState<number | "">("");
  const [whatToBring, setWhatToBring] = React.useState("ID, water, jacket");
  const [servicesHiring, setServicesHiring] = React.useState<ServiceNeed[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function toggleService(s: ServiceNeed) {
    setServicesHiring((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  function reset() {
    setTitle("");
    setDescription("");
    setLocation("");
    setStartAt("");
    setEndAt("");
    setDressCode("");
    setTheme("");
    setMode("Open");
    setCapacity("");
    setWhatToBring("ID, water, jacket");
    setServicesHiring([]);
    setError(null);
  }

  async function submit() {
    if (!title || !location || !startAt || !endAt) return;
    if (!sbUser?.id) {
      setError("You must be logged in to post an event");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createEvent(
        {
          title,
          description: description || undefined,
          locationName: location,
          address: undefined,
          startAt: new Date(startAt).toISOString(),
          endAt: new Date(endAt).toISOString(),
          dressCode: dressCode || undefined,
          theme: theme || undefined,
          capacity: mode === "Reservation Required" ? (capacity === "" ? undefined : Number(capacity)) : undefined,
          isPublic: mode === "Open",
          is18plus: false
        },
        sbUser.id,
        sbUser.email ?? "Unknown"
      );

      // Refresh events list
      const updated = await fetchEvents();
      setEvents(updated);

      reset();
      onClose();
    } catch (err: any) {
      console.error("Failed to create event:", err);
      setError(err?.message ?? "Failed to create event");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Post a future party">
      <div className="grid gap-3">
        <div className="grid gap-2">
          <div className="text-xs text-zinc-500">Title</div>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Silent Disco at Martel" />
        </div>

        <div className="grid gap-2">
          <div className="text-xs text-zinc-500">Description</div>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What’s the vibe? Any rules?" />
        </div>

        <div className="grid gap-2">
          <div className="text-xs text-zinc-500">Location</div>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Where is it?" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <div className="text-xs text-zinc-500">Start</div>
            <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <div className="text-xs text-zinc-500">End</div>
            <Input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <div className="text-xs text-zinc-500">Dress code</div>
            <Input value={dressCode} onChange={(e) => setDressCode(e.target.value)} placeholder="Optional" />
          </div>
          <div className="grid gap-2">
            <div className="text-xs text-zinc-500">Theme</div>
            <Input value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="Optional" />
          </div>
        </div>

        <div className="grid gap-2">
          <div className="text-xs text-zinc-500">What to bring (comma-separated)</div>
          <Input value={whatToBring} onChange={(e) => setWhatToBring(e.target.value)} />
        </div>

        <div className="grid gap-2">
          <div className="text-xs text-zinc-500">Hiring (tap to toggle)</div>
          <div className="flex flex-wrap gap-2">
            {services.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleService(s)}
                className="rounded-full"
                aria-label={`Toggle ${s}`}
              >
                <Badge className={servicesHiring.includes(s) ? "bg-zinc-900 text-white" : undefined}>{s}</Badge>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <div className="text-xs text-zinc-500">Reservation</div>
            <div className="flex gap-2">
              <Button variant={mode === "Open" ? "primary" : "outline"} onClick={() => setMode("Open")} type="button">
                Open
              </Button>
              <Button
                variant={mode === "Reservation Required" ? "primary" : "outline"}
                onClick={() => setMode("Reservation Required")}
                type="button"
              >
                Required
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <div className="text-xs text-zinc-500">Capacity</div>
            <Input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder={mode === "Reservation Required" ? "Optional limit" : "N/A"}
              disabled={mode !== "Reservation Required"}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} type="button" disabled={loading}>
            Cancel
          </Button>
          <Button onClick={submit} type="button" disabled={!title || !location || !startAt || !endAt || loading}>
            {loading ? "Posting..." : "Post"}
          </Button>
        </div>

        {error && <div className="text-xs text-red-600">{error}</div>}

        <div className="text-xs text-zinc-500">
          Rule: you can only post future events (enforced by backend later). In demo mode we trust you 🙂
        </div>
      </div>
    </Modal>
  );
}
