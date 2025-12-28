"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import type { ConnectionPost, ConnectionType } from "@/lib/types";
import { useStore } from "@/lib/store";

const types: ConnectionType[] = [
  "Find a +1",
  "Study Buddy",
  "Gym Partner",
  "Ride Share",
  "Band / Jam",
  "Startup Co-founder",
  "Roommate / Sublet",
  "Club / Org Friends",
  "Just vibe"
];

export function CreateConnectionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addConnection, user } = useStore();
  const [title, setTitle] = React.useState("");
  const [type, setType] = React.useState<ConnectionType>("Just vibe");
  const [body, setBody] = React.useState("");

  function submit() {
    if (!title || !body) return;
    const c: ConnectionPost = {
      id: `c_${Date.now()}`,
      title,
      type,
      body,
      authorId: user.id,
      createdAt: new Date().toISOString(),
      interestedUserIds: []
    };
    addConnection(c);
    setTitle("");
    setBody("");
    setType("Just vibe");
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Post a connection">
      <div className="grid gap-3">
        <div className="grid gap-2">
          <div className="text-xs text-zinc-500">Title</div>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Looking for a study buddy" />
        </div>

        <div className="grid gap-2">
          <div className="text-xs text-zinc-500">Type</div>
          <div className="flex flex-wrap gap-2">
            {types.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={t === type ? "rounded-2xl bg-zinc-900 px-3 py-2 text-sm text-white" : "rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <div className="text-xs text-zinc-500">Details</div>
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="What are you looking for? Any time/location constraints?" />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button onClick={submit} type="button" disabled={!title || !body}>
            Post
          </Button>
        </div>
      </div>
    </Modal>
  );
}
