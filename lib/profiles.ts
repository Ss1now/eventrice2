"use client";

import { supabase } from "@/lib/supabaseClient";

export type Profile = {
  id: string;
  full_name: string | null;
  instagram: string | null;
  phone: string | null;
  college: string | null;
  verified: boolean;
};

export async function fetchMyProfile(userId: string): Promise<Profile | null> {
  if (!userId) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, instagram, phone, college, verified")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

export async function upsertMyProfile(input: {
  userId: string;
  full_name?: string | null;
  instagram?: string | null;
  phone?: string | null;
  college?: string | null;
  verified?: boolean;
}) {
  if (!input.userId) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: input.userId,
        full_name: input.full_name ?? null,
        instagram: input.instagram ?? null,
        phone: input.phone ?? null,
        college: input.college ?? null,
        verified: input.verified ?? false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )
    .select("id, full_name, instagram, phone, college, verified")
    .single();

  if (error) throw error;
  return data;
}
