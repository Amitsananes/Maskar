"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Lightbulb,
  Loader2,
  Send,
} from "lucide-react";
import { AgentShell } from "@/components/app-shell";
import { ImageUploadZone } from "@/components/image-upload-zone";
import { MachineSearch, type MachineResult } from "@/components/machine-search";
import { Alert, Badge, Button, Card, SectionHeader } from "@/components/ui";

export default function SubmitPage() {
  const { data: session } = useSession();
  const [selected, setSelected] = useState<MachineResult | null>(null);
  const [front, setFront] = useState<File | null>(null);
  const [panel, setPanel] = useState<File | null>(null);
  const [side, setSide] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const stepMachine = !!selected;
  const stepPhotos = !!front && !!panel;
  const steps = [
    { label: "מכונה", done: stepMachine },
    { label: "תמונות", done: stepPhotos },
    { label: "שליחה", done: false },
  ];

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

    setMessage(data.message ?? "הביקור התקבל ונשלח לניתוח");
    setSelected(null);
    setFront(null);
    setPanel(null);
    setSide(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <AgentShell userName={session?.user?.name}>
      <div className="px-4 pb-28 pt-4">
        <div className="mb-6">
          <Badge variant="brand" className="mb-2">
            ביקור חדש
          </Badge>
          <h1 className="text-2xl font-bold text-slate-900">בדיקת שטח</h1>
          <p className="mt-1 text-sm text-slate-500">
            צלמו את המכונה, שלחו לניתוח — המשרד יקבל משימות לאחר עיבוד AI
          </p>
        </div>

        <div className="mb-6 flex items-center justify-between gap-2 rounded-2xl bg-white p-3 shadow-soft ring-1 ring-slate-200/60">
          {steps.map((s, i) => (
            <div key={s.label} className="flex flex-1 flex-col items-center gap-1">
              {s.done ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              ) : (
                <Circle className="h-6 w-6 text-slate-300" />
              )}
              <span
                className={`text-[10px] font-medium ${s.done ? "text-emerald-700" : "text-slate-400"}`}
              >
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <span className="absolute hidden" aria-hidden />
              )}
            </div>
          ))}
        </div>

        {message && (
          <Alert variant="success" className="mb-4">
            {message}
          </Alert>
        )}
        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <Card>
            <SectionHeader
              title="בחירת מכונה"
              subtitle="חפשו לפי מזהה או שם מיקום"
            />
            <MachineSearch selected={selected} onSelect={setSelected} />
          </Card>

          <Card>
            <SectionHeader
              title="תיעוד ויזואלי"
              subtitle="לפחות חזית ופאנל · צד אופציונלי"
            />
            <div className="space-y-5">
              <ImageUploadZone
                title="חזית המכונה"
                instruction="צלמו את החזית המלאה — גרפיקה, מסך ומצב כללי"
                required
                value={front}
                onChange={setFront}
                disabled={loading}
              />
              <ImageUploadZone
                title="פאנל בחירה"
                instruction="תמונה ברורה של לוח הבחירה והמחירים"
                required
                value={panel}
                onChange={setPanel}
                disabled={loading}
              />
              <ImageUploadZone
                title="צד / תוספת"
                instruction="רק אם יש ליקוי בצד או רוצים להדגיש פרט"
                value={side}
                onChange={setSide}
                disabled={loading}
              />
            </div>
          </Card>

          <Card className="border-brand-100 bg-brand-50/40">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                <Lightbulb className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">טיפים לצילום</p>
                <ul className="mt-2 space-y-1 text-xs text-slate-600">
                  <li>· תאורה טובה — הימנעו מצללים חזקים על הפאנל</li>
                  <li>· החזיקו את המכשיר יציב, במיוחד לתמונת הפאנל</li>
                  <li>· לאחר שליחה: סטטוס «ממתין ל-AI» יופיע במשרד</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="border-dashed opacity-80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">טיוטות וביקורים אחרונים</p>
                <p className="text-xs text-slate-400">שמירת טיוטה — בקרוב</p>
              </div>
              <Badge variant="muted">בקרוב</Badge>
            </div>
          </Card>

          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200/80 bg-white/95 p-4 backdrop-blur-md sm:static sm:border-0 sm:bg-transparent sm:p-0">
            <Button
              type="submit"
              className="w-full shadow-card"
              size="lg"
              disabled={loading || !stepMachine || !stepPhotos}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  שולח ביקור...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  שלח ביקור לעיבוד
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
          <ClipboardCheck className="h-4 w-4" />
          <span>העלאה מאובטחת · עד 10MB לתמונה</span>
        </div>
      </div>
    </AgentShell>
  );
}
