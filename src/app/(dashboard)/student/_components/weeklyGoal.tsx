"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Target, Flame, CheckCircle2 } from "lucide-react";

export function WeeklyGoal({
  activeDays,
  target,
  streak,
}: {
  activeDays: number;
  target: number;
  streak: number;
}) {
  const pct = Math.min(100, Math.round((activeDays / target) * 100));
  const remaining = Math.max(0, target - activeDays);
  const done = remaining === 0;

  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const todayIdx = new Date().getDay();

  return (
    <Card className="overflow-hidden border-slate-200/80 shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80">
        <CardTitle className="flex items-center gap-2 text-base font-black text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 shadow-sm">
            <Target className="h-4 w-4 text-white" />
          </span>
          Weekly Goal
        </CardTitle>
        <CardDescription className="mt-1 text-xs font-medium text-slate-500">
          {done ? "Goal achieved — incredible!" : `${remaining} more day${remaining === 1 ? "" : "s"} to hit your goal`}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-3xl font-black tracking-tight text-slate-900 tabular-nums">
              {activeDays}
              <span className="text-lg font-bold text-slate-400">/{target}</span>
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Days active this week
            </p>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-orange-700 ring-1 ring-inset ring-orange-200">
              <Flame className="h-3 w-3" />
              {streak}d streak
            </div>
          )}
        </div>

        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-600 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-4 flex justify-between gap-1">
          {days.map((letter, i) => {
            const isToday = i === todayIdx;
            const isPast = i < todayIdx;
            const isActive = i < activeDays;
            return (
              <div
                key={i}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-black transition-all ${
                  isActive
                    ? "bg-violet-500 text-white shadow-md shadow-violet-500/30"
                    : isToday
                    ? "bg-violet-100 text-violet-600 ring-2 ring-violet-400"
                    : isPast
                    ? "bg-slate-100 text-slate-400"
                    : "bg-slate-50 text-slate-300"
                }`}
              >
                {isActive ? <CheckCircle2 className="h-3.5 w-3.5" /> : letter}
              </div>
            );
          })}
        </div>

        {done && (
          <p className="mt-3 flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
            <CheckCircle2 className="h-3 w-3" />
            {`Weekly goal complete — you're on fire!`}
          </p>
        )}
      </CardContent>
    </Card>
  );
}