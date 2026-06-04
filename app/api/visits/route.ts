import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { uploadVisitImage } from "@/lib/storage";
import { enqueueVisitProcessing } from "@/lib/queue";
import { hasDuplicateVisitToday } from "@/lib/visits";
import { logAudit } from "@/lib/audit";
import { ImageAngle } from "@prisma/client";

const MAX_BYTES = 10 * 1024 * 1024;

export async function GET(req: NextRequest) {
  const auth = await requireSession(["OFFICE", "ADMIN"]);
  if (auth.error) return auth.error;

  const status = req.nextUrl.searchParams.get("status") ?? "PROCESSED";

  const visits = await prisma.visit.findMany({
    where: { status: status as "PROCESSED" },
    include: {
      machine: true,
      agent: { select: { name: true } },
      tasks: { where: { status: "PENDING_APPROVAL" } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ visits });
}

export async function POST(req: NextRequest) {
  const auth = await requireSession(["AGENT", "ADMIN"]);
  if (auth.error) return auth.error;

  const form = await req.formData();
  const machineId = String(form.get("machine_id") ?? "").trim();
  const frontFile = form.get("front");
  const panelFile = form.get("panel");
  const sideFile = form.get("side");

  if (!machineId) {
    return NextResponse.json({ error: "MISSING_MACHINE" }, { status: 400 });
  }

  const machine = await prisma.machine.findFirst({
    where: { id: machineId, isActive: true },
  });
  if (!machine) {
    return NextResponse.json({ error: "MACHINE_NOT_FOUND" }, { status: 404 });
  }

  if (!(frontFile instanceof File) || !(panelFile instanceof File)) {
    return NextResponse.json({ error: "MISSING_IMAGES" }, { status: 400 });
  }

  for (const f of [frontFile, panelFile, sideFile instanceof File ? sideFile : null]) {
    if (!f) continue;
    if (f.size > MAX_BYTES) {
      return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 400 });
    }
  }

  if (await hasDuplicateVisitToday(machineId)) {
    return NextResponse.json({ error: "DUPLICATE_VISIT" }, { status: 409 });
  }

  const visit = await prisma.visit.create({
    data: {
      machineId,
      agentId: auth.session!.user.id,
      status: "PENDING",
    },
  });

  try {
    const uploads: { angle: ImageAngle; file: File }[] = [
      { angle: "FRONT", file: frontFile },
      { angle: "PANEL", file: panelFile },
    ];
    if (sideFile instanceof File && sideFile.size > 0) {
      uploads.push({ angle: "SIDE", file: sideFile });
    }

    for (const { angle, file } of uploads) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const { url, publicId } = await uploadVisitImage(
        buffer,
        `visits/${visit.id}`,
        `${visit.id}_${angle.toLowerCase()}`,
        file.type || "image/jpeg"
      );
      await prisma.image.create({
        data: {
          visitId: visit.id,
          angle,
          url,
          cloudinaryId: publicId,
        },
      });
    }

    await enqueueVisitProcessing(visit.id);

    await logAudit({
      userId: auth.session!.user.id,
      action: "VISIT_SUBMITTED",
      entityType: "Visit",
      entityId: visit.id,
      metadata: { machineId },
    });

    return NextResponse.json(
      {
        visit_id: visit.id,
        status: "pending",
        message: "הביקור התקבל ונמצא בעיבוד",
      },
      { status: 202 }
    );
  } catch (err) {
    console.error("[visits] submit failed", err);
    await prisma.visit.update({
      where: { id: visit.id },
      data: { status: "FAILED" },
    });
    return NextResponse.json({ error: "UPLOAD_FAILED" }, { status: 500 });
  }
}
