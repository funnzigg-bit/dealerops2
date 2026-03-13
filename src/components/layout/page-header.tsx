import { Button } from "@/components/ui/button";

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="font-rajdhani text-3xl font-semibold tracking-wide text-zinc-100">{title}</h1>
        {description ? <p className="mt-1 text-sm text-zinc-400">{description}</p> : null}
      </div>
      {action ?? <Button variant="outline">Export</Button>}
    </div>
  );
}
