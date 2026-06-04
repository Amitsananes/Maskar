"use client";

import { signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { Button, Card, Input, Label } from "@/components/ui";

type MachineResult = { id: string; name: string };

export default function SubmitPage() {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MachineResult[]>([]);
  const [selected, setSelected] = useState<MachineResult | null>(null);
  const [front, setFront] = useState<File | null>(null);
  const [panel, setPanel] = useState<File | null>(null);
  const [side, setSide] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const search = useCallback(async (q: string) => {
    if (q.length < 1) {
      setResults([]);
      return;
    }
    const res = await fetch(`/api/machines/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setResults(data.results ?? []);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 250);
    return () => clearTimeout(t);
  }, [query, search]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !front || !panel) {
      setError("נא לבחור מכונה ולהעלות תמונות חזית ופאנל");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");

    const form = new FormData();
    form.append("machine_id", selected.id);
    form.append("front", front);
    form.append("panel", panel);
    if (side) form.append("side", side);

    const res = await fetch("/api/visits", { method: "POST", body: form });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      if (data.error === "DUPLICATE_VISIT") {
        setError("כבר הוגש ביקור למכונה זו היום");
      } else {
        setError(data.error ?? "שגיאה בהגשה");
      }
      return;
    }

    setMessage(data.message ?? "הביקור התקבל");
    setSelected(null);
    setQuery("");
    setFront(null);
    setPanel(null);
    setSide(null);
  }

  return (
    <main className="mx-auto max-w-lg p-4 pb-24">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">הגשת ביקור</h1>
          <p className="text-sm text-slate-600">{session?.user?.name}</p>
        </div>
        <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/login" })}>
          יציאה
        </Button>
      </header>

      <form onSubmit={onSubmit} className="space-y-4">
        <Card>
          <Label>חיפוש מכונה</Label>
          <Input
            placeholder="מזהה או שם מיקום"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(null);
            }}
          />
          {results.length > 0 && !selected && (
            <ul className="mt-2 max-h-40 overflow-auto rounded-lg border">
              {results.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-right text-sm hover:bg-slate-100"
                    onClick={() => {
                      setSelected(m);
                      setQuery(`${m.id} — ${m.name}`);
                      setResults([]);
                    }}
                  >
                    <span className="font-medium">{m.id}</span>
                    <span className="text-slate-600"> — {m.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {selected && (
            <p className="mt-2 text-sm text-green-700">נבחר: {selected.id}</p>
          )}
        </Card>

        <Card>
          <Label>תמונת חזית (חובה)</Label>
          <Input
            type="file"
            accept="image/jpeg,image/webp,image/png"
            capture="environment"
            onChange={(e) => setFront(e.target.files?.[0] ?? null)}
          />
        </Card>

        <Card>
          <Label>תמונת פאנל (חובה)</Label>
          <Input
            type="file"
            accept="image/jpeg,image/webp,image/png"
            capture="environment"
            onChange={(e) => setPanel(e.target.files?.[0] ?? null)}
          />
        </Card>

        <Card>
          <Label>תמונת צד (אופציונלי)</Label>
          <p className="mb-2 text-xs text-slate-500">יש בעיה בצד? הוסף תמונה</p>
          <Input
            type="file"
            accept="image/jpeg,image/webp,image/png"
            capture="environment"
            onChange={(e) => setSide(e.target.files?.[0] ?? null)}
          />
        </Card>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-700">{message}</p>}

        <Button type="submit" className="w-full py-3 text-base" disabled={loading}>
          {loading ? "שולח..." : "הגש ביקור"}
        </Button>
      </form>
    </main>
  );
}
