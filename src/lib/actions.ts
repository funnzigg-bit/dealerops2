"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DealStage, TaskPriority, TaskStatus, VehicleLocation, VehicleStatus } from "@prisma/client";
import { getAuthSession } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { canWrite } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { commsSchema, customerSchema, dealSchema, taskSchema, vehicleSchema } from "@/lib/validation";

async function requireWriter(module: Parameters<typeof canWrite>[1]) {
  const session = await getAuthSession();
  if (!session?.user) throw new Error("Unauthenticated");
  if (!canWrite(session.user.role, module)) throw new Error("Forbidden");
  return session.user;
}

function toNum(value: FormDataEntryValue | null) {
  if (value == null || value === "") return null;
  return Number(value);
}

export async function createVehicle(formData: FormData) {
  const user = await requireWriter("vehicles");

  const parsed = vehicleSchema.parse({
    registration: formData.get("registration"),
    vin: formData.get("vin"),
    stockNumber: formData.get("stockNumber"),
    make: formData.get("make"),
    model: formData.get("model"),
    year: formData.get("year"),
    mileage: formData.get("mileage"),
    fuelType: formData.get("fuelType"),
    transmission: formData.get("transmission"),
    advertisedPrice: formData.get("advertisedPrice"),
  });

  const vehicle = await prisma.vehicle.create({
    data: {
      ...parsed,
      derivative: String(formData.get("derivative") ?? ""),
      source: String(formData.get("source") ?? ""),
      supplier: String(formData.get("supplier") ?? ""),
      colour: String(formData.get("colour") ?? ""),
      engineSize: String(formData.get("engineSize") ?? ""),
      bodyStyle: String(formData.get("bodyStyle") ?? ""),
      purchasePrice: toNum(formData.get("purchasePrice")),
      prepCost: toNum(formData.get("prepCost")),
      minimumPrice: toNum(formData.get("minimumPrice")),
      status: (String(formData.get("status") || "IN_STOCK") as VehicleStatus) ?? VehicleStatus.IN_STOCK,
      location: (String(formData.get("location") || "FORECOURT") as VehicleLocation) ?? VehicleLocation.FORECOURT,
      notes: String(formData.get("notes") ?? ""),
    },
  });

  await writeAuditLog({ entityType: "Vehicle", entityId: vehicle.id, action: "CREATE", userId: user.id, afterData: vehicle });
  revalidatePath("/vehicles");
}

export async function updateVehicleStatus(formData: FormData) {
  const user = await requireWriter("vehicles");
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as VehicleStatus;
  const location = String(formData.get("location")) as VehicleLocation;

  const existing = await prisma.vehicle.findUniqueOrThrow({ where: { id } });
  const updated = await prisma.vehicle.update({ where: { id }, data: { status, location } });

  await prisma.vehicleLocationLog.create({
    data: {
      vehicleId: id,
      fromLocation: existing.location,
      toLocation: location,
      reason: `Status changed to ${status}`,
      userId: user.id,
    },
  });

  await writeAuditLog({ entityType: "Vehicle", entityId: id, action: "UPDATE_STATUS", userId: user.id, beforeData: existing, afterData: updated });
  revalidatePath("/vehicles");
}

export async function createCustomer(formData: FormData) {
  const user = await requireWriter("customers");
  const parsed = customerSchema.parse({
    fullName: formData.get("fullName"),
    mobile: formData.get("mobile"),
    email: formData.get("email"),
    postcode: formData.get("postcode"),
    marketingConsent: formData.get("marketingConsent") === "on",
  });

  const customer = await prisma.customer.create({
    data: {
      ...parsed,
      address: String(formData.get("address") ?? ""),
      townCity: String(formData.get("townCity") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      drivingLicence: String(formData.get("drivingLicence") ?? ""),
      preferredContact: String(formData.get("preferredContact") ?? ""),
    },
  });

  await writeAuditLog({ entityType: "Customer", entityId: customer.id, action: "CREATE", userId: user.id, afterData: customer });
  revalidatePath("/customers");
}

export async function createDeal(formData: FormData) {
  const user = await requireWriter("deals");
  const parsed = dealSchema.parse({
    customerId: formData.get("customerId"),
    vehicleId: formData.get("vehicleId"),
    salespersonId: formData.get("salespersonId"),
    agreedPrice: formData.get("agreedPrice"),
    deposit: formData.get("deposit"),
    notes: formData.get("notes"),
  });

  const deal = await prisma.deal.create({
    data: {
      reference: `DL-${Date.now().toString().slice(-8)}`,
      ...parsed,
      stage: DealStage.ENQUIRY,
    },
  });

  await writeAuditLog({ entityType: "Deal", entityId: deal.id, action: "CREATE", userId: user.id, afterData: deal });
  revalidatePath("/deals");
}

export async function updateDealStage(formData: FormData) {
  const user = await requireWriter("deals");
  const id = String(formData.get("id"));
  const stage = String(formData.get("stage")) as DealStage;

  const before = await prisma.deal.findUniqueOrThrow({ where: { id } });
  const after = await prisma.deal.update({ where: { id }, data: { stage, completedAt: stage === DealStage.COMPLETED ? new Date() : null } });

  await writeAuditLog({ entityType: "Deal", entityId: id, action: "STATUS_CHANGE", userId: user.id, beforeData: before, afterData: after });
  revalidatePath("/deals");
}

export async function createTask(formData: FormData) {
  const user = await requireWriter("tasks");
  const parsed = taskSchema.parse({
    title: formData.get("title"),
    description: formData.get("description"),
    priority: formData.get("priority"),
    dueDate: formData.get("dueDate"),
    assignedToId: formData.get("assignedToId"),
  });

  await prisma.task.create({
    data: {
      title: parsed.title,
      description: parsed.description,
      priority: parsed.priority as TaskPriority,
      dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
      assignedToId: parsed.assignedToId || null,
      createdById: user.id,
      status: TaskStatus.TODO,
      vehicleId: String(formData.get("vehicleId") || "") || null,
      customerId: String(formData.get("customerId") || "") || null,
      dealId: String(formData.get("dealId") || "") || null,
      warrantyId: String(formData.get("warrantyId") || "") || null,
      aftersalesCaseId: String(formData.get("aftersalesCaseId") || "") || null,
    },
  });

  revalidatePath("/tasks");
}

export async function updateTaskStatus(formData: FormData) {
  const user = await requireWriter("tasks");
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as TaskStatus;
  const before = await prisma.task.findUniqueOrThrow({ where: { id } });
  const after = await prisma.task.update({ where: { id }, data: { status } });
  await writeAuditLog({ entityType: "Task", entityId: id, action: "STATUS_CHANGE", userId: user.id, beforeData: before, afterData: after });
  revalidatePath("/tasks");
}

export async function createCommunication(formData: FormData) {
  const user = await requireWriter("communications");
  const parsed = commsSchema.parse({
    type: formData.get("type"),
    direction: formData.get("direction"),
    notes: formData.get("notes"),
    customerId: formData.get("customerId"),
    dealId: formData.get("dealId"),
    vehicleId: formData.get("vehicleId"),
    subject: formData.get("subject"),
  });

  await prisma.communicationLog.create({
    data: {
      ...parsed,
      userId: user.id,
      dealId: parsed.dealId || null,
      vehicleId: parsed.vehicleId || null,
      subject: parsed.subject || null,
    },
  });

  revalidatePath("/communications");
}

export async function moveVehicle(formData: FormData) {
  const user = await requireWriter("locations");
  const vehicleId = String(formData.get("vehicleId"));
  const toLocation = String(formData.get("toLocation")) as VehicleLocation;
  const reason = String(formData.get("reason") || "Movement logged");

  const vehicle = await prisma.vehicle.findUniqueOrThrow({ where: { id: vehicleId } });
  await prisma.vehicle.update({ where: { id: vehicleId }, data: { location: toLocation } });
  await prisma.vehicleLocationLog.create({
    data: {
      vehicleId,
      fromLocation: vehicle.location,
      toLocation,
      reason,
      notes: String(formData.get("notes") || ""),
      userId: user.id,
    },
  });
  revalidatePath("/locations");
}

export async function createInvoiceFromDeal(formData: FormData) {
  const user = await requireWriter("invoices");
  const dealId = String(formData.get("dealId"));

  const deal = await prisma.deal.findUniqueOrThrow({ where: { id: dealId }, include: { customer: true, vehicle: true } });
  if (!deal.agreedPrice) throw new Error("Deal agreed price required");

  const subtotal = Number(deal.agreedPrice);
  const vatAmount = subtotal * 0.2;
  const total = subtotal + vatAmount;
  const depositPaid = Number(deal.deposit ?? 0);

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: `INV-${Date.now().toString().slice(-8)}`,
      dealId,
      customerId: deal.customerId,
      subtotal,
      vatAmount,
      total,
      depositPaid,
      balanceDue: total - depositPaid,
      notes: String(formData.get("notes") || ""),
      paymentMethod: String(formData.get("paymentMethod") || "Bank Transfer"),
      items: {
        create: [{ description: `${deal.vehicle.make} ${deal.vehicle.model}`, quantity: 1, unitPrice: subtotal, lineTotal: subtotal }],
      },
    },
  });

  await writeAuditLog({ entityType: "Invoice", entityId: invoice.id, action: "GENERATE", userId: user.id, afterData: invoice });
  revalidatePath("/invoices");
}

export async function markInvoiceStatus(formData: FormData) {
  const user = await requireWriter("invoices");
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as "PAID" | "PARTIALLY_PAID" | "UNPAID" | "CANCELLED";
  const before = await prisma.invoice.findUniqueOrThrow({ where: { id } });
  const after = await prisma.invoice.update({ where: { id }, data: { status, paidAt: status === "PAID" ? new Date() : null } });
  await writeAuditLog({ entityType: "Invoice", entityId: id, action: "STATUS_CHANGE", userId: user.id, beforeData: before, afterData: after });
  revalidatePath("/invoices");
}

export async function createWarranty(formData: FormData) {
  const user = await requireWriter("warranties");
  const warranty = await prisma.warranty.create({
    data: {
      warrantyNumber: `WAR-${Date.now().toString().slice(-8)}`,
      providerId: String(formData.get("providerId")),
      vehicleId: String(formData.get("vehicleId")),
      customerId: String(formData.get("customerId")),
      dealId: String(formData.get("dealId") || "") || null,
      durationMonths: Number(formData.get("durationMonths") || 12),
      startDate: new Date(String(formData.get("startDate") || new Date().toISOString())),
      endDate: new Date(String(formData.get("endDate") || new Date(Date.now() + 31536000000).toISOString())),
      cost: Number(formData.get("cost") || 0),
      retailPrice: Number(formData.get("retailPrice") || 0),
      coverageNotes: String(formData.get("coverageNotes") || ""),
    },
  });
  await writeAuditLog({ entityType: "Warranty", entityId: warranty.id, action: "CREATE", userId: user.id, afterData: warranty });
  revalidatePath("/warranties");
}

export async function createAftersalesCase(formData: FormData) {
  const user = await requireWriter("aftersales");
  const record = await prisma.aftersalesCase.create({
    data: {
      reference: `ASC-${Date.now().toString().slice(-8)}`,
      issueTitle: String(formData.get("issueTitle")),
      description: String(formData.get("description")),
      vehicleId: String(formData.get("vehicleId")),
      customerId: String(formData.get("customerId")),
      warrantyId: String(formData.get("warrantyId") || "") || null,
      assignedToId: String(formData.get("assignedToId") || "") || null,
      garageId: String(formData.get("garageId") || "") || null,
      reportedDate: new Date(String(formData.get("reportedDate") || new Date().toISOString())),
      priority: String(formData.get("priority") || "MEDIUM") as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
      status: String(formData.get("status") || "NEW") as "NEW" | "UNDER_REVIEW" | "APPROVED" | "IN_REPAIR" | "AWAITING_PARTS" | "RESOLVED" | "REJECTED",
      estimatedCost: toNum(formData.get("estimatedCost")),
      actualCost: toNum(formData.get("actualCost")),
      outcome: String(formData.get("outcome") || ""),
    },
  });
  await writeAuditLog({ entityType: "AftersalesCase", entityId: record.id, action: "CREATE", userId: user.id, afterData: record });
  revalidatePath("/aftersales");
}

export async function updateDealerSettings(formData: FormData) {
  const user = await requireWriter("settings");
  const settings = await prisma.dealerSettings.findFirst();
  const data = {
    dealershipName: String(formData.get("dealershipName")),
    legalName: String(formData.get("legalName") || ""),
    vatNumber: String(formData.get("vatNumber") || ""),
    addressLine1: String(formData.get("addressLine1") || ""),
    townCity: String(formData.get("townCity") || ""),
    postcode: String(formData.get("postcode") || ""),
    phone: String(formData.get("phone") || ""),
    email: String(formData.get("email") || ""),
    invoicePrefix: String(formData.get("invoicePrefix") || "INV"),
    warrantyPrefix: String(formData.get("warrantyPrefix") || "WAR"),
    invoiceTerms: String(formData.get("invoiceTerms") || ""),
    warrantyFooter: String(formData.get("warrantyFooter") || ""),
  };

  if (settings) await prisma.dealerSettings.update({ where: { id: settings.id }, data });
  else await prisma.dealerSettings.create({ data });

  await writeAuditLog({ entityType: "DealerSettings", entityId: settings?.id ?? "new", action: "UPDATE", userId: user.id, afterData: data });
  revalidatePath("/settings");
}

export async function updateUserRole(formData: FormData) {
  const user = await requireWriter("users");
  const id = String(formData.get("id"));
  const role = String(formData.get("role")) as "ADMIN" | "MANAGER" | "SALES" | "AFTERSALES";
  const active = formData.get("active") === "true";

  await prisma.user.update({ where: { id }, data: { role, active } });
  await writeAuditLog({ entityType: "User", entityId: id, action: "ROLE_UPDATE", userId: user.id, afterData: { role, active } });
  revalidatePath("/users");
}

export async function createComplianceEvidence(formData: FormData) {
  const user = await requireWriter("deals");
  await prisma.complianceEvidence.create({
    data: {
      dealId: String(formData.get("dealId") || "") || null,
      aftersalesCaseId: String(formData.get("aftersalesCaseId") || "") || null,
      title: String(formData.get("title")),
      details: String(formData.get("details")),
      documentUrl: String(formData.get("documentUrl") || "") || null,
      acknowledgedAt: formData.get("acknowledged") === "on" ? new Date() : null,
    },
  });
  await writeAuditLog({ entityType: "ComplianceEvidence", entityId: "created", action: "CREATE", userId: user.id });
  revalidatePath("/deals");
  revalidatePath("/aftersales");
}

export async function hardRedirect(path: string) {
  redirect(path);
}
