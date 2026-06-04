import { Badge } from "@/components/ui";

const STATUS_MAP: Record<
  string,
  { label: string; variant: "default" | "success" | "warning" | "danger" | "brand" | "muted" }
> = {
  PENDING: { label: "ממתין לעיבוד", variant: "warning" },
  PROCESSING: { label: "בניתוח AI", variant: "brand" },
  PROCESSED: { label: "מעובד", variant: "success" },
  FAILED: { label: "נכשל", variant: "danger" },
  PENDING_APPROVAL: { label: "ממתין לאישור", variant: "warning" },
};

export function VisitStatusBadge({ status }: { status: string }) {
  const cfg = STATUS_MAP[status] ?? { label: status, variant: "default" as const };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
