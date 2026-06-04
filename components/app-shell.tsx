"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  ScanEye,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";

export function ProductLogo({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 shadow-sm">
        <ScanEye className="h-5 w-5 text-white" />
      </div>
      {!compact && (
        <div>
          <p className="text-sm font-bold leading-tight text-slate-900">Field Vision</p>
          <p className="text-[10px] font-medium text-slate-500">Maskar · ביקורי שטח</p>
        </div>
      )}
    </div>
  );
}

export function AgentShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName?: string | null;
}) {
  return (
    <div className="min-h-screen fv-gradient-bg">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <ProductLogo compact />
          <div className="flex items-center gap-2">
            {userName && (
              <span className="hidden text-xs text-slate-500 sm:inline">{userName}</span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="gap-1.5"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">יציאה</span>
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-lg">{children}</div>
    </div>
  );
}

const OFFICE_NAV = [
  { href: "/office", label: "לוח בקרה", icon: LayoutDashboard },
  { href: "/office/tasks", label: "תור משימות", icon: ClipboardList },
];

export function OfficeShell({
  children,
  userName,
  activePath,
}: {
  children: React.ReactNode;
  userName?: string | null;
  activePath: string;
}) {
  return (
    <div className="min-h-screen bg-slate-100/80 lg:flex">
      <aside className="hidden w-64 shrink-0 border-e border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="border-b border-slate-100 p-5">
          <ProductLogo />
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {OFFICE_NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                activePath === href || (href !== "/office" && activePath.startsWith(href))
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
          <div className="mt-6 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            בקרוב
          </div>
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400">
            <Settings className="h-5 w-5" />
            הגדרות ודוחות
          </div>
        </nav>
        <div className="border-t border-slate-100 p-4">
          <p className="truncate text-xs text-slate-500">{userName}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-start gap-2"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4" />
            יציאה
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md lg:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <ProductLogo compact />
            <div className="flex gap-2">
              {OFFICE_NAV.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium",
                    activePath.startsWith(href) ? "bg-brand-50 text-brand-700" : "text-slate-600"
                  )}
                >
                  {label}
                </Link>
              ))}
              <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: "/login" })}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
