import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

type AuditInput = {
  entityType: string;
  entityId: string;
  action: string;
  userId?: string;
  beforeData?: unknown;
  afterData?: unknown;
  meta?: unknown;
};

export async function writeAuditLog(input: AuditInput) {
  const immutableHash = createHash("sha256")
    .update(JSON.stringify({ ...input, at: new Date().toISOString() }))
    .digest("hex");

  await prisma.auditLog.create({
    data: {
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      userId: input.userId,
      beforeData: input.beforeData as object | undefined,
      afterData: input.afterData as object | undefined,
      meta: input.meta as object | undefined,
      immutableHash,
    },
  });
}
