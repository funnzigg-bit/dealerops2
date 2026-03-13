import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignOutButton } from "@/components/layout/sign-out";
import { formatDate } from "@/lib/utils";

export default async function ProfilePage() {
  const session = await getAuthSession();
  const user = await prisma.user.findUnique({ where: { id: session?.user.id } });

  return (
    <div className="space-y-6">
      <PageHeader title="User Profile" description="Account and access overview" action={<SignOutButton />} />
      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>Name: {user?.name}</p>
          <p>Email: {user?.email}</p>
          <p>Role: {user?.role}</p>
          <p>Last login: {formatDate(user?.lastLoginAt)}</p>
        </CardContent>
      </Card>
    </div>
  );
}
