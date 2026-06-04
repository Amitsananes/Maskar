"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Card, Input, Label, Select } from "@/components/ui";

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
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">תור משימות</h1>
        <Link href="/office">
          <Button variant="outline">תיבת אישורים</Button>
        </Link>
      </div>

      <Card className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
      </Card>

      {loading && <p>טוען...</p>}
      {!loading && tasks.length === 0 && (
        <Card>
          <p className="text-center text-slate-600">אין משימות בתור</p>
        </Card>
      )}

      <ul className="space-y-4">
        {tasks.map((t) => (
          <li key={t.id}>
            <Card>
              <p className="font-semibold">
                {t.machineId} — {t.machineName}
              </p>
              <p className="text-sm text-slate-600">
                {t.template.name} · {t.template.team} · {t.priority}
              </p>
              <p className="mt-2 text-sm">{t.reason}</p>
              {t.status === "APPROVED" && (
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
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
    </main>
  );
}
