import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const checks = {
    database: false,
    nextAuthUrl: Boolean(process.env.NEXTAUTH_URL),
    nextAuthSecret: Boolean(process.env.NEXTAUTH_SECRET),
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch {
    checks.database = false;
  }

  const ok = checks.database && checks.nextAuthUrl && checks.nextAuthSecret;
  return NextResponse.json(
    { ok, checks, timestamp: new Date().toISOString() },
    { status: ok ? 200 : 503 },
  );
}

