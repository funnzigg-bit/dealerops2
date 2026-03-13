import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const warranty = await prisma.warranty.findUnique({ where: { id }, include: { customer: true, vehicle: true, provider: true } });
  const settings = await prisma.dealerSettings.findFirst();
  if (!warranty) return new Response("Warranty not found", { status: 404 });

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const draw = (text: string, y: number, size = 11) => page.drawText(text, { x: 50, y, size, font, color: rgb(0.1, 0.1, 0.1) });

  draw(`${settings?.dealershipName ?? "DealerOps"} Warranty Certificate`, 800, 18);
  draw(`Warranty Number: ${warranty.warrantyNumber}`, 760);
  draw(`Provider: ${warranty.provider.name}`, 740);
  draw(`Customer: ${warranty.customer.fullName}`, 720);
  draw(`Vehicle: ${warranty.vehicle.registration} ${warranty.vehicle.make} ${warranty.vehicle.model}`, 700);
  draw(`Start: ${warranty.startDate.toDateString()} | End: ${warranty.endDate.toDateString()}`, 680);
  draw(`Coverage: ${warranty.coverageNotes ?? "Refer to provider terms."}`, 660);
  draw(settings?.warrantyFooter ?? "Warranty subject to policy terms.", 620);

  const bytes = await pdf.save();
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=${warranty.warrantyNumber}.pdf`,
    },
  });
}
