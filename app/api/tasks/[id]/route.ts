import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";

const patchSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "DONE"]),
  officeNote: z.string().optional(),
  completionNote: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireSession(["OFFICE", "ADMIN"]);
  if (auth.error) return auth.error;

  const body = patchSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const task = await prisma.workTask.findUnique({ where: { id: params.id } });
  if (!task) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const { status, officeNote, completionNote } = body.data;
  const now = new Date();

  const data =
    status === "DONE"
      ? {
          status: "DONE" as const,
          completedAt: now,
          completionNote: completionNote ?? task.completionNote,
        }
      : {
          status,
          officeNote: officeNote ?? task.officeNote,
          decidedAt: now,
        };

  const updated = await prisma.workTask.update({
    where: { id: params.id },
    data,
    include: { template: true, machine: true },
  });

  await logAudit({
    userId: auth.session!.user.id,
    action: `TASK_${status}`,
    entityType: "WorkTask",
    entityId: updated.id,
    metadata: { officeNote, completionNote },
  });

  return NextResponse.json({ task: updated });
}
