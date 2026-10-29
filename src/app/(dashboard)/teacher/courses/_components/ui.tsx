"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen, CheckCircle2, Clock, Eye, EyeOff, Loader2, Star,
  Users, X, type LucideIcon,
} from "lucide-react";

const STATUS_META: Record<string, { label: string; className: string; icon: LucideIcon }> = {
  published: {
    label: "Published",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
    icon: CheckCircle2,
  },
  draft: {
    label: "Draft",
    className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
    icon: Clock,
  },
  archived: {
    label: "Archived",
    className: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    icon: EyeOff,
  },
  under_review: {
    label: "Under Review",
    className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
    icon: Eye,
  },
};

export function CourseStatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] || STATUS_META.draft;
  const Icon = meta.icon;
  return (
    <Badge variant="outline" className={cn("gap-1 rounded-full border font-medium", meta.className)}>
      <Icon className="h-3 w-3" />
      {meta.label}
    </Badge>
  );
}

export function StatCard({
  label, value, icon: Icon, color = "indigo", hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: "indigo" | "emerald" | "amber" | "rose" | "blue" | "violet";
  hint?: string;
}) {
  const colorMap = {
    indigo: "from-indigo-500/10 to-indigo-500/5 text-indigo-600 dark:text-indigo-400",
    emerald: "from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
    amber: "from-amber-500/10 to-amber-500/5 text-amber-600 dark:text-amber-400",
    rose: "from-rose-500/10 to-rose-500/5 text-rose-600 dark:text-rose-400",
    blue: "from-blue-500/10 to-blue-500/5 text-blue-600 dark:text-blue-400",
    violet: "from-violet-500/10 to-violet-500/5 text-violet-600 dark:text-violet-400",
  } as const;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-100", colorMap[color])} />
      <div className="relative">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br", colorMap[color])}>
          <Icon className="h-5 w-5" />
        </div>
        <p className="mt-4 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
        {hint && <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>}
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon = BookOpen, title, description, action,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href?: string; onClick?: () => void; icon?: LucideIcon };
}) {
  const ActionIcon = action?.icon;
  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-indigo-50/30 px-6 py-16 text-center dark:border-slate-800 dark:from-slate-900 dark:to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.06),transparent_50%)]" />
      <div className="relative">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg shadow-indigo-500/10 dark:bg-slate-800">
          <Icon className="h-8 w-8 text-indigo-500" />
        </div>
        <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">{description}</p>
        {action && (
          <div className="mt-6">
            <Button
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 font-semibold shadow-lg shadow-indigo-500/25 hover:from-indigo-700 hover:to-violet-700"
              onClick={action.onClick}
              asChild={!!action.href}
            >
              {action.href ? (
                <Link href={action.href}>
                  {ActionIcon && <ActionIcon className="mr-2 h-4 w-4" />}
                  {action.label}
                </Link>
              ) : (
                <span>
                  {ActionIcon && <ActionIcon className="mr-2 h-4 w-4" />}
                  {action.label}
                </span>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/50 py-16 dark:border-rose-500/30 dark:bg-rose-500/5">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/10">
        <X className="h-6 w-6 text-rose-600 dark:text-rose-400" />
      </div>
      <p className="mt-4 max-w-md text-center text-sm font-medium text-rose-800 dark:text-rose-400">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4 rounded-lg" onClick={onRetry}>Try again</Button>
      )}
    </div>
  );
}

export function priceLabel(course: {
  priceModel: string;
  oneTimePricing?: { price: number };
  subscriptionTiers?: Array<{ interval: string; price: number; isActive: boolean }>;
}) {
  if (course.priceModel === "free") return "Free";
  if (course.priceModel === "onetime") return `$${(course.oneTimePricing?.price || 0).toFixed(2)}`;
  const active = (course.subscriptionTiers || []).filter((t) => t.isActive);
  if (!active.length) return "—";
  const cheapest = active.reduce((m, t) => (t.price < m.price ? t : m), active[0]);
  return `$${cheapest.price.toFixed(2)}/${cheapest.interval.slice(0, 2)}`;
}