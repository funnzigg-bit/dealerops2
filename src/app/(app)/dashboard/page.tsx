import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { DashboardCharts } from "@/components/dashboard/charts";
import { getDashboardData } from "@/lib/services";
import { gbp, enumLabel, formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const data = await getDashboardData();

  const kpis = [
    ["Vehicles in stock", data.kpis.inStock],
    ["Vehicles reserved", data.kpis.reserved],
    ["Vehicles sold this month", data.kpis.soldThisMonth],
    ["Total stock value", gbp(data.kpis.stockValue)],
    ["This month revenue", gbp(data.kpis.monthRevenue)],
    ["Outstanding finance", gbp(data.kpis.financeOutstanding)],
    ["Active warranties", data.kpis.activeWarranties],
    ["Open aftersales", data.kpis.openAftersales],
    ["At garage", data.kpis.atGarages],
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Live KPI overview for sales, operations and aftersales"
        action={
          <Link href="/reports" className="rounded-md border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-900">
            View reports
          </Link>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map(([label, value]) => (
          <Card key={String(label)}>
            <CardContent>
              <p className="text-xs uppercase tracking-wide text-zinc-400">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-100">{value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <DashboardCharts sales={data.charts.salesByMonth} warranty={data.charts.warrantyStatus} aftersales={data.charts.aftersalesByStatus} />

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.upcomingTasks.map((task) => (
                <div key={task.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>{task.title}</span>
                    <span className="text-zinc-400">{formatDate(task.dueDate)}</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">Assigned: {task.assignedTo?.name ?? "Unassigned"}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.recentActivity.map((item) => (
                <div key={item.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-sm">
                  <p>
                    <span className="text-cyan-300">{enumLabel(item.action)}</span> · {item.entityType}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {item.user?.name ?? "System"} · {formatDate(item.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
