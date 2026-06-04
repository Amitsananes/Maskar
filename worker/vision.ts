import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { imageUrlToVisionBlock } from "../lib/image-for-vision";

const SYSTEM_PROMPT = `You are a vending machine field inspection AI.
You receive 2–3 photos of a vending machine.
Photo 1: front face. Photo 2: selection panel. Photo 3 (optional): side.

Your job: identify visible physical problems.
Return ONLY valid JSON. No markdown, no backticks, no text outside JSON.

Rules:
- Use EXACT IssueType values listed below.
- "location" must be one of: "FRONT" | "SIDE" | "PANEL"
- "reason" must be in Hebrew.
- Prefer false negative over false positive.
- Do not report the same problem twice under different angles.
- If no issues visible: return { "issues": [] }

IssueType values:
DAMAGED_BRANDING | RUST | DAMAGED_PANEL | MISSING_PRICE_LABEL |
MISSING_PRODUCT_LABEL | DIRTY | BROKEN_GLASS | SCREEN_OFF |
DOOR_OPEN | VANDALISM | GENERAL_ISSUE

Priority: HIGH | MEDIUM | LOW
  HIGH   = significant damage, heavily compromised
  MEDIUM = noticeable, should be addressed
  LOW    = minor cosmetic

Output schema:
{
  "issues": [
    {
      "issueType": "DAMAGED_BRANDING",
      "location": "FRONT",
      "priority": "HIGH",
      "reason": "גרפיקת החזית קרועה בצורה משמעותית"
    }
  ]
}`;

export const aiIssueSchema = z.object({
  issueType: z.string(),
  location: z.enum(["FRONT", "SIDE", "PANEL"]).optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  reason: z.string(),
});

export const aiOutputSchema = z.object({
  issues: z.array(aiIssueSchema).default([]),
});

export type AIIssue = z.infer<typeof aiIssueSchema>;
export type AIOutput = z.infer<typeof aiOutputSchema>;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  timeout: 30_000,
});

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error(`AI_JSON_ERROR: ${text.slice(0, 300)}`);
  }
}

export async function analyzeVisit(
  images: { front: string; panel: string; side?: string },
  machineId: string
): Promise<AIOutput> {
  const content: Anthropic.Messages.ContentBlockParam[] = [
    await imageUrlToVisionBlock(images.front),
    await imageUrlToVisionBlock(images.panel),
  ];
  if (images.side) {
    content.push(await imageUrlToVisionBlock(images.side));
  }
  content.push({
    type: "text",
    text: `Inspect machine ${machineId}. Photos: front, panel${images.side ? ", side" : ""}.`,
  });

  const res = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content }],
  });

  const text = res.content.find((b) => b.type === "text")?.text ?? "";
  const parsed = extractJson(text);
  const result = aiOutputSchema.safeParse(parsed);
  if (!result.success) {
    console.error("[vision] parse validation failed", result.error.flatten());
    return { issues: [] };
  }
  return result.data;
}
