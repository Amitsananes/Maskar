import { Priority, IssueType } from "@prisma/client";
import { prisma } from "../lib/prisma";
import type { AIOutput } from "./vision";

const VALID_ISSUES = new Set([
  "DAMAGED_BRANDING",
  "RUST",
  "DAMAGED_PANEL",
  "MISSING_PRICE_LABEL",
  "MISSING_PRODUCT_LABEL",
  "DIRTY",
  "BROKEN_GLASS",
  "SCREEN_OFF",
  "DOOR_OPEN",
  "VANDALISM",
  "GENERAL_ISSUE",
]);

const rank = (p: string) => ({ LOW: 1, MEDIUM: 2, HIGH: 3 }[p] ?? 0);

function toIssueType(value: string): IssueType | null {
  if (!VALID_ISSUES.has(value)) return null;
  return value as IssueType;
}

function toPriority(value: string): Priority {
  if (value === "HIGH" || value === "MEDIUM" || value === "LOW") return value;
  return Priority.MEDIUM;
}

export async function createWorkTasks(
  visitId: string,
  machineId: string,
  aiOutput: AIOutput
) {
  if (!aiOutput?.issues?.length) return;

  for (const issue of aiOutput.issues) {
    const issueType = toIssueType(issue.issueType);
    if (!issueType) {
      console.warn("[rules] unknown issueType", issue.issueType);
      continue;
    }

    const location = issue.location ?? null;

    const mapping = await prisma.issueTemplateMapping.findFirst({
      where: {
        issueType,
        OR: [{ location }, { location: null }],
      },
      orderBy: { location: "desc" },
      include: { template: true },
    });

    if (!mapping || !mapping.template.isActive) {
      console.warn("[rules] no mapping", issueType, location);
      continue;
    }

    const existing = await prisma.workTask.findFirst({
      where: {
        machineId,
        templateId: mapping.templateId,
        status: { in: ["PENDING_APPROVAL", "APPROVED"] },
      },
    });

    const priority = toPriority(issue.priority);

    if (existing) {
      if (rank(issue.priority) > rank(existing.priority)) {
        await prisma.workTask.update({
          where: { id: existing.id },
          data: { priority },
        });
      }
      continue;
    }

    await prisma.workTask.create({
      data: {
        machineId,
        visitId,
        issueType,
        location,
        templateId: mapping.templateId,
        priority,
        reason: issue.reason,
        status: "PENDING_APPROVAL",
      },
    });
  }
}
