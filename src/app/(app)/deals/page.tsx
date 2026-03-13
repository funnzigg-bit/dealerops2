import Link from "next/link";
import { DealStage } from "@prisma/client";
import { createComplianceEvidence, createDeal, updateDealStage } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatDate, gbp } from "@/lib/utils";

export default async function DealsPage() {
  const [deals, customers, vehicles, sales, evidence] = await Promise.all([
    prisma.deal.findMany({ include: { customer: true, vehicle: true, salesperson: true }, orderBy: { createdAt: "desc" }, take: 80 }),
    prisma.customer.findMany({ where: { deletedAt: null }, orderBy: { fullName: "asc" }, take: 200 }),
    prisma.vehicle.findMany({ where: { deletedAt: null }, orderBy: { registration: "asc" }, take: 200 }),
    prisma.user.findMany({ where: { role: { in: ["SALES", "MANAGER", "ADMIN"] }, active: true }, orderBy: { name: "asc" } }),
    prisma.complianceEvidence.findMany({ where: { dealId: { not: null } }, orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Deals & Sales Pipeline" description="Run enquiry-to-delivery workflow with margin tracking" />

      <Card>
        <CardHeader><CardTitle>Create deal</CardTitle></CardHeader>
        <CardContent>
          <form action={createDeal} className="grid gap-3 md:grid-cols-4">
            <Select name="customerId" required>
              <option value="">Customer</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.fullName}</option>)}
            </Select>
            <Select name="vehicleId" required>
              <option value="">Vehicle</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.registration} · {v.make} {v.model}</option>)}
            </Select>
            <Select name="salespersonId" required>
              <option value="">Salesperson</option>
              {sales.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </Select>
            <Input name="agreedPrice" type="number" placeholder="Agreed price" required />
            <Input name="deposit" type="number" placeholder="Deposit" />
            <Input name="partExchangeValue" type="number" placeholder="Part exchange" />
            <Input name="addOnsValue" type="number" placeholder="Add-ons" />
            <Textarea name="notes" placeholder="Notes" className="md:col-span-4" />
            <Button type="submit" className="md:w-fit">Create deal</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Compliance Evidence (CRA/FCA)</CardTitle></CardHeader>
        <CardContent>
          <form action={createComplianceEvidence} className="grid gap-3 md:grid-cols-4">
            <Select name="dealId" required>
              <option value="">Deal</option>
              {deals.map((d) => <option key={d.id} value={d.id}>{d.reference}</option>)}
            </Select>
            <Input name="title" placeholder="Evidence title" required />
            <Input name="documentUrl" placeholder="Document URL" />
            <label className="flex items-center gap-2 rounded-md border border-zinc-700 px-3 text-sm text-zinc-200"><input name="acknowledged" type="checkbox" /> Policy acknowledged</label>
            <Textarea name="details" placeholder="Evidence details" className="md:col-span-4" />
            <Button className="md:w-fit">Attach evidence</Button>
          </form>
          <div className="mt-4 space-y-2 text-sm">
            {evidence.map((item) => <div key={item.id} className="rounded-lg border border-zinc-800 p-3">{item.title} · {formatDate(item.createdAt)}</div>)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Pipeline</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {deals.map((deal) => {
            const gp = Number(deal.agreedPrice ?? 0) - Number(deal.vehicle.purchasePrice ?? 0) - Number(deal.vehicle.prepCost ?? 0);
            return (
              <div key={deal.id} className="rounded-lg border border-zinc-800 p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p>
                    <Link href={`/deals/${deal.id}`} className="text-cyan-300 hover:underline">{deal.reference}</Link> · {deal.customer.fullName} · {deal.vehicle.registration}
                  </p>
                  <p className="text-zinc-400">Agreed {gbp(deal.agreedPrice?.toString())} · GP {gbp(gp)}</p>
                </div>
                <form action={updateDealStage} className="mt-2 flex flex-wrap items-center gap-2">
                  <input type="hidden" name="id" value={deal.id} />
                  <Select name="stage" defaultValue={deal.stage} className="w-56">
                    {Object.values(DealStage).map((stage) => <option key={stage} value={stage}>{stage}</option>)}
                  </Select>
                  <Button size="sm" type="submit">Update stage</Button>
                </form>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
