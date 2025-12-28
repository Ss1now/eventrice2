"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { CreateConnectionModal } from "@/components/connections/CreateConnectionModal";
import { DMDrawer } from "@/components/connections/DMDrawer";
import { useStore } from "@/lib/store";
import type { Host } from "@/lib/types";
import { Search } from "lucide-react";

export default function ConnectionsPage() {
  const { connections, hosts, user, toggleInterested } = useStore();
  const [open, setOpen] = React.useState(false);
  const [dmOpen, setDmOpen] = React.useState(false);
  const [dmOther, setDmOther] = React.useState<Host | null>(null);
  const [q, setQ] = React.useState("");

  const filtered = connections.filter((c) => {
    const author = hosts.find((h) => h.id === c.authorId);
    const hay = `${c.title} ${c.body} ${c.type} ${author?.name ?? ""} ${author?.college ?? ""}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="text-2xl font-semibold tracking-tight">Connection Hub</div>
          <div className="mt-1 text-sm text-zinc-600">
            Post what you’re looking for. If someone clicks <span className="font-medium">Interested</span>, you can DM.
          </div>
        </div>
        <Button onClick={() => setOpen(true)}>Post a connection</Button>
      </div>

      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <Search className="h-4 w-4" />
          <span>Search</span>
        </div>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try “gym”, “cofounder”, “ride share”…" className="sm:max-w-md" />
      </Card>

      <div className="grid gap-4">
        {filtered.map((c) => {
          const author = hosts.find((h) => h.id === c.authorId)!;
          const interested = c.interestedUserIds.includes(user.id);
          const canDM = interested || author.id === user.id;

          return (
            <Card key={c.id} className="flex flex-col gap-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-base font-semibold">{c.title}</div>
                  <div className="mt-1 text-sm text-zinc-600">{c.body}</div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge className="bg-zinc-900 text-white">{c.type}</Badge>
                    <Badge>{author.college}</Badge>
                    {author.verified && <Badge className="bg-emerald-50 text-emerald-700">Verified</Badge>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {author.id !== user.id && (
                    <Button variant={interested ? "outline" : "primary"} onClick={() => toggleInterested(c.id)}>
                      {interested ? "Interested ✓" : "Interested"}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDmOther(author.id === user.id ? hosts.find((h) => h.id === c.interestedUserIds[0]) ?? author : author);
                      setDmOpen(true);
                    }}
                    disabled={!canDM}
                    title={!canDM ? "Click Interested to unlock DM (demo rule)" : undefined}
                  >
                    DM
                  </Button>
                </div>
              </div>

              <div className="text-xs text-zinc-500">
                Posted by <span className="text-zinc-700">{author.name}</span> · {new Date(c.createdAt).toLocaleString()}
                {c.interestedUserIds.length ? <span> · {c.interestedUserIds.length} interested</span> : null}
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <Card>
            <div className="text-sm text-zinc-600">No posts found. Try a different search.</div>
          </Card>
        )}
      </div>

      <CreateConnectionModal open={open} onClose={() => setOpen(false)} />
      <DMDrawer open={dmOpen} onClose={() => setDmOpen(false)} other={dmOther} />
    </div>
  );
}
