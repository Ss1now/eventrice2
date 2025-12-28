"use client";

import { supabase } from "@/lib/supabaseClient";
import type { PartyEvent, EventRating } from "@/lib/types";

type EventInput = {
  title: string;
  description?: string;
  locationName?: string;
  address?: string;
  startAt: string;
  endAt: string;
  theme?: string;
  dressCode?: string;
  capacity?: number | null;
  isPublic?: boolean;
  is18plus?: boolean;
};

function mapRow(row: any): PartyEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    location: row.location_name ?? row.address ?? "",
    startAt: row.start_at,
    endAt: row.end_at,
    dressCode: row.dress_code ?? "",
    theme: row.theme ?? "",
    whatToBring: row.what_to_bring ?? [],
    servicesHiring: row.services_hiring ?? [],
    reservationMode: row.is_public ? "Open" : "Reservation Required",
    capacity: row.capacity ?? undefined,
    reservedCount: row.reserved_count ?? 0,
    hostId: row.host_user_id,
    createdAt: row.created_at,
    ratings: (row.ratings as EventRating[]) ?? []
  } as PartyEvent;
}

export async function fetchEvents(): Promise<PartyEvent[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("start_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function fetchEventById(id: string): Promise<PartyEvent | null> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data ? mapRow(data) : null;
}

export async function createEvent(input: EventInput, hostUserId: string, hostName: string): Promise<PartyEvent> {
  const { data, error } = await supabase
    .from("events")
    .insert({
      title: input.title,
      description: input.description ?? "",
      location_name: input.locationName,
      address: input.address ?? "",
      start_at: input.startAt,
      end_at: input.endAt,
      theme: input.theme ?? "",
      dress_code: input.dressCode ?? "",
      capacity: input.capacity ?? null,
      is_public: input.isPublic,
      is_18plus: input.is18plus,
      host_user_id: hostUserId,
      host_name: hostName
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapRow(data);
}

export async function updateEvent(id: string, input: EventInput): Promise<PartyEvent> {
  const { data, error } = await supabase
    .from("events")
    .update({
      title: input.title,
      description: input.description ?? "",
      location_name: input.locationName,
      address: input.address ?? "",
      start_at: input.startAt,
      end_at: input.endAt,
      theme: input.theme ?? "",
      dress_code: input.dressCode ?? "",
      capacity: input.capacity ?? null,
      is_public: input.isPublic,
      is_18plus: input.is18plus,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapRow(data);
}

export async function deleteEvent(id: string) {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
}

export async function toggleLike(eventId: string, userId?: string) {
  if (!userId) throw new Error("Not authenticated");

  // check if liked
  const { data: existing, error: e1 } = await supabase
    .from("event_likes")
    .select("*")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .maybeSingle();

  if (e1) throw e1;

  if (existing) {
    const { error } = await supabase
      .from("event_likes")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", userId);
    if (error) throw error;
    return { liked: false };
  } else {
    const { error } = await supabase
      .from("event_likes")
      .insert({ event_id: eventId, user_id: userId });
    if (error) throw error;
    return { liked: true };
  }
}

export async function fetchLikeCount(eventId: string): Promise<number> {
  const { count, error } = await supabase
    .from("event_likes")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId);

  if (error) throw error;
  return count ?? 0;
}

export async function fetchUserLiked(eventId: string, userId?: string): Promise<boolean> {
  if (!userId) return false;

  const { data, error } = await supabase
    .from("event_likes")
    .select("*")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}
