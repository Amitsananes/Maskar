"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button, Card } from "@/components/ui";

type VisitRow = {
  id: string;
  machineId: string;
  machine: { name: string | null };
  status: string;
  createdAt: string;
  tasks: { id: string }[];
};

export default function OfficeInboxPage() {
  const { data: session } = useSession();
  const [visits, setVisits] = useState<VisitRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/visits?status=PROCESSED")
      .then((r) => r.json())
      .then((d) => setVisits(d.visits ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">תיבת אישורים</h1>
          <p className="text-sm text-slate-600">{session?.user?.name}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/office/tasks">
            <Button variant="outline">תור משימות</Button>
          </Link>
          <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/login" })}>
            יציאה
          </Button>
        </div>
      </header>

      {loading && <p className="text-slate-600">טוען...</p>}

      {!loading && visits.length === 0 && (
        <Card>
          <p className="text-center text-slate-600">אין ביקורים ממתינים לאישור</p>
        </Card>
      )}

      <ul className="space-y-3">
        {visits.map((v) => {
          const pending = v.tasks?.length ?? 0;
          if (pending === 0) return null;
          return (
            <li key={v.id}>
              <Link href={`/office/visits/${v.id}`}>
                <Card className="transition hover:border-blue-300">
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="font-semibold">{v.machineId}</p>
                      <p className="text-sm text-slate-600">{v.machine?.name}</p>
                    </div>
                    <div className="text-left text-sm">
                      <p>{pending} משימות לאישור</p>
                      <p className="text-slate-500">
                        {new Date(v.createdAt).toLocaleString("he-IL")}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
