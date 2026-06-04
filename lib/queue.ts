import { Queue } from "bullmq";

export const redisConnection = {
  url: process.env.REDIS_URL!,
  maxRetriesPerRequest: null as null,
};

export const visitQueue = new Queue("visit-processing", {
  connection: redisConnection,
});

export async function enqueueVisitProcessing(visitId: string) {
  await visitQueue.add(
    "process-visit",
    { visitId },
    {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
    }
  );
}
