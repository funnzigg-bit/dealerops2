import { TaskPriority, TaskStatus } from "@prisma/client";
import { createTask, updateTaskStatus } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default async function TasksPage() {
  const [tasks, users, vehicles, customers, deals, warranties, cases] = await Promise.all([
    prisma.task.findMany({ include: { assignedTo: true, vehicle: true, customer: true, deal: true }, orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.vehicle.findMany({ where: { deletedAt: null }, take: 100 }),
    prisma.customer.findMany({ where: { deletedAt: null }, take: 100 }),
    prisma.deal.findMany({ take: 100 }),
    prisma.warranty.findMany({ take: 100 }),
    prisma.aftersalesCase.findMany({ take: 100 }),
  ]);

  const board = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.BLOCKED, TaskStatus.DONE];

  return (
    <div className="space-y-6">
      <PageHeader title="Tasks" description="Board and list management with linked entities" />
      <Card>
        <CardHeader><CardTitle>Create task</CardTitle></CardHeader>
        <CardContent>
          <form action={createTask} className="grid gap-3 md:grid-cols-4">
            <Input name="title" placeholder="Title" required />
            <Input name="dueDate" type="date" />
            <Select name="priority" defaultValue={TaskPriority.MEDIUM}>{Object.values(TaskPriority).map((p) => <option key={p} value={p}>{p}</option>)}</Select>
            <Select name="assignedToId"><option value="">Assigned to</option>{users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</Select>
            <Select name="vehicleId"><option value="">Vehicle</option>{vehicles.map((v) => <option key={v.id} value={v.id}>{v.registration}</option>)}</Select>
            <Select name="customerId"><option value="">Customer</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.fullName}</option>)}</Select>
            <Select name="dealId"><option value="">Deal</option>{deals.map((d) => <option key={d.id} value={d.id}>{d.reference}</option>)}</Select>
            <Select name="warrantyId"><option value="">Warranty</option>{warranties.map((w) => <option key={w.id} value={w.id}>{w.warrantyNumber}</option>)}</Select>
            <Select name="aftersalesCaseId"><option value="">Aftersales case</option>{cases.map((c) => <option key={c.id} value={c.id}>{c.reference}</option>)}</Select>
            <Textarea name="description" placeholder="Description" className="md:col-span-4" />
            <Button className="md:w-fit">Create task</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-4">
        {board.map((status) => (
          <Card key={status}>
            <CardHeader><CardTitle>{status}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {tasks.filter((t) => t.status === status).map((task) => {
                const overdue = task.dueDate && task.dueDate < new Date() && task.status !== TaskStatus.DONE;
                return (
                  <div key={task.id} className={`rounded-lg border p-3 text-sm ${overdue ? "border-red-600" : "border-zinc-800"}`}>
                    <p>{task.title}</p>
                    <p className="text-xs text-zinc-500">Due {formatDate(task.dueDate)} · {task.assignedTo?.name ?? "Unassigned"}</p>
                    <form action={updateTaskStatus} className="mt-2 flex items-center gap-2">
                      <input type="hidden" name="id" value={task.id} />
                      <Select name="status" defaultValue={task.status} className="h-8 text-xs">
                        {Object.values(TaskStatus).map((s) => <option key={s} value={s}>{s}</option>)}
                      </Select>
                      <Button size="sm" type="submit">Save</Button>
                    </form>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
