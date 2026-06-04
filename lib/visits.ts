import { prisma } from "@/lib/prisma";

export async function hasDuplicateVisitToday(machineId: string): Promise<boolean> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const existing = await prisma.visit.findFirst({
    where: {
      machineId,
      createdAt: { gte: start, lte: end },
      status: { not: "FAILED" },
    },
  });

  return Boolean(existing);
}
