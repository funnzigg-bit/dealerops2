import { z } from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const vehicleSchema = z.object({
  registration: z.string().min(2).max(12),
  vin: z.string().min(8),
  stockNumber: z.string().min(2),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().min(1990).max(new Date().getFullYear() + 1),
  mileage: z.coerce.number().min(0),
  fuelType: z.string().min(1),
  transmission: z.string().min(1),
  advertisedPrice: z.coerce.number().min(0),
});

export const customerSchema = z.object({
  fullName: z.string().min(2),
  mobile: z.string().min(8),
  email: z.email().optional().or(z.literal("")),
  postcode: z.string().optional(),
  marketingConsent: z.boolean().default(false),
});

export const dealSchema = z.object({
  customerId: z.string().min(1),
  vehicleId: z.string().min(1),
  salespersonId: z.string().min(1),
  agreedPrice: z.coerce.number().min(0),
  deposit: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
});

export const taskSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  dueDate: z.string().optional(),
  assignedToId: z.string().optional(),
});

export const commsSchema = z.object({
  type: z.enum(["CALL", "EMAIL", "SMS", "WHATSAPP"]),
  direction: z.enum(["INBOUND", "OUTBOUND"]),
  notes: z.string().min(2),
  customerId: z.string().min(1),
  subject: z.string().optional(),
  dealId: z.string().optional(),
  vehicleId: z.string().optional(),
});
