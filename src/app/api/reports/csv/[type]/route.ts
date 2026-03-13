import Papa from "papaparse";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;

  if (type === "sales") {
    const data = await prisma.deal.findMany({
      include: { customer: true, vehicle: true, salesperson: true },
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    const csv = Papa.unparse(
      data.map((d) => ({
        reference: d.reference,
        stage: d.stage,
        customer: d.customer.fullName,
        vehicle: d.vehicle.registration,
        salesperson: d.salesperson.name,
        agreedPrice: Number(d.agreedPrice ?? 0),
        deposit: Number(d.deposit ?? 0),
        createdAt: d.createdAt.toISOString(),
      })),
    );
    return new Response(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=sales-report.csv" } });
  }

  if (type === "stock") {
    const data = await prisma.vehicle.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 500 });
    const csv = Papa.unparse(
      data.map((v) => ({
        registration: v.registration,
        make: v.make,
        model: v.model,
        year: v.year,
        mileage: v.mileage,
        status: v.status,
        location: v.location,
        purchasePrice: Number(v.purchasePrice ?? 0),
        advertisedPrice: Number(v.advertisedPrice ?? 0),
      })),
    );
    return new Response(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=stock-report.csv" } });
  }

  return new Response("Unknown report", { status: 400 });
}
