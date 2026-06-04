import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  visitId: z.string(),
});

export async function POST(req: NextRequest) {
  const auth = await requireSession(["OFFICE", "ADMIN"]);
  if (auth.error) return auth.error;

  const body = schema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const now = new Date();
  const result = await prisma.workTask.updateMany({
    where: {
      visitId: body.data.visitId,
      status: "PENDING_APPROVAL",
    },
    data: { status: "APPROVED", decidedAt: now },
  });

  await logAudit({
    userId: auth.session!.user.id,
    action: "TASKS_APPROVE_ALL",
    entityType: "Visit",
    entityId: body.data.visitId,
    metadata: { count: result.count },
  });

  return NextResponse.json({ approved: result.count });
}
