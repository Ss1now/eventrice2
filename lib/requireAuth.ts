"use client";

import type { User } from "@supabase/supabase-js";

export function requireAuth(user: User | null, redirectToLogin: () => void): user is User {
  if (!user) {
    redirectToLogin();
    return false;
  }
  return true;
}
