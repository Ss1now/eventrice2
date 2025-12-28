"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useStore } from "@/lib/store";
import type { Host } from "@/lib/types";

export function DMDrawer({
  open,
  onClose,
  other
}: {
  open: boolean;
  onClose: () => void;
  other: Host | null;
}) {
  const { user, dms, sendDM } = useStore();
  const [text, setText] = React.useState("");

  const thread = React.useMemo(() => {
    if (!other) return null;
    return dms.find(
      (t) => (t.userA === user.id && t.userB === other.id) || (t.userA === other.id && t.userB === user.id)
    ) ?? null;
  }, [dms, other, user.id]);

  function submit() {
    if (!other || !text.trim()) return;
    sendDM(other.id, text.trim());
    setText("");
  }

  return (
    <Modal open={open} onClose={onClose} title={other ? `DM · ${other.name}` : "DM"}>
      {!other ? (
        <div className="text-sm text-zinc-600">Pick a person first.</div>
      ) : (
        <div className="grid gap-3">
          <div className="max-h-[45vh] space-y-2 overflow-auto rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
            {(thread?.messages ?? []).map((m) => (
              <div key={m.id} className={m.from === user.id ? "flex justify-end" : "flex justify-start"}>
                <div className={m.from === user.id ? "max-w-[80%] rounded-2xl bg-zinc-900 px-3 py-2 text-sm text-white" : "max-w-[80%] rounded-2xl bg-white px-3 py-2 text-sm text-zinc-800 border border-zinc-200"}>
                  {m.text}
                  <div className="mt-1 text-[10px] opacity-70">
                    {new Date(m.createdAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}
            {(!thread || thread.messages.length === 0) && (
              <div className="text-sm text-zinc-600">No messages yet. Say hi 👋</div>
            )}
          </div>

          <div className="flex gap-2">
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" />
            <Button onClick={submit}>Send</Button>
          </div>

          <div className="text-xs text-zinc-500">
            Frontend demo DM. Hook this to Supabase Realtime later.
          </div>
        </div>
      )}
    </Modal>
  );
}
