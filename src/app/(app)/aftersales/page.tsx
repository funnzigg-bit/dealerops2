import { AftersalesPriority, AftersalesStatus } from "@prisma/client";
import { createAftersalesCase } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatDate, gbp } from "@/lib/utils";

export default async function AftersalesPage() {
  const [cases, customers, vehicles, warranties, garages, users] = await Promise.all([
    prisma.aftersalesCase.findMany({ include: { customer: true, vehicle: true, warranty: true, garage: true, assignedTo: true }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.customer.findMany({ where: { deletedAt: null }, take: 100 }),
    prisma.vehicle.findMany({ where: { deletedAt: null }, take: 100 }),
    prisma.warranty.findMany({ where: { status: "ACTIVE" }, take: 100 }),
    prisma.garage.findMany({ where: { active: true } }),
    prisma.user.findMany({ where: { active: true, role: { in: ["AFTERSALES", "MANAGER", "ADMIN"] } } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Aftersales Cases" description="Issue workflow, cost tracking, outcomes and attachments" />

      <Card>
        <CardHeader><CardTitle>Create issue</CardTitle></CardHeader>
        <CardContent>
          <form action={createAftersalesCase} className="grid gap-3 md:grid-cols-4">
            <Input name="issueTitle" placeholder="Issue title" required />
            <Select name="vehicleId" required>
              <option value="">Vehicle</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.registration} · {v.make} {v.model}</option>)}
            </Select>
            <Select name="customerId" required>
              <option value="">Customer</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.fullName}</option>)}
            </Select>
            <Select name="warrantyId"><option value="">Warranty (optional)</option>{warranties.map((w) => <option key={w.id} value={w.id}>{w.warrantyNumber}</option>)}</Select>
            <Select name="assignedToId"><option value="">Assigned staff</option>{users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</Select>
            <Select name="garageId"><option value="">Garage</option>{garages.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</Select>
            <Select name="priority" defaultValue={AftersalesPriority.MEDIUM}>{Object.values(AftersalesPriority).map((p) => <option key={p} value={p}>{p}</option>)}</Select>
            <Select name="status" defaultValue={AftersalesStatus.NEW}>{Object.values(AftersalesStatus).map((s) => <option key={s} value={s}>{s}</option>)}</Select>
            <Input name="reportedDate" type="date" required />
            <Input name="estimatedCost" type="number" placeholder="Estimated cost" step="0.01" />
            <Input name="actualCost" type="number" placeholder="Actual cost" step="0.01" />
            <Input name="outcome" placeholder="Outcome" />
            <Textarea name="description" placeholder="Description" className="md:col-span-4" required />
            <Button className="md:w-fit">Create case</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Open and closed cases</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {cases.map((c) => (
            <div key={c.id} className="rounded-lg border border-zinc-800 p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p><a href={`/aftersales/${c.id}`} className="text-cyan-300 hover:underline">{c.reference}</a> · {c.status} · {c.priority}</p>
                <p className="text-zinc-400">{formatDate(c.reportedDate)}</p>
              </div>
              <p className="text-zinc-400">{c.customer.fullName} · {c.vehicle.registration} · Garage: {c.garage?.name ?? "TBC"} · Est {gbp(c.estimatedCost?.toString())} / Actual {gbp(c.actualCost?.toString())}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
