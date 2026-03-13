import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { gbp, formatDate } from "@/lib/utils";

export default async function FinancePage() {
  const [providers, apps, summary] = await Promise.all([
    prisma.financeProvider.findMany({ orderBy: { name: "asc" } }),
    prisma.financeApplication.findMany({ include: { provider: true, deal: true, customer: true }, orderBy: { createdAt: "desc" }, take: 80 }),
    prisma.financeApplication.aggregate({ _sum: { commission: true, payout: true, amountFinanced: true } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Finance" description="Provider management, applications, profitability" />
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent><p className="text-xs text-zinc-400">Financed amount</p><p className="text-2xl font-semibold">{gbp(summary._sum.amountFinanced?.toString())}</p></CardContent></Card>
        <Card><CardContent><p className="text-xs text-zinc-400">Commission</p><p className="text-2xl font-semibold">{gbp(summary._sum.commission?.toString())}</p></CardContent></Card>
        <Card><CardContent><p className="text-xs text-zinc-400">Payout</p><p className="text-2xl font-semibold">{gbp(summary._sum.payout?.toString())}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Finance providers</CardTitle></CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-3">
          {providers.map((p) => (
            <div key={p.id} className="rounded-lg border border-zinc-800 p-3 text-sm">
              <p className="text-cyan-300">{p.name}</p>
              <p className="text-zinc-400">{p.contactEmail ?? "No email"}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Applications</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {apps.map((app) => (
            <div key={app.id} className="rounded-lg border border-zinc-800 p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p>{app.provider.name} · {app.proposalReference} · {app.status}</p>
                <p className="text-zinc-400">{formatDate(app.submittedAt)}</p>
              </div>
              <p className="text-zinc-400">Deal {app.deal.reference} · {app.customer.fullName} · Amount {gbp(app.amountFinanced.toString())} · Commission {gbp(app.commission?.toString())}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
