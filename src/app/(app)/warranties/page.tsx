import Link from "next/link";
import { createWarranty } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatDate, gbp } from "@/lib/utils";

export default async function WarrantiesPage() {
  const [providers, vehicles, customers, deals, warranties] = await Promise.all([
    prisma.warrantyProvider.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.vehicle.findMany({ where: { deletedAt: null }, orderBy: { registration: "asc" }, take: 100 }),
    prisma.customer.findMany({ where: { deletedAt: null }, orderBy: { fullName: "asc" }, take: 100 }),
    prisma.deal.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.warranty.findMany({ include: { provider: true, vehicle: true, customer: true }, orderBy: { createdAt: "desc" }, take: 120 }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Warranties" description="Provider products, customer warranties and certificate output" />

      <Card>
        <CardHeader><CardTitle>Create warranty</CardTitle></CardHeader>
        <CardContent>
          <form action={createWarranty} className="grid gap-3 md:grid-cols-4">
            <Select name="providerId" required>
              <option value="">Provider</option>
              {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
            <Select name="vehicleId" required>
              <option value="">Vehicle</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.registration} · {v.make} {v.model}</option>)}
            </Select>
            <Select name="customerId" required>
              <option value="">Customer</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.fullName}</option>)}
            </Select>
            <Select name="dealId">
              <option value="">Linked deal (optional)</option>
              {deals.map((d) => <option key={d.id} value={d.id}>{d.reference}</option>)}
            </Select>
            <Input name="durationMonths" type="number" placeholder="Duration months" defaultValue="12" />
            <Input name="startDate" type="date" required />
            <Input name="endDate" type="date" required />
            <Input name="cost" type="number" placeholder="Cost" step="0.01" required />
            <Input name="retailPrice" type="number" placeholder="Retail price" step="0.01" required />
            <Textarea name="coverageNotes" placeholder="Coverage notes" className="md:col-span-4" />
            <Button className="md:w-fit">Create warranty</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Warranty register</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {warranties.map((w) => (
            <div key={w.id} className="rounded-lg border border-zinc-800 p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p><a href={`/warranties/${w.id}`} className="text-cyan-300 hover:underline">{w.warrantyNumber}</a> · {w.status} · {w.provider.name}</p>
                <Link href={`/api/pdf/warranty/${w.id}`} className="rounded-md border border-zinc-700 px-3 py-2 text-xs hover:bg-zinc-900">Certificate PDF</Link>
              </div>
              <p className="text-zinc-400">{w.customer.fullName} · {w.vehicle.registration} · {formatDate(w.startDate)} to {formatDate(w.endDate)} · Retail {gbp(w.retailPrice.toString())}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
