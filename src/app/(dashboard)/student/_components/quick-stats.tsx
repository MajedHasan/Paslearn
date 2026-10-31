"use client";

import { BookOpen, CheckCircle2, Award, Layers } from "lucide-react";
import { StatCardSkeleton } from "./skeletons";

export interface QuickStatsProps {
  enrolled: number;
  inProgress: number;
  completed: number;
  certificates: number;
  loading?: boolean;
}

export function QuickStats({
  enrolled,
  inProgress,
  completed,
  certificates,
  loading = false,
}: QuickStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <StatCardSkeleton key={i} />)}
      </div>
    );
  }

  const cards = [
    {
      icon: BookOpen,
      value: enrolled,
      label: "Enrolled",
      hint: enrolled === 0 ? "Start learning" : "In your library",
      gradient: "from-[#0177FB] to-[#0156C7]",
      bg: "bg-[#0177FB]/10",
      iconColor: "text-[#0177FB]",
    },
    {
      icon: Layers,
      value: inProgress,
      label: "In Progress",
      hint: inProgress === 0 ? "Nothing started" : "Keep going",
      gradient: "from-[#FF7E02] to-[#E66400]",
      bg: "bg-[#FF7E02]/10",
      iconColor: "text-[#FF7E02]",
    },
    {
      icon: CheckCircle2,
      value: completed,
      label: "Completed",
      hint: completed === 0 ? "None yet" : "Achievement unlocked",
      gradient: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
    },
    {
      icon: Award,
      value: certificates,
      label: "Certificates",
      hint: certificates === 0 ? "Earn your first" : "Proof of skill",
      gradient: "from-violet-500 to-violet-600",
      bg: "bg-violet-500/10",
      iconColor: "text-violet-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
          >
            <div
              className={`absolute -right-6 -top-6 h-16 w-16 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100 ${c.bg}`}
            />
            <div className={`relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${c.gradient} shadow-md`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <p className="relative mt-3 text-3xl font-black tracking-tight text-slate-900 tabular-nums">
              {c.value}
            </p>
            <p className="relative text-xs font-bold uppercase tracking-wide text-slate-500">
              {c.label}
            </p>
            <p className="relative mt-1 text-[11px] text-slate-400">
              {c.hint}
            </p>
          </div>
        );
      })}
    </div>
  );
}