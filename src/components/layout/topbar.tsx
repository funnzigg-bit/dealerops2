import Link from "next/link";
import { Bell, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAuthSession } from "@/lib/auth";

export async function Topbar() {
  const session = await getAuthSession();

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-3 lg:px-8">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-500" />
          <Input placeholder="Global search vehicles, customers, deals..." className="pl-9" />
        </div>
        <Button variant="outline" size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Quick Action
        </Button>
        <Button variant="ghost" size="sm">
          <Bell className="h-4 w-4" />
        </Button>
        <Link href="/profile" className="rounded-md border border-zinc-800 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900">
          {session?.user?.name ?? "User"}
        </Link>
      </div>
    </header>
  );
}
