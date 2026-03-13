import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({ where: { id }, include: { customer: true, deal: { include: { vehicle: true } }, items: true } });
  const settings = await prisma.dealerSettings.findFirst();
  if (!invoice) return new Response("Invoice not found", { status: 404 });

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  let y = 800;
  const draw = (text: string, size = 11) => {
    page.drawText(text, { x: 50, y, size, font, color: rgb(0.1, 0.1, 0.1) });
    y -= size + 6;
  };

  draw(settings?.dealershipName ?? "DealerOps", 18);
  draw(`Invoice ${invoice.invoiceNumber}`);
  draw(`Issued ${invoice.issuedAt.toDateString()}`);
  draw(`Customer: ${invoice.customer.fullName}`);
  draw(`Vehicle: ${invoice.deal.vehicle.registration} ${invoice.deal.vehicle.make} ${invoice.deal.vehicle.model}`);
  y -= 10;
  draw("Line items:", 12);
  invoice.items.forEach((item) => draw(`- ${item.description} x${item.quantity} £${Number(item.lineTotal).toFixed(2)}`));
  y -= 10;
  draw(`Subtotal: £${Number(invoice.subtotal).toFixed(2)}`);
  draw(`VAT: £${Number(invoice.vatAmount).toFixed(2)}`);
  draw(`Total: £${Number(invoice.total).toFixed(2)}`);
  draw(`Deposit: £${Number(invoice.depositPaid).toFixed(2)}`);
  draw(`Balance: £${Number(invoice.balanceDue).toFixed(2)}`);
  draw(`Payment method: ${invoice.paymentMethod ?? "N/A"}`);
  draw(`Status: ${invoice.status}`);

  const bytes = await pdf.save();
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=${invoice.invoiceNumber}.pdf`,
    },
  });
}
