"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Car, Users, Handshake, Landmark, Receipt, Shield, Wrench, MapPin, ListChecks, MessageSquare, BarChart3, Settings, UserRound } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vehicles", label: "Inventory", icon: Car },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/deals", label: "Deals", icon: Handshake },
  { href: "/finance", label: "Finance", icon: Landmark },
  { href: "/invoices", label: "Invoicing", icon: Receipt },
  { href: "/warranties", label: "Warranties", icon: Shield },
  { href: "/aftersales", label: "Aftersales", icon: Wrench },
  { href: "/locations", label: "Locations", icon: MapPin },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/communications", label: "Comms", icon: MessageSquare },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/users", label: "Users", icon: UserRound },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-zinc-800 bg-zinc-950 lg:block">
      <div className="p-5 text-xl font-semibold text-cyan-400">DealerOps</div>
      <nav className="space-y-1 px-3 pb-5">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100",
                active && "bg-zinc-900 text-cyan-300",
              )}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
