import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAppUser } from "@/server/auth";

const DEFAULT_LIST_NAME = "My Shortlist";

const toggleSchema = z.object({
  supplierId: z.string().min(1).max(64),
});

async function getOrCreateDefaultList(userId: string) {
  const existing = await prisma.savedList.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing;
  return prisma.savedList.create({
    data: { userId, name: DEFAULT_LIST_NAME },
  });
}

export async function GET() {
  const user = await getCurrentAppUser().catch(() => null);
  if (!user) {
    return NextResponse.json({ signedIn: false, supplierIds: [] });
  }

  const entries = await prisma.savedSupplier.findMany({
    where: { list: { userId: user.id } },
    select: { supplierId: true },
  });

  return NextResponse.json({
    signedIn: true,
    supplierIds: entries.map((e) => e.supplierId),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentAppUser().catch(() => null);
  if (!user) {
    return NextResponse.json({ error: "Sign in required to save suppliers." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = toggleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid supplierId." }, { status: 400 });
  }

  const list = await getOrCreateDefaultList(user.id);
  const existing = await prisma.savedSupplier.findUnique({
    where: { listId_supplierId: { listId: list.id, supplierId: parsed.data.supplierId } },
  });

  if (existing) {
    await prisma.savedSupplier.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  }

  await prisma.savedSupplier.create({
    data: { listId: list.id, supplierId: parsed.data.supplierId },
  });
  return NextResponse.json({ saved: true });
}
