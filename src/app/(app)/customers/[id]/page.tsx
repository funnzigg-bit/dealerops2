import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, gbp } from "@/lib/utils";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      deals: { include: { vehicle: true }, orderBy: { createdAt: "desc" } },
      warranties: true,
      aftersalesCases: true,
      communications: { orderBy: { createdAt: "desc" }, take: 20 },
      tasks: true,
    },
  });
  if (!customer) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title={customer.fullName} description={`${customer.mobile} · ${customer.email ?? "No email"}`} />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Purchases and Deals</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {customer.deals.map((deal) => (
              <div key={deal.id} className="rounded-lg border border-zinc-800 p-3">
                <p>{deal.reference} · {deal.stage}</p>
                <p className="text-zinc-400">{deal.vehicle.registration} · {deal.vehicle.make} {deal.vehicle.model} · {gbp(deal.agreedPrice?.toString())}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Communication log</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {customer.communications.map((c) => (
              <div key={c.id} className="rounded-lg border border-zinc-800 p-3">
                <p>{c.type} · {c.direction} · {c.subject ?? "No subject"}</p>
                <p className="text-zinc-400">{c.notes}</p>
                <p className="text-xs text-zinc-500">{formatDate(c.createdAt)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Warranties</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {customer.warranties.map((w) => (
              <div key={w.id} className="rounded-lg border border-zinc-800 p-3">{w.warrantyNumber} · {w.status}</div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Aftersales issues</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {customer.aftersalesCases.map((a) => (
              <div key={a.id} className="rounded-lg border border-zinc-800 p-3">{a.reference} · {a.status} · {a.issueTitle}</div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
