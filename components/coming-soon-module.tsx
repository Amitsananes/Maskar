import { LucideIcon, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui";

export function ComingSoonModule({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border border-slate-200/80 bg-white p-4 opacity-90",
        className
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
          <Icon className="h-5 w-5 text-slate-400" />
        </div>
        <Badge variant="muted" className="gap-1">
          <Lock className="h-3 w-3" />
          בקרוב
        </Badge>
      </div>
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}
