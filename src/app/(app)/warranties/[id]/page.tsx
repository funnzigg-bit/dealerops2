import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, gbp } from "@/lib/utils";

export default async function WarrantyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const warranty = await prisma.warranty.findUnique({ where: { id }, include: { customer: true, vehicle: true, provider: true, aftersalesCases: true } });
  if (!warranty) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title={`Warranty ${warranty.warrantyNumber}`} description={`${warranty.status} · ${warranty.provider.name}`} action={<Link href={`/api/pdf/warranty/${warranty.id}`} className="rounded-md border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-900">PDF</Link>} />
      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent className="space-y-1 text-sm text-zinc-300">
          <p>Customer: {warranty.customer.fullName}</p>
          <p>Vehicle: {warranty.vehicle.registration} {warranty.vehicle.make} {warranty.vehicle.model}</p>
          <p>Start: {formatDate(warranty.startDate)}</p>
          <p>End: {formatDate(warranty.endDate)}</p>
          <p>Cost: {gbp(warranty.cost.toString())}</p>
          <p>Retail: {gbp(warranty.retailPrice.toString())}</p>
          <p>Coverage: {warranty.coverageNotes ?? "-"}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Linked Aftersales Cases</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {warranty.aftersalesCases.map((c) => <div key={c.id} className="rounded-lg border border-zinc-800 p-3">{c.reference} · {c.status}</div>)}
        </CardContent>
      </Card>
    </div>
  );
}
