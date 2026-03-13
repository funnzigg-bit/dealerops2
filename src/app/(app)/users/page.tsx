import { Role } from "@prisma/client";
import { updateUserRole } from "@/lib/actions";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

export default async function UsersPage() {
  const session = await getAuthSession();
  if (session?.user.role !== Role.ADMIN) {
    return (
      <div className="space-y-4">
        <PageHeader title="Users" description="Admin only" />
        <Card><CardContent>Insufficient permissions.</CardContent></Card>
      </div>
    );
  }

  const users = await prisma.user.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" description="Admin role and account controls" />
      <Card>
        <CardHeader><CardTitle>Users</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {users.map((user) => (
            <div key={user.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800 p-3 text-sm">
              <p>{user.name} · {user.email}</p>
              <form action={updateUserRole} className="flex items-center gap-2">
                <input type="hidden" name="id" value={user.id} />
                <Select name="role" defaultValue={user.role} className="w-40">
                  {Object.values(Role).map((role) => <option key={role} value={role}>{role}</option>)}
                </Select>
                <Select name="active" defaultValue={String(user.active)} className="w-32">
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </Select>
                <Button size="sm">Save</Button>
              </form>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
