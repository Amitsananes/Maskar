import { Worker } from "bullmq";
import { prisma } from "../lib/prisma";
import { redisConnection } from "../lib/queue";
import { analyzeVisit } from "./vision";
import { createWorkTasks } from "./rules";

const worker = new Worker(
  "visit-processing",
  async (job) => {
    const { visitId } = job.data as { visitId: string };
    console.log("[worker] processing visit", visitId);

    await prisma.visit.update({
      where: { id: visitId },
      data: { status: "PROCESSING" },
    });

    try {
      const visit = await prisma.visit.findUnique({
        where: { id: visitId },
        include: { images: true },
      });

      if (!visit) {
        throw new Error(`Visit not found: ${visitId}`);
      }

      const front = visit.images.find((i) => i.angle === "FRONT");
      const panel = visit.images.find((i) => i.angle === "PANEL");
      if (!front || !panel) {
        throw new Error(`Missing required images for visit ${visitId}`);
      }

      const side = visit.images.find((i) => i.angle === "SIDE");
      const aiOutput = await analyzeVisit(
        {
          front: front.url,
          panel: panel.url,
          side: side?.url,
        },
        visit.machineId
      );

      await prisma.visit.update({
        where: { id: visitId },
        data: {
          aiRawOutput: aiOutput as object,
          processedAt: new Date(),
        },
      });

      await createWorkTasks(visitId, visit.machineId, aiOutput);

      await prisma.visit.update({
        where: { id: visitId },
        data: { status: "PROCESSED" },
      });

      console.log("[worker] visit processed", visitId);
    } catch (err) {
      console.error("[worker] visit failed", visitId, err);
      await prisma.visit.update({
        where: { id: visitId },
        data: { status: "FAILED" },
      });
      throw err;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

worker.on("failed", (job, err) => {
  console.error("[worker] job failed", job?.id, err);
});

console.log("[worker] visit-processing worker started");

process.on("SIGTERM", async () => {
  await worker.close();
  process.exit(0);
});
