"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Segment } from "@/components/ui/Segment";
import { computeCollegeScore, deriveHostsWithScores, splitEventsByTime } from "@/lib/demoData";
import { useStore } from "@/lib/store";
import type { College, Host } from "@/lib/types";
import { Trophy, Sparkles } from "lucide-react";

type Tab = "colleges" | "people";

function medal(i: number) {
  if (i === 0) return "🥇";
  if (i === 1) return "🥈";
  if (i === 2) return "🥉";
  return "•";
}

export default function RankingsPage() {
  const { events, hosts } = useStore();
  const [tab, setTab] = React.useState<Tab>("colleges");

  const now = new Date();
  const { past } = splitEventsByTime(events, now);

  const hostsScored = React.useMemo(() => deriveHostsWithScores(events, hosts), [events, hosts]);

  const colleges = Array.from(new Set(hostsScored.map((h) => h.college))) as College[];
  const collegeRows = colleges
    .map((c) => ({
      college: c,
      score: computeCollegeScore(events, hostsScored, c),
      events: events.filter((e) => hostsScored.find((h) => h.id === e.hostId)?.college === c).length,
      pastRated: past.filter((e) => hostsScored.find((h) => h.id === e.hostId)?.college === c && e.ratings.length).length
    }))
    .sort((a, b) => b.score - a.score);

  const peopleRows = hostsScored
    .map((h) => {
      const hosted = events.filter((e) => e.hostId === h.id);
      const rated = hosted.filter((e) => e.ratings.length).length;
      return {
        host: h,
        score: h.hostScore,
        events: hosted.length,
        ratedEvents: rated
      };
    })
    .sort((a, b) => b.score - a.score);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="text-2xl font-semibold tracking-tight">Rankings</div>
          <div className="mt-1 text-sm text-zinc-600">
            Clean leaderboard. Slightly unhinged bragging rights.
          </div>
        </div>
        <Segment<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { label: "Colleges", value: "colleges" },
            { label: "People", value: "people" }
          ]}
        />
      </div>

      {tab === "colleges" ? (
        <Card>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <div className="text-base font-semibold">College Ranking</div>
          </div>
          <div className="mt-2 text-sm text-zinc-600">
            Score blends: <Badge>45% event quality</Badge> <Badge>35% host reliability</Badge> <Badge>20% volume</Badge>
          </div>

          <div className="mt-5 grid gap-3">
            {collegeRows.map((r, i) => (
              <div key={r.college} className="flex flex-col gap-2 rounded-2xl border border-zinc-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 text-center">{medal(i)}</div>
                  <div>
                    <div className="text-sm font-semibold">{r.college}</div>
                    <div className="text-xs text-zinc-500">{r.events} events · {r.pastRated} rated past events</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-zinc-900 text-white">{Math.round(r.score)}</Badge>
                  <Badge>Score</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <div className="text-base font-semibold">Personal Ranking</div>
          </div>
          <div className="mt-2 text-sm text-zinc-600">
            HostScore = <Badge>70% avg event score</Badge> + <Badge>30% volume bonus</Badge> (to avoid 1-party inflation).
          </div>

          <div className="mt-5 grid gap-3">
            {peopleRows.map((r, i) => (
              <div key={r.host.id} className="flex flex-col gap-2 rounded-2xl border border-zinc-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 text-center">{medal(i)}</div>
                  <div>
                    <div className="text-sm font-semibold">{r.host.name}</div>
                    <div className="text-xs text-zinc-500">{r.host.college} · {r.events} hosted · {r.ratedEvents} rated</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-zinc-900 text-white">{Math.round(r.score)}</Badge>
                  <Badge>Host score</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
