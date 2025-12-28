import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: Props) {
  return (
    <textarea
      className={cn(
        "min-h-[90px] w-full resize-none rounded-xl border border-zinc-200 bg-white p-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-400",
        className
      )}
      {...props}
    />
  );
}
