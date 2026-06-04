import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "destructive" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}) {
  const variants = {
    default:
      "bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800",
    secondary: "bg-brand-50 text-brand-700 hover:bg-brand-100",
    outline:
      "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  };
  const sizes = {
    default: "h-10 px-4 py-2 text-sm",
    sm: "h-8 px-3 text-xs",
    lg: "h-12 px-6 text-base",
    icon: "h-10 w-10 p-0",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

export function Card({
  className,
  children,
  padding = "default",
}: {
  className?: string;
  children: React.ReactNode;
  padding?: "none" | "default" | "lg";
}) {
  const pad = { none: "", default: "p-4 sm:p-5", lg: "p-5 sm:p-6" };
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white shadow-soft",
        pad[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20",
        props.className
      )}
      {...props}
    />
  );
}

export function Label({
  children,
  className,
  hint,
}: {
  children: React.ReactNode;
  className?: string;
  hint?: string;
}) {
  return (
    <div className={cn("mb-2", className)}>
      <label className="block text-sm font-semibold text-slate-800">{children}</label>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20",
        props.className
      )}
      {...props}
    />
  );
}

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "muted" | "brand";
  className?: string;
}) {
  const variants = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60",
    warning: "bg-amber-50 text-amber-800 ring-1 ring-amber-200/60",
    danger: "bg-red-50 text-red-700 ring-1 ring-red-200/60",
    muted: "bg-slate-50 text-slate-500",
    brand: "bg-brand-50 text-brand-700 ring-1 ring-brand-200/60",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Alert({
  variant = "info",
  children,
  className,
}: {
  variant?: "info" | "success" | "error";
  children: React.ReactNode;
  className?: string;
}) {
  const styles = {
    info: "border-brand-200 bg-brand-50 text-brand-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-red-200 bg-red-50 text-red-800",
  };
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm font-medium",
        styles[variant],
        className
      )}
      role="alert"
    >
      {children}
    </div>
  );
}
