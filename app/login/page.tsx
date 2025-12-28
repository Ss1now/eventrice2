"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (res.error) {
      setError(res.error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">
        {mode === "login" ? "Sign in" : "Create account"}
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        You need an account to post, like, and manage parties.
      </p>

      <form onSubmit={submit} className="mt-6 rounded-3xl border border-zinc-100 bg-white p-6 shadow-soft space-y-4">
        <div>
          <label className="text-xs text-zinc-500">Email</label>
          <input
            className="mt-1 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-900"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-xs text-zinc-500">Password</label>
          <input
            className="mt-1 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-900"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error ? <div className="text-sm text-red-600">{error}</div> : null}

        <button
          disabled={loading}
          className="w-full rounded-2xl border border-zinc-900 bg-zinc-900 px-5 py-3 text-sm font-medium text-white shadow-hairline hover:bg-zinc-800 disabled:opacity-60"
        >
          {loading ? "Loading..." : mode === "login" ? "Sign in" : "Sign up"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="w-full rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm shadow-hairline hover:bg-zinc-50"
        >
          Switch to {mode === "login" ? "Sign up" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
