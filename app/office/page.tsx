"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bot,
  ClipboardList,
  Download,
  FileSearch,
  Inbox,
  Search,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { OfficeShell } from "@/components/app-shell";
import { ComingSoonModule } from "@/components/coming-soon-module";
import { EmptyState } from "@/components/empty-state";
import { VisitStatusBadge } from "@/components/status-badge";
import { Button, Card, Input, SectionHeader } from "@/components/ui";

type VisitRow = {
  id: string;
  machineId: string;
  machine: { name: string | null };
  status: string;
  createdAt: string;
  agent?: { name: string | null };
  tasks: { id: string }[];
};

const PIPELINE_STATUSES = ["PENDING", "PROCESSING", "PROCESSED", "FAILED"] as const;

export default function OfficeInboxPage() {
  const { data: session } = useSession();
  const [visits, setVisits] = useState<VisitRow[]>([]);
  const [pipeline, setPipeline] = useState<Record<string, VisitRow[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const results = await Promise.all(
      PIPELINE_STATUSES.map(async (status) => {
        const r = await fetch(`/api/visits?status=${status}`);
        const d = await r.json();
        return { status, visits: (d.visits ?? []) as VisitRow[] };
      })
    );
    const map: Record<string, VisitRow[]> = {};
    for (const { status, visits: v } of results) {
      map[status] = v;
    }
    setPipeline(map);
    setVisits(map.PROCESSED ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const kpis = useMemo(() => {
    const processed = pipeline.PROCESSED ?? [];
    const openApprovals = processed.filter((v) => (v.tasks?.length ?? 0) > 0).length;
    return {
      openApprovals,
      pendingAi: (pipeline.PENDING?.length ?? 0) + (pipeline.PROCESSING?.length ?? 0),
      tasksCreated: processed.reduce((n, v) => n + (v.tasks?.length ?? 0), 0),
      completedToday: processed.filter((v) => {
        const d = new Date(v.createdAt);
        const today = new Date();
        return d.toDateString() === today.toDateString();
      }).length,
    };
  }, [pipeline]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return visits;
    return visits.filter(
      (v) =>
        v.machineId.toLowerCase().includes(q) ||
        (v.machine?.name ?? "").toLowerCase().includes(q)
    );
  }, [visits, search]);

  const approvalQueue = filtered.filter((v) => (v.tasks?.length ?? 0) > 0);
  const allPipeline = [
    ...(pipeline.PENDING ?? []),
    ...(pipeline.PROCESSING ?? []),
  ];

  return (
    <OfficeShell userName={session?.user?.name} activePath="/office">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-brand-600">ממשק משרד</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">לוח בקרה</h1>
          <p className="mt-2 text-slate-500">
            מעקב ביקורי שטח, אישור משימות ומודולים עתידיים של הפלטפורמה
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "ממתינים לאישור",
              value: kpis.openApprovals,
              icon: Inbox,
              accent: "text-amber-600 bg-amber-50",
            },
            {
              label: "בניתוח AI",
              value: kpis.pendingAi,
              icon: Sparkles,
              accent: "text-brand-600 bg-brand-50",
            },
            {
              label: "משימות פתוחות",
              value: kpis.tasksCreated,
              icon: ClipboardList,
              accent: "text-violet-600 bg-violet-50",
            },
            {
              label: "הושלמו היום",
              value: kpis.completedToday,
              icon: BarChart3,
              accent: "text-emerald-600 bg-emerald-50",
            },
          ].map((k) => (
            <Card key={k.label} className="flex items-start gap-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${k.accent}`}>
                <k.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{loading ? "—" : k.value}</p>
                <p className="text-sm text-slate-500">{k.label}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ComingSoonModule
            icon={Bot}
            title="ממצאי AI"
            description="סיכום אוטומטי של ליקויים מתמונות השטח"
          />
          <ComingSoonModule
            icon={Wrench}
            title="שיבוץ טכנאים"
            description="הקצאת משימות לצוותי תחזוקה ומיתוג"
          />
          <ComingSoonModule
            icon={FileSearch}
            title="היסטוריית מכונה"
            description="ציר זמן ביקורים ותיקונים לכל נקודת מכירה"
          />
          <ComingSoonModule
            icon={BarChart3}
            title="אנליטיקה"
            description="מגמות ליקויים, SLA ודוחות הנהלה"
          />
          <ComingSoonModule
            icon={Download}
            title="ייצוא דוחות"
            description="Excel ו-PDF לפי תקופה ואזור"
          />
          <ComingSoonModule
            icon={Users}
            title="ניהול סוכנים"
            description="ביצועי שטח ומסלולי ביקור"
          />
        </div>

        {!loading && allPipeline.length > 0 && (
          <Card className="mb-6">
            <SectionHeader
              title="צינור עיבוד"
              subtitle="ביקורים שטרם הגיעו לאישור במשרד"
            />
            <ul className="divide-y divide-slate-100">
              {allPipeline.slice(0, 5).map((v) => (
                <li key={v.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0">
                  <div>
                    <p className="font-semibold text-slate-900">{v.machineId}</p>
                    <p className="text-sm text-slate-500">{v.machine?.name}</p>
                  </div>
                  <VisitStatusBadge status={v.status} />
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card>
          <SectionHeader
            title="תיבת אישורים"
            subtitle="ביקורים מעובדים עם משימות ממתינות"
            action={
              <Link href="/office/tasks">
                <Button variant="outline" size="sm">
                  תור משימות
                </Button>
              </Link>
            }
          />

          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="ps-10"
                placeholder="חיפוש מכונה..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading && (
            <p className="py-12 text-center text-sm text-slate-500">טוען נתונים...</p>
          )}

          {!loading && approvalQueue.length === 0 && (
            <EmptyState
              icon={Inbox}
              title="אין ביקורים ממתינים לאישור"
              description="כאשר סוכני שטח יגישו ביקורים וה-AI יסיים לעבד אותם, הם יופיעו כאן עם משימות לאישור."
              action={{ label: "צפה בתור משימות", href: "/office/tasks" }}
            />
          )}

          {!loading && approvalQueue.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-start">
                    <th className="px-4 py-3 font-semibold text-slate-600">מכונה</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">סטטוס</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">משימות</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">תאריך</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {approvalQueue.map((v) => (
                    <tr
                      key={v.id}
                      className="border-b border-slate-50 transition hover:bg-slate-50/50"
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{v.machineId}</p>
                        <p className="text-slate-500">{v.machine?.name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <VisitStatusBadge status={v.status} />
                      </td>
                      <td className="px-4 py-3 font-medium text-amber-700">
                        {v.tasks?.length ?? 0} לאישור
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(v.createdAt).toLocaleString("he-IL", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-4 py-3 text-end">
                        <Link href={`/office/visits/${v.id}`}>
                          <Button size="sm">פתח</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </OfficeShell>
  );
}
