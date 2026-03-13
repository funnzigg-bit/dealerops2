import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const vehicleId = String(form.get("vehicleId") || "");

  if (!file || !vehicleId) return NextResponse.json({ error: "Missing file or vehicleId" }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  const safeName = `${Date.now()}-${file.name.replaceAll(" ", "-")}`;
  const fullPath = path.join(dir, safeName);
  await fs.writeFile(fullPath, bytes);

  await prisma.vehicleDocument.create({
    data: {
      vehicleId,
      fileName: file.name,
      fileUrl: `/uploads/${safeName}`,
      mimeType: file.type,
      category: "Upload",
    },
  });

  return NextResponse.redirect(new URL(`/vehicles/${vehicleId}`, req.url));
}
