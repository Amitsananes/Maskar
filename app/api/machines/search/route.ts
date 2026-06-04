import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const auth = await requireSession(["AGENT", "OFFICE", "ADMIN"]);
  if (auth.error) return auth.error;

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 1) {
    return NextResponse.json({ results: [] });
  }

  const machines = await prisma.machine.findMany({
    where: {
      isActive: true,
      OR: [
        { id: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
      ],
    },
    take: 20,
    orderBy: { id: "asc" },
  });

  return NextResponse.json({
    results: machines.map((m) => ({
      id: m.id,
      name: m.name ?? m.id,
    })),
  });
}
