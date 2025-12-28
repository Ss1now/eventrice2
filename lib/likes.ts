"use client";

import { supabase } from "@/lib/supabaseClient";

export async function toggleLike(eventId: string, userId: string) {
  if (!userId) throw new Error("Not authenticated");

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
  }

  const { error } = await supabase.from("event_likes").insert({
    event_id: eventId,
    user_id: userId,
  });

  if (error) throw error;
  return { liked: true };
}

export async function fetchLikeCount(eventId: string): Promise<number> {
  const { count, error } = await supabase
    .from("event_likes")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId);

  if (error) throw error;
  return count ?? 0;
}

export async function fetchUserLiked(eventId: string, userId: string): Promise<boolean> {
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
