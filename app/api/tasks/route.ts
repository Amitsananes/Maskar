import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { Priority, TaskStatus, TeamType } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await requireSession(["OFFICE", "ADMIN"]);
  if (auth.error) return auth.error;

  const sp = req.nextUrl.searchParams;
  const status = (sp.get("status") as TaskStatus) || "APPROVED";
  const priority = sp.get("priority") as Priority | null;
  const team = sp.get("team") as TeamType | null;
  const machineId = sp.get("machineId")?.trim();
  const page = Math.max(1, Number(sp.get("page") ?? "1"));
  const pageSize = 25;

  const where = {
    status,
    ...(priority ? { priority } : {}),
    ...(machineId ? { machineId } : {}),
    ...(team ? { template: { team } } : {}),
  };

  const [tasks, total] = await Promise.all([
    prisma.workTask.findMany({
      where,
      include: {
        machine: true,
        template: true,
        visit: { select: { id: true, createdAt: true } },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.workTask.count({ where }),
  ]);

  return NextResponse.json({
    tasks: tasks.map((t) => ({
      id: t.id,
      machineId: t.machineId,
      machineName: t.machine.name,
      issueType: t.issueType,
      location: t.location,
      template: { id: t.template.id, name: t.template.name, team: t.template.team },
      priority: t.priority,
      reason: t.reason,
      status: t.status,
      visitId: t.visitId,
      completedAt: t.completedAt,
      completionNote: t.completionNote,
      createdAt: t.createdAt,
    })),
    page,
    total,
  });
}
