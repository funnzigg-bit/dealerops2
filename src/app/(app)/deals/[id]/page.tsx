import { notFound } from "next/navigation";
import { createComplianceEvidence } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, gbp } from "@/lib/utils";

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      customer: true,
      vehicle: true,
      salesperson: true,
      financeApplications: { include: { provider: true } },
      invoice: true,
      dealNotes: { include: { user: true }, orderBy: { createdAt: "desc" } },
      warranties: true,
      communications: { orderBy: { createdAt: "desc" } },
      complianceEvidence: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!deal) notFound();

  const grossProfit = Number(deal.agreedPrice ?? 0) - Number(deal.vehicle.purchasePrice ?? 0) - Number(deal.vehicle.prepCost ?? 0);

  return (
    <div className="space-y-6">
      <PageHeader title={`Deal ${deal.reference}`} description={`${deal.customer.fullName} · ${deal.vehicle.registration} · ${deal.stage}`} />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Commercial Summary</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm text-zinc-300">
            <p>Agreed price: {gbp(deal.agreedPrice?.toString())}</p>
            <p>Deposit: {gbp(deal.deposit?.toString())}</p>
            <p>Part exchange: {gbp(deal.partExchangeValue?.toString())}</p>
            <p>Add-ons: {gbp(deal.addOnsValue?.toString())}</p>
            <p className="font-semibold text-cyan-300">Gross profit: {gbp(grossProfit)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Finance Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {deal.financeApplications.map((f) => (
              <div key={f.id} className="rounded-lg border border-zinc-800 p-3">
                <p>{f.provider.name} · {f.proposalReference} · {f.status}</p>
                <p className="text-zinc-400">Amount {gbp(f.amountFinanced.toString())} · Commission {gbp(f.commission?.toString())}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Deal Timeline / Notes</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {deal.dealNotes.map((n) => (
              <div key={n.id} className="rounded-lg border border-zinc-800 p-3">
                <p>{n.note}</p>
                <p className="text-xs text-zinc-500">{n.user.name} · {formatDate(n.createdAt)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Compliance Evidence</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <form action={createComplianceEvidence} className="space-y-2 text-sm">
              <input type="hidden" name="dealId" value={deal.id} />
              <Input name="title" placeholder="Evidence title" required />
              <Textarea name="details" placeholder="Details" required />
              <Input name="documentUrl" placeholder="Document URL" />
              <label className="flex items-center gap-2"><input type="checkbox" name="acknowledged" /> Acknowledged</label>
              <Button size="sm">Save evidence</Button>
            </form>
            {deal.complianceEvidence.map((ev) => (
              <div key={ev.id} className="rounded-lg border border-zinc-800 p-3 text-sm">{ev.title} · {formatDate(ev.createdAt)}</div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
