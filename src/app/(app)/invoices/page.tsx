import Link from "next/link";
import { InvoiceStatus } from "@prisma/client";
import { createInvoiceFromDeal, markInvoiceStatus } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate, gbp } from "@/lib/utils";

export default async function InvoicesPage() {
  const [deals, invoices] = await Promise.all([
    prisma.deal.findMany({ where: { invoice: null }, include: { customer: true, vehicle: true }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.invoice.findMany({ include: { customer: true, deal: true }, orderBy: { issuedAt: "desc" }, take: 80 }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Invoicing" description="Generate UK-style sales invoices and export PDFs" />

      <Card>
        <CardHeader><CardTitle>Generate from deal</CardTitle></CardHeader>
        <CardContent>
          <form action={createInvoiceFromDeal} className="flex flex-wrap items-center gap-3">
            <Select name="dealId" required className="min-w-72">
              <option value="">Select deal</option>
              {deals.map((d) => (
                <option key={d.id} value={d.id}>{d.reference} · {d.customer.fullName} · {d.vehicle.registration}</option>
              ))}
            </Select>
            <Input name="paymentMethod" placeholder="Payment method" className="w-56" />
            <Input name="notes" placeholder="Invoice notes" className="w-72" />
            <Button>Create invoice</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Invoice register</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {invoices.map((inv) => (
            <div key={inv.id} className="rounded-lg border border-zinc-800 p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p>{inv.invoiceNumber} · {inv.customer.fullName} · {gbp(inv.total.toString())}</p>
                <p className="text-zinc-400">{formatDate(inv.issuedAt)}</p>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <form action={markInvoiceStatus} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={inv.id} />
                  <Select name="status" defaultValue={inv.status} className="w-44">
                    {Object.values(InvoiceStatus).map((status) => <option key={status} value={status}>{status}</option>)}
                  </Select>
                  <Button size="sm" type="submit">Update</Button>
                </form>
                <Link href={`/api/pdf/invoice/${inv.id}`} className="rounded-md border border-zinc-700 px-3 py-2 text-xs hover:bg-zinc-900">PDF</Link>
                <Link href={`/api/pdf/handover/${inv.dealId}`} className="rounded-md border border-zinc-700 px-3 py-2 text-xs hover:bg-zinc-900">Handover PDF</Link>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
