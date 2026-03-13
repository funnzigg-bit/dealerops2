import { createCustomer } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/tables/data-table";
import { PageHeader } from "@/components/layout/page-header";
import { customerColumns } from "./columns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 300 });

  return (
    <div className="space-y-6">
      <PageHeader title="Customer CRM" description="Manage buyers, enquiries and communication records" />
      <Card>
        <CardHeader><CardTitle>Add customer</CardTitle></CardHeader>
        <CardContent>
          <form action={createCustomer} className="grid gap-3 md:grid-cols-3">
            <Input name="fullName" placeholder="Full name" required />
            <Input name="mobile" placeholder="Mobile" required />
            <Input name="email" placeholder="Email" />
            <Input name="address" placeholder="Address" />
            <Input name="townCity" placeholder="Town/City" />
            <Input name="postcode" placeholder="Postcode" />
            <Input name="drivingLicence" placeholder="Driving licence" />
            <Select name="preferredContact" defaultValue="Phone">
              <option>Phone</option>
              <option>Email</option>
              <option>SMS</option>
              <option>WhatsApp</option>
            </Select>
            <label className="flex items-center gap-2 rounded-md border border-zinc-700 px-3 text-sm text-zinc-200">
              <input name="marketingConsent" type="checkbox" /> Marketing consent
            </label>
            <div className="md:col-span-3">
              <Textarea name="notes" placeholder="Notes" />
            </div>
            <Button className="md:w-fit">Save customer</Button>
          </form>
        </CardContent>
      </Card>

      <DataTable columns={customerColumns} data={customers} searchPlaceholder="Search customer name, mobile, email..." />
    </div>
  );
}
