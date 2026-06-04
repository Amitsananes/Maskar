"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { OfficeShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { Button, Card, Input, Label, SectionHeader, Select } from "@/components/ui";

type TaskRow = {
  id: string;
  machineId: string;
  machineName: string | null;
  issueType: string;
  location: string | null;
  template: { name: string; team: string };
  priority: string;
  reason: string;
  status: string;
};

const TEAMS = ["", "BRANDING", "MAINTENANCE", "CLEANING", "TECHNICIAN", "GENERAL"];
const PRIORITIES = ["", "HIGH", "MEDIUM", "LOW"];
const STATUSES = ["APPROVED", "DONE"];

export default function WorkQueuePage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState("");
  const [priority, setPriority] = useState("");
  const [machineId, setMachineId] = useState("");
  const [status, setStatus] = useState("APPROVED");
  const [notes, setNotes] = useState<Record<string, string>>({});

  function load() {
    setLoading(true);
    const params = new URLSearchParams({ status });
    if (team) params.set("team", team);
    if (priority) params.set("priority", priority);
    if (machineId) params.set("machineId", machineId);
    fetch(`/api/tasks?${params}`)
      .then((r) => r.json())
      .then((d) => setTasks(d.tasks ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team, priority, machineId, status]);

  async function markDone(taskId: string) {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "DONE",
        completionNote: notes[taskId] || undefined,
      }),
    });
    load();
  }

  return (
    <OfficeShell userName={session?.user?.name} activePath="/office/tasks">
      <div className="mx-auto max-w-4xl">
        <SectionHeader
          title="תור משימות"
          subtitle="משימות שאושרו וממתינות לביצוע בשטח"
          action={
            <Link href="/office">
              <Button variant="outline" size="sm">
                לוח בקרה
              </Button>
            </Link>
          }
        />

        <Card className="mb-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label>צוות</Label>
              <Select value={team} onChange={(e) => setTeam(e.target.value)}>
                {TEAMS.map((t) => (
                  <option key={t || "all"} value={t}>
                    {t || "הכל"}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>עדיפות</Label>
              <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
                {PRIORITIES.map((p) => (
                  <option key={p || "all"} value={p}>
                    {p || "הכל"}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>מכונה</Label>
              <Input
                placeholder="VM-145"
                value={machineId}
                onChange={(e) => setMachineId(e.target.value)}
              />
            </div>
            <div>
              <Label>סטטוס</Label>
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s === "APPROVED" ? "מאושר" : "הושלם"}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </Card>

        {loading && <p className="text-center text-slate-500">טוען...</p>}
        {!loading && tasks.length === 0 && (
          <EmptyState
            icon={ClipboardList}
            title="אין משימות בתור"
            description="לאחר אישור משימות מביקורים, הן יופיעו כאן לפי הסינון שבחרתם."
            action={{ label: "חזרה ללוח בקרה", href: "/office" }}
          />
        )}

        <ul className="space-y-4">
          {tasks.map((t) => (
            <li key={t.id}>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {t.machineId} — {t.machineName}
                    </p>
                    <p className="text-sm text-slate-500">
                      {t.template.name} · {t.template.team} · {t.priority}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">{t.reason}</p>
                {t.status === "APPROVED" && (
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <Input
                      placeholder="הערת סיום"
                      value={notes[t.id] ?? ""}
                      onChange={(e) =>
                        setNotes((n) => ({ ...n, [t.id]: e.target.value }))
                      }
                    />
                    <Button onClick={() => markDone(t.id)}>סמן כבוצע</Button>
                  </div>
                )}
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </OfficeShell>
  );
}
