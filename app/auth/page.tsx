"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DEMO_MODE, supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

type Mode = "email" | "phone";

export default function AuthPage() {
  const [mode, setMode] = React.useState<Mode>("email");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  async function send() {
    setMsg(null);

    if (DEMO_MODE) {
      setSent(true);
      setMsg("Demo mode: OTP 'sent'. Enter any code to continue.");
      return;
    }
    if (!supabase) {
      setMsg("Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    try {
      if (mode === "email") {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
        setSent(true);
        setMsg("Check your email for the magic link / OTP.");
      } else {
        const { error } = await supabase.auth.signInWithOtp({ phone });
        if (error) throw error;
        setSent(true);
        setMsg("Check your phone for the OTP.");
      }
    } catch (e: any) {
      setMsg(e?.message ?? "Failed to send OTP.");
    }
  }

  async function verify() {
    setMsg(null);

    if (DEMO_MODE) {
      setMsg("Demo mode: verified (no real session created).");
      return;
    }
    if (!supabase) return;

    try {
      if (mode === "email") {
        const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
        if (error) throw error;
        setMsg("Verified. You can now route users based on session.");
      } else {
        const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
        if (error) throw error;
        setMsg("Verified.");
      }
    } catch (e: any) {
      setMsg(e?.message ?? "Failed to verify OTP.");
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-semibold tracking-tight">Authentication</div>
          <div className="mt-1 text-sm text-zinc-600">Email or phone only (Supabase OTP).</div>
        </div>
        <Link href="/profile">
          <Button variant="outline">Back to profile</Button>
        </Link>
      </div>

      <Card className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          <Button variant={mode === "email" ? "primary" : "outline"} onClick={() => setMode("email")} type="button">
            Email
          </Button>
          <Button variant={mode === "phone" ? "primary" : "outline"} onClick={() => setMode("phone")} type="button">
            Phone
          </Button>
          {DEMO_MODE && <Badge className="bg-amber-50 text-amber-700">Demo mode</Badge>}
        </div>

        {mode === "email" ? (
          <div className="grid gap-2">
            <div className="text-xs text-zinc-500">Email</div>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@rice.edu" />
          </div>
        ) : (
          <div className="grid gap-2">
            <div className="text-xs text-zinc-500">Phone</div>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 555 5555" />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={send} disabled={mode === "email" ? !email : !phone}>
            Send OTP / link
          </Button>
          <div className="text-xs text-zinc-500">
            For production, you’ll redirect after session is created.
          </div>
        </div>

        {sent && (
          <div className="grid gap-2">
            <div className="text-xs text-zinc-500">Enter OTP</div>
            <div className="flex gap-2">
              <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" />
              <Button onClick={verify} disabled={!otp}>
                Verify
              </Button>
            </div>
          </div>
        )}

        {msg && <div className="text-sm text-zinc-700">{msg}</div>}
      </Card>

      <Card>
        <div className="text-sm text-zinc-700 font-semibold">Rice-only verification</div>
        <div className="mt-2 text-sm text-zinc-600">
          Backend rule suggestion: treat <span className="font-medium">@rice.edu</span> verified emails as “Rice Verified”.
          Then enforce reservation & visibility using RLS policies.
        </div>
      </Card>
    </div>
  );
}
