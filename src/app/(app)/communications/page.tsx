import { CommunicationDirection, CommunicationType } from "@prisma/client";
import { createCommunication } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default async function CommunicationsPage() {
  const [logs, customers, deals, vehicles] = await Promise.all([
    prisma.communicationLog.findMany({ include: { customer: true, user: true, deal: true, vehicle: true }, orderBy: { createdAt: "desc" }, take: 120 }),
    prisma.customer.findMany({ where: { deletedAt: null }, take: 120 }),
    prisma.deal.findMany({ take: 120 }),
    prisma.vehicle.findMany({ where: { deletedAt: null }, take: 120 }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Communication Log" description="Calls, emails, SMS and WhatsApp records" />

      <Card>
        <CardHeader><CardTitle>Log communication</CardTitle></CardHeader>
        <CardContent>
          <form action={createCommunication} className="grid gap-3 md:grid-cols-4">
            <Select name="type" defaultValue={CommunicationType.CALL}>{Object.values(CommunicationType).map((t) => <option key={t} value={t}>{t}</option>)}</Select>
            <Select name="direction" defaultValue={CommunicationDirection.OUTBOUND}>{Object.values(CommunicationDirection).map((d) => <option key={d} value={d}>{d}</option>)}</Select>
            <Select name="customerId" required><option value="">Customer</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.fullName}</option>)}</Select>
            <Input name="subject" placeholder="Subject" />
            <Select name="vehicleId"><option value="">Vehicle (optional)</option>{vehicles.map((v) => <option key={v.id} value={v.id}>{v.registration}</option>)}</Select>
            <Select name="dealId"><option value="">Deal (optional)</option>{deals.map((d) => <option key={d.id} value={d.id}>{d.reference}</option>)}</Select>
            <Textarea name="notes" placeholder="Notes" className="md:col-span-4" required />
            <Button className="md:w-fit">Save log</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>History</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {logs.map((log) => (
            <div key={log.id} className="rounded-lg border border-zinc-800 p-3">
              <p>{log.type} · {log.direction} · {log.customer.fullName} · {log.subject ?? "No subject"}</p>
              <p className="text-zinc-400">{log.notes}</p>
              <p className="text-xs text-zinc-500">{log.user.name} · {formatDate(log.createdAt)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
