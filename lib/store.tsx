"use client";

import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import type { ConnectionPost, DMThread, Host, PartyEvent } from "@/lib/types";
import { demoConnections, demoDMs, demoEvents, demoHosts, deriveHostsWithScores } from "@/lib/demoData";
import { fetchEvents } from "@/lib/events";
import { fetchAllProfiles, fetchMyProfile } from "@/lib/profiles";
import { useAuth } from "@/lib/useAuth";

type User = Host;

type AppState = {
  user: User;
  hosts: Host[];
  events: PartyEvent[];
  connections: ConnectionPost[];
  dms: DMThread[];
  setUser: React.Dispatch<React.SetStateAction<User>>;
  setEvents: React.Dispatch<React.SetStateAction<PartyEvent[]>>;
  addEvent: (e: PartyEvent) => void;
  reserveEvent: (eventId: string) => void;
  addRating: (eventId: string, rating: PartyEvent["ratings"][number]) => void;
  addConnection: (c: ConnectionPost) => void;
  toggleInterested: (connectionId: string) => void;
  sendDM: (otherUserId: string, text: string) => void;
  verifyUser: (verified: boolean) => void;
};

const StoreCtx = createContext<AppState | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  const [events, setEvents] = useState<PartyEvent[]>(demoMode ? demoEvents : []);
  const [connections, setConnections] = useState<ConnectionPost[]>(demoMode ? demoConnections : []);
  const [dms, setDMs] = useState<DMThread[]>(demoMode ? demoDMs : []);

  // pick a default "logged-in" user for demo; in production we map Supabase auth to a Host
  const [user, setUser] = useState<User>(demoMode ? { ...demoHosts[0], verified: true } : { id: "guest", name: "Guest", college: "Will Rice", verified: false, hostScore: 0 });

  const [hosts, setHosts] = useState<Host[]>(demoMode ? deriveHostsWithScores(demoEvents, demoHosts) : []);

  const { user: sbUser, loading: authLoading } = useAuth();

  // In non-demo mode, fetch events + profiles on mount and when auth changes
  useEffect(() => {
    if (demoMode) return;

    (async () => {
      try {
        const ev = await fetchEvents();
        setEvents(ev);
        const profiles = await fetchAllProfiles();
        const mappedHosts: Host[] = profiles.map((p) => ({
          id: p.id,
          name: p.full_name ?? p.id,
          college: (p.college ?? "Will Rice") as any,
          avatar: undefined,
          instagram: p.instagram ?? undefined,
          phone: p.phone ?? undefined,
          verified: !!p.verified,
          hostScore: 0
        }));
        // compute host scores
        setHosts(deriveHostsWithScores(ev, mappedHosts));
      } catch (e) {
        console.error("Failed to load events/hosts", e);
      }
    })();
  }, [demoMode]);

  // Sync authenticated user to store user when available
  useEffect(() => {
    if (demoMode) return;
    (async () => {
      if (!sbUser) {
        setUser({ id: "guest", name: "Guest", college: "Will Rice", verified: false, hostScore: 0 });
        return;
      }
      try {
        const p = await fetchMyProfile(sbUser.id);
        setUser({ id: sbUser.id, name: p?.full_name ?? sbUser.email ?? sbUser.id, college: (p?.college ?? "Will Rice") as any, instagram: p?.instagram ?? undefined, verified: !!p?.verified, hostScore: 0 });
      } catch (e) {
        console.error("Failed to fetch profile for auth user", e);
      }
    })();
  }, [sbUser, demoMode]);

  const addEvent: AppState["addEvent"] = (e) => {
    setEvents((prev) => [e, ...prev]);
  };

  const reserveEvent: AppState["reserveEvent"] = (eventId) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== eventId) return e;
        if (e.reservationMode !== "Reservation Required") return e;
        if (e.capacity && e.reservedCount >= e.capacity) return e;
        return { ...e, reservedCount: e.reservedCount + 1 };
      })
    );
  };

  const addRating: AppState["addRating"] = (eventId, rating) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, ratings: [rating, ...e.ratings] } : e))
    );
  };

  const addConnection: AppState["addConnection"] = (c) => {
    setConnections((prev) => [c, ...prev]);
  };

  const toggleInterested: AppState["toggleInterested"] = (connectionId) => {
    setConnections((prev) =>
      prev.map((c) => {
        if (c.id !== connectionId) return c;
        const already = c.interestedUserIds.includes(user.id);
        return {
          ...c,
          interestedUserIds: already
            ? c.interestedUserIds.filter((id) => id !== user.id)
            : [...c.interestedUserIds, user.id]
        };
      })
    );
  };

  const sendDM: AppState["sendDM"] = (otherUserId, text) => {
    setDMs((prev) => {
      const existing = prev.find(
        (t) => (t.userA === user.id && t.userB === otherUserId) || (t.userA === otherUserId && t.userB === user.id)
      );
      const msg = { id: `m_${Math.random().toString(16).slice(2)}`, from: user.id, text, createdAt: new Date().toISOString() };
      if (existing) {
        return prev.map((t) => (t.id === existing.id ? { ...t, messages: [...t.messages, msg] } : t));
      }
      const newThread: DMThread = { id: `dm_${Date.now()}`, userA: user.id, userB: otherUserId, messages: [msg] };
      return [newThread, ...prev];
    });
  };

  const verifyUser: AppState["verifyUser"] = (verified) => {
    setUser((u) => ({ ...u, verified }));
  };

  const value: AppState = {
    user,
    hosts,
    events,
    connections,
    dms,
    setUser,
    setEvents,
    addEvent,
    reserveEvent,
    addRating,
    addConnection,
    toggleInterested,
    sendDM,
    verifyUser
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
