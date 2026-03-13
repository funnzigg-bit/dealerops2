import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, gbp } from "@/lib/utils";

export default async function ReportsPage() {
  const [salesByMonth, stockAge, warrantyRevenue, aftersalesCosts, financeComms, staffPerformance] = await Promise.all([
    prisma.$queryRaw<Array<{ month: string; sales: number; profit: number }>>(Prisma.sql`
      SELECT to_char(date_trunc('month', d."createdAt"), 'YYYY-MM') AS month,
             COUNT(*)::int AS sales,
             COALESCE(SUM(COALESCE(d."agreedPrice", 0)), 0)::float AS profit
      FROM "Deal" d
      GROUP BY 1
      ORDER BY 1 DESC
      LIMIT 12
    `),
    prisma.vehicle.findMany({ where: { status: { in: ["IN_STOCK", "RESERVED", "IN_PREP", "AT_GARAGE"] }, deletedAt: null }, select: { registration: true, purchaseDate: true } }),
    prisma.warranty.aggregate({ _sum: { retailPrice: true, cost: true } }),
    prisma.aftersalesCase.aggregate({ _sum: { actualCost: true, estimatedCost: true } }),
    prisma.financeApplication.aggregate({ _sum: { commission: true } }),
    prisma.deal.groupBy({ by: ["salespersonId"], _count: { _all: true } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reporting"
        description="Sales, stock ageing, warranty, aftersales, finance and staff summaries"
        action={
          <div className="flex gap-2">
            <Link href="/api/reports/csv/sales" className="rounded-md border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-900">Export sales CSV</Link>
            <Link href="/api/reports/csv/stock" className="rounded-md border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-900">Export stock CSV</Link>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card><CardHeader><CardTitle>Warranty Revenue</CardTitle></CardHeader><CardContent><p>Retail: {gbp(warrantyRevenue._sum.retailPrice?.toString())}</p><p>Cost: {gbp(warrantyRevenue._sum.cost?.toString())}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Aftersales Cost Summary</CardTitle></CardHeader><CardContent><p>Estimated: {gbp(aftersalesCosts._sum.estimatedCost?.toString())}</p><p>Actual: {gbp(aftersalesCosts._sum.actualCost?.toString())}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Finance Commission</CardTitle></CardHeader><CardContent><p>Total: {gbp(financeComms._sum.commission?.toString())}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Sales and Profit by Month</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {salesByMonth.map((m) => <div key={m.month} className="rounded-lg border border-zinc-800 p-3">{m.month} · Sales {m.sales} · Revenue {gbp(m.profit)}</div>)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Stock Ageing</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {stockAge.slice(0, 30).map((s) => (
            <div key={s.registration} className="rounded-lg border border-zinc-800 p-3">
              {s.registration} · Purchased {formatDate(s.purchaseDate)}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Staff Performance Summary</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {staffPerformance.map((s) => (
            <div key={s.salespersonId} className="rounded-lg border border-zinc-800 p-3">User {s.salespersonId} · Deals {s._count._all}</div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
