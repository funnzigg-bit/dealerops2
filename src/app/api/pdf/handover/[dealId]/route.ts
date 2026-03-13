import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ dealId: string }> }) {
  const { dealId } = await params;
  const deal = await prisma.deal.findUnique({ where: { id: dealId }, include: { customer: true, vehicle: true, salesperson: true } });
  if (!deal) return new Response("Deal not found", { status: 404 });

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const draw = (text: string, y: number, size = 11) => page.drawText(text, { x: 50, y, size, font, color: rgb(0.1, 0.1, 0.1) });

  draw("Vehicle Handover Form", 800, 18);
  draw(`Deal Ref: ${deal.reference}`, 770);
  draw(`Customer: ${deal.customer.fullName}`, 750);
  draw(`Vehicle: ${deal.vehicle.registration} ${deal.vehicle.make} ${deal.vehicle.model}`, 730);
  draw(`Collection Date: ${deal.collectionDate?.toDateString() ?? "TBC"}`, 710);
  draw(`Delivery Method: ${deal.deliveryMethod ?? "Collection"}`, 690);
  draw(`Salesperson: ${deal.salesperson.name}`, 670);
  draw("Checklist:", 640, 12);
  draw("- V5C handed", 620);
  draw("- Keys handed", 600);
  draw("- Service book/docs handed", 580);
  draw("- Vehicle condition accepted", 560);
  draw("Customer Signature: __________________________", 500);

  const bytes = await pdf.save();
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=handover-${deal.reference}.pdf`,
    },
  });
}
