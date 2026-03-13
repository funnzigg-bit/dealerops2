import { notFound } from "next/navigation";
import { createComplianceEvidence } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatDate, gbp } from "@/lib/utils";

export default async function AftersalesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caseRecord = await prisma.aftersalesCase.findUnique({
    where: { id },
    include: {
      customer: true,
      vehicle: true,
      warranty: true,
      assignedTo: true,
      garage: true,
      notes: { include: { user: true }, orderBy: { createdAt: "desc" } },
      complianceEvidence: { orderBy: { createdAt: "desc" } },
      tasks: true,
    },
  });

  if (!caseRecord) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title={`Case ${caseRecord.reference}`} description={`${caseRecord.status} · ${caseRecord.priority} · ${caseRecord.issueTitle}`} />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm text-zinc-300">
            <p>Vehicle: {caseRecord.vehicle.registration}</p>
            <p>Customer: {caseRecord.customer.fullName}</p>
            <p>Garage: {caseRecord.garage?.name ?? "TBC"}</p>
            <p>Assigned: {caseRecord.assignedTo?.name ?? "Unassigned"}</p>
            <p>Warranty linked: {caseRecord.warranty ? "Yes" : "No"}</p>
            <p>Estimated: {gbp(caseRecord.estimatedCost?.toString())}</p>
            <p>Actual: {gbp(caseRecord.actualCost?.toString())}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notes & Timeline</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {caseRecord.notes.map((n) => (
              <div key={n.id} className="rounded-lg border border-zinc-800 p-3">
                <p>{n.note}</p>
                <p className="text-xs text-zinc-500">{n.user.name} · {formatDate(n.createdAt)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Compliance / Evidence</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <form action={createComplianceEvidence} className="space-y-2">
              <input type="hidden" name="aftersalesCaseId" value={caseRecord.id} />
              <Input name="title" placeholder="Title" required />
              <Textarea name="details" placeholder="Evidence details" required />
              <Input name="documentUrl" placeholder="Document URL" />
              <Button size="sm">Attach</Button>
            </form>
            {caseRecord.complianceEvidence.map((ev) => <div key={ev.id} className="rounded-lg border border-zinc-800 p-3 text-sm">{ev.title}</div>)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Linked Tasks</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {caseRecord.tasks.map((task) => <div key={task.id} className="rounded-lg border border-zinc-800 p-3">{task.title} · {task.status}</div>)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
