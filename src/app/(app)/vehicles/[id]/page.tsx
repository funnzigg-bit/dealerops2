import Link from "next/link";
import { notFound } from "next/navigation";
import { calcStockAgeDays, gbp, formatDate } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      documents: true,
      images: true,
      deals: { include: { customer: true }, orderBy: { createdAt: "desc" } },
      warranties: true,
      aftersalesCases: true,
      locationLogs: { orderBy: { movedAt: "desc" }, take: 20, include: { user: true } },
    },
  });

  if (!vehicle) notFound();

  const grossProfit = Number(vehicle.salePrice ?? 0) - Number(vehicle.purchasePrice ?? 0) - Number(vehicle.prepCost ?? 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${vehicle.registration} · ${vehicle.make} ${vehicle.model}`}
        description={`Stock ${vehicle.stockNumber} · Age ${calcStockAgeDays(vehicle.purchaseDate)} days`}
        action={<Link href="/vehicles" className="rounded-md border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-900">Back to inventory</Link>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm text-zinc-300">
            <p>Status: {vehicle.status}</p>
            <p>Location: {vehicle.location}</p>
            <p>Mileage: {vehicle.mileage.toLocaleString("en-GB")}</p>
            <p>MOT expiry: {formatDate(vehicle.motExpiry)}</p>
            <p>Keys: {vehicle.keyCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Costs</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm text-zinc-300">
            <p>Purchase: {gbp(vehicle.purchasePrice?.toString())}</p>
            <p>Prep: {gbp(vehicle.prepCost?.toString())}</p>
            <p>Advertised: {gbp(vehicle.advertisedPrice?.toString())}</p>
            <p>Sale: {gbp(vehicle.salePrice?.toString())}</p>
            <p className="font-semibold text-cyan-300">Gross Profit: {gbp(grossProfit)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Media & Documents</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-zinc-300">
            <p>Images: {vehicle.images.length}</p>
            <p>Documents: {vehicle.documents.length}</p>
            <form action="/api/upload" method="post" encType="multipart/form-data" className="space-y-2">
              <input type="hidden" name="vehicleId" value={vehicle.id} />
              <input name="file" type="file" className="w-full text-xs" />
              <button className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs hover:bg-zinc-900">Upload</button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Sales history</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {vehicle.deals.map((deal) => (
              <div key={deal.id} className="rounded-lg border border-zinc-800 p-3">
                <p className="text-cyan-300">{deal.reference} · {deal.stage}</p>
                <p className="text-zinc-400">{deal.customer.fullName} · Agreed {gbp(deal.agreedPrice?.toString())}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Location tracking</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {vehicle.locationLogs.map((log) => (
              <div key={log.id} className="rounded-lg border border-zinc-800 p-3">
                <p>{log.fromLocation} → {log.toLocation}</p>
                <p className="text-zinc-400">{log.reason} · {log.user.name} · {formatDate(log.movedAt)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Warranty</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {vehicle.warranties.map((w) => (
              <div key={w.id} className="rounded-lg border border-zinc-800 p-3">
                <p>{w.warrantyNumber} · {w.status}</p>
                <p className="text-zinc-400">{formatDate(w.startDate)} - {formatDate(w.endDate)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Aftersales</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {vehicle.aftersalesCases.map((c) => (
              <div key={c.id} className="rounded-lg border border-zinc-800 p-3">
                <p>{c.reference} · {c.status}</p>
                <p className="text-zinc-400">{c.issueTitle}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
