import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireSession(["OFFICE", "ADMIN"]);
  if (auth.error) return auth.error;

  const visit = await prisma.visit.findUnique({
    where: { id: params.id },
    include: {
      machine: true,
      images: true,
      tasks: {
        include: { template: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!visit) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({
    id: visit.id,
    machineId: visit.machineId,
    machine: { name: visit.machine.name },
    status: visit.status,
    images: visit.images.map((i) => ({ angle: i.angle, url: i.url })),
    tasks: visit.tasks.map((t) => ({
      id: t.id,
      issueType: t.issueType,
      location: t.location,
      template: {
        id: t.template.id,
        name: t.template.name,
        team: t.template.team,
      },
      priority: t.priority,
      reason: t.reason,
      status: t.status,
    })),
  });
}
