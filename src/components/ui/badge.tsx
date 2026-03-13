import { cn, enumLabel } from "@/lib/utils";

export function Badge({ value, className }: { value: string; className?: string }) {
  return (
    <span className={cn("inline-flex rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs text-zinc-200", className)}>
      {enumLabel(value)}
    </span>
  );
}
