import { updateDealerSettings } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const [settings, financeProviders, warrantyProviders] = await Promise.all([
    prisma.dealerSettings.findFirst(),
    prisma.financeProvider.findMany({ orderBy: { name: "asc" } }),
    prisma.warrantyProvider.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Dealership profile, invoice and certificate configuration" />
      <Card>
        <CardHeader><CardTitle>Dealership profile</CardTitle></CardHeader>
        <CardContent>
          <form action={updateDealerSettings} className="grid gap-3 md:grid-cols-3">
            <Input name="dealershipName" defaultValue={settings?.dealershipName ?? "DealerOps Motors"} placeholder="Dealership name" required />
            <Input name="legalName" defaultValue={settings?.legalName ?? ""} placeholder="Legal name" />
            <Input name="vatNumber" defaultValue={settings?.vatNumber ?? ""} placeholder="VAT number" />
            <Input name="addressLine1" defaultValue={settings?.addressLine1 ?? ""} placeholder="Address" />
            <Input name="townCity" defaultValue={settings?.townCity ?? ""} placeholder="Town/city" />
            <Input name="postcode" defaultValue={settings?.postcode ?? ""} placeholder="Postcode" />
            <Input name="phone" defaultValue={settings?.phone ?? ""} placeholder="Phone" />
            <Input name="email" defaultValue={settings?.email ?? ""} placeholder="Email" />
            <Input name="invoicePrefix" defaultValue={settings?.invoicePrefix ?? "INV"} placeholder="Invoice prefix" />
            <Input name="warrantyPrefix" defaultValue={settings?.warrantyPrefix ?? "WAR"} placeholder="Warranty prefix" />
            <Textarea name="invoiceTerms" defaultValue={settings?.invoiceTerms ?? ""} placeholder="Invoice terms" className="md:col-span-3" />
            <Textarea name="warrantyFooter" defaultValue={settings?.warrantyFooter ?? ""} placeholder="Warranty footer" className="md:col-span-3" />
            <Button className="md:w-fit">Save settings</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Finance Providers</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {financeProviders.map((f) => <div key={f.id} className="rounded-md border border-zinc-800 p-2">{f.name}</div>)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Warranty Providers</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {warrantyProviders.map((w) => <div key={w.id} className="rounded-md border border-zinc-800 p-2">{w.name}</div>)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
