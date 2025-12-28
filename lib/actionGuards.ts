"use client";

import type { User } from "@supabase/supabase-js";

type GuardedActionOptions = {
  user: User | null;
  redirectToLogin: () => void;
  setError?: (msg: string | null) => void;
  setLoading?: (v: boolean) => void;
};

export async function runAuthedAction<T>(
  opts: GuardedActionOptions,
  action: (user: User) => Promise<T>
): Promise<T | null> {
  const { user, redirectToLogin, setError, setLoading } = opts;

  if (!user) {
    redirectToLogin();
    return null;
  }

  try {
    setError?.(null);
    setLoading?.(true);
    return await action(user);
  } catch (e: any) {
    setError?.(e?.message ?? "Something went wrong");
    return null;
  } finally {
    setLoading?.(false);
  }
}
