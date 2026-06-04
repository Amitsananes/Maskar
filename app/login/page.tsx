"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ScanEye, Shield, Sparkles } from "lucide-react";
import { Alert, Button, Card, Input, Label } from "@/components/ui";

const DEMO_USERS = [
  { role: "סוכן שטח", email: "agent@maskar.local" },
  { role: "משרד", email: "office@maskar.local" },
  { role: "מנהל", email: "admin@maskar.local" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("אימייל או סיסמה שגויים");
      return;
    }
    router.push("/");
    router.refresh();
  }

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword("password123");
    setError("");
  }

  return (
    <main className="min-h-screen fv-gradient-bg lg:grid lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-brand-800 p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0%,transparent_50%)]" />
        <div className="relative">
          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <ScanEye className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Field Vision</h1>
          <p className="mt-3 max-w-md text-lg text-brand-100">
            פלטפורמת ביקורי שטח חכמה למכונות אוטומט — צילום, ניתוח AI ותור עבודה למשרד.
          </p>
        </div>
        <ul className="relative space-y-4 text-sm text-brand-100">
          <li className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 shrink-0 text-brand-200" />
            ניתוח תמונות בינה מלאכותית בשטח
          </li>
          <li className="flex items-center gap-3">
            <Shield className="h-5 w-5 shrink-0 text-brand-200" />
            אבטחה ברמת ארגון ותמיכה ב-RTL
          </li>
        </ul>
      </section>

      <section className="flex flex-col justify-center px-6 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600">
              <ScanEye className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Field Vision</h1>
            <p className="mt-1 text-sm text-slate-500">התחברות למערכת ביקורי שטח</p>
          </div>

          <Card padding="lg" className="shadow-card">
            <h2 className="text-xl font-bold text-slate-900">ברוכים השבים</h2>
            <p className="mt-1 text-sm text-slate-500">הזינו פרטי התחברות לחשבון הארגוני שלכם</p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <Label hint="כתובת האימייל שסופקה על ידי המנהל">אימייל</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="name@maskar.local"
                />
              </div>
              <div>
                <Label>סיסמה</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </div>
              {error && <Alert variant="error">{error}</Alert>}
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "מתחבר..." : "התחבר למערכת"}
              </Button>
            </form>
          </Card>

          <Card className="mt-4 border-dashed bg-slate-50/80" padding="default">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              חשבונות הדגמה
            </p>
            <p className="mt-1 text-xs text-slate-500">סיסמה לכל החשבונות: password123</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => fillDemo(u.email)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                >
                  {u.role}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
