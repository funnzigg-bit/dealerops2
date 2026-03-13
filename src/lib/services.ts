import { Prisma, VehicleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const [
    inStock,
    reserved,
    soldThisMonth,
    stockValue,
    monthRevenue,
    financeOutstanding,
    activeWarranties,
    openAftersales,
    atGarages,
    upcomingTasks,
    recentActivity,
    salesByMonth,
    warrantyStatus,
    aftersalesByStatus,
    leadSummary,
  ] = await Promise.all([
    prisma.vehicle.count({ where: { status: VehicleStatus.IN_STOCK, deletedAt: null } }),
    prisma.vehicle.count({ where: { status: VehicleStatus.RESERVED, deletedAt: null } }),
    prisma.deal.count({ where: { stage: "COMPLETED", completedAt: { gte: monthStart }, deletedAt: null } }),
    prisma.vehicle.aggregate({ where: { deletedAt: null }, _sum: { advertisedPrice: true } }),
    prisma.invoice.aggregate({ where: { issuedAt: { gte: monthStart } }, _sum: { total: true } }),
    prisma.financeApplication.aggregate({
      where: { status: { in: ["SUBMITTED", "ACCEPTED"] } },
      _sum: { amountFinanced: true },
    }),
    prisma.warranty.count({ where: { status: "ACTIVE" } }),
    prisma.aftersalesCase.count({ where: { status: { notIn: ["RESOLVED", "REJECTED"] } } }),
    prisma.vehicle.count({ where: { status: VehicleStatus.AT_GARAGE, deletedAt: null } }),
    prisma.task.findMany({ where: { status: { not: "DONE" } }, orderBy: { dueDate: "asc" }, take: 6, include: { assignedTo: true } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 12, include: { user: true } }),
    prisma.$queryRaw<Array<{ month: string; total: number }>>(Prisma.sql`
      SELECT to_char(date_trunc('month', "issuedAt"), 'YYYY-MM') AS month,
             COALESCE(SUM(total), 0)::float AS total
      FROM "Invoice"
      GROUP BY 1
      ORDER BY 1
      LIMIT 12
    `),
    prisma.warranty.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.aftersalesCase.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.deal.groupBy({ by: ["stage"], _count: { _all: true } }),
  ]);

  return {
    kpis: {
      inStock,
      reserved,
      soldThisMonth,
      stockValue: Number(stockValue._sum.advertisedPrice ?? 0),
      monthRevenue: Number(monthRevenue._sum.total ?? 0),
      financeOutstanding: Number(financeOutstanding._sum.amountFinanced ?? 0),
      activeWarranties,
      openAftersales,
      atGarages,
    },
    upcomingTasks,
    recentActivity,
    charts: {
      salesByMonth,
      warrantyStatus,
      aftersalesByStatus,
      leadSummary,
    },
  };
}
