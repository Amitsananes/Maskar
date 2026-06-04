"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button, Card, Input, Label } from "@/components/ui";

type Task = {
  id: string;
  issueType: string;
  location: string | null;
  template: { id: string; name: string; team: string };
  priority: string;
  reason: string;
  status: string;
};

type VisitDetail = {
  id: string;
  machineId: string;
  machine: { name: string | null };
  status: string;
  images: { angle: string; url: string }[];
  tasks: Task[];
};

export default function VisitApprovalPage() {
  const params = useParams();
  const id = params.id as string;
  const [visit, setVisit] = useState<VisitDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/visits/${id}`)
      .then((r) => r.json())
      .then(setVisit)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function patchTask(taskId: string, status: "APPROVED" | "REJECTED") {
    setBusy(taskId);
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, officeNote: note || undefined }),
    });
    setBusy(null);
    load();
  }

  async function approveAll() {
    setBusy("all");
    await fetch("/api/tasks/approve-all", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitId: id }),
    });
    setBusy(null);
    load();
  }

  if (loading) return <main className="p-6">טוען...</main>;
  if (!visit) return <main className="p-6">ביקור לא נמצא</main>;

  const pending = visit.tasks.filter((t) => t.status === "PENDING_APPROVAL");

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-4">
        <Link href="/office" className="text-sm text-blue-600 hover:underline">
          ← חזרה לתיבה
        </Link>
      </div>

      <h1 className="mb-2 text-2xl font-bold">
        {visit.machineId} — {visit.machine?.name}
      </h1>
      <p className="mb-6 text-sm text-slate-600">סטטוס: {visit.status}</p>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visit.images.map((img) => (
          <Card key={img.angle}>
            <p className="mb-2 text-sm font-medium">{img.angle}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.angle} className="w-full rounded-lg object-cover" />
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <Label>הערת משרד (אופציונלי)</Label>
        <Input value={note} onChange={(e) => setNote(e.target.value)} />
        {pending.length > 0 && (
          <Button className="mt-3" onClick={approveAll} disabled={busy === "all"}>
            אישור הכל ({pending.length})
          </Button>
        )}
      </Card>

      <h2 className="mb-3 text-lg font-semibold">משימות שזוהו</h2>

      {visit.tasks.length === 0 && (
        <Card>
          <p className="text-slate-600">לא זוהו משימות בביקור זה</p>
        </Card>
      )}

      <ul className="space-y-4">
        {visit.tasks.map((t) => (
          <li key={t.id}>
            <Card>
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="font-medium">{t.template.name}</p>
                  <p className="text-sm text-slate-600">
                    {t.issueType} · {t.location ?? "—"} · {t.template.team}
                  </p>
                  <p className="mt-1 text-sm">עדיפות: {t.priority}</p>
                  <p className="mt-2">{t.reason}</p>
                  <p className="mt-1 text-xs text-slate-500">סטטוס: {t.status}</p>
                </div>
                {t.status === "PENDING_APPROVAL" && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => patchTask(t.id, "APPROVED")}
                      disabled={!!busy}
                    >
                      אישור
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => patchTask(t.id, "REJECTED")}
                      disabled={!!busy}
                    >
                      דחייה
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </main>
  );
}
