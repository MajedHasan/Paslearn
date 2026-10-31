"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  Flame,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

export interface WelcomeBarProps {
  name: string;
  streak: number;             // consecutive days
  activeDaysThisWeek: number; // 0-7
  weeklyGoal: number;         // target days
  inProgressCount: number;
  hasAnyCourses: boolean;
}

function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Burning the midnight oil";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Working late";
}

export function WelcomeBar({
  name,
  streak,
  activeDaysThisWeek,
  weeklyGoal,
  inProgressCount,
  hasAnyCourses,
}: WelcomeBarProps) {
  const firstName = name?.split(" ")[0] || "there";
  const greeting = timeGreeting();

  // Weekly dots
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const todayIdx = new Date().getDay();
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - todayIdx);

  const dots = days.map((letter, idx) => {
    const dayDate = new Date(weekStart);
    dayDate.setDate(dayDate.getDate() + idx);
    const isToday = idx === todayIdx;
    const isPast = idx < todayIdx;
    // activeDaysThisWeek is count, not which days — approximate: light up first N days
    const isActive = idx < activeDaysThisWeek;
    return { letter, isToday, isPast, isActive };
  });

  const weeklyPct = Math.min(100, Math.round((activeDaysThisWeek / weeklyGoal) * 100));

  // Context message
  let context: string;
  if (!hasAnyCourses) {
    context = "Your learning journey starts here. Browse our catalog to enroll in your first course.";
  } else if (inProgressCount > 0) {
    context = `You have ${inProgressCount} course${inProgressCount === 1 ? "" : "s"} in progress. Keep the momentum going!`;
  } else {
    context = "All your courses are complete. Ready for a new challenge?";
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0177FB] via-[#0166d9] to-[#014bb0] p-6 shadow-lg shadow-[#0177FB]/25">
      {/* Decorative */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-[#FF7E02]/20 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          {/* Streak + goal chips */}
          <div className="flex flex-wrap items-center gap-2">
            {streak > 0 && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-sm ring-1 ring-inset ring-white/20">
                <Flame className="h-3.5 w-3.5 text-orange-300" />
                {streak}-day streak
              </div>
            )}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-sm ring-1 ring-inset ring-white/20">
              <Target className="h-3.5 w-3.5" />
              {activeDaysThisWeek}/{weeklyGoal} days this week
            </div>
            {weeklyPct >= 100 && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/30 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-sm ring-1 ring-inset ring-emerald-300/40">
                <Sparkles className="h-3.5 w-3.5" />
                Goal crushed!
              </div>
            )}
          </div>

          <h1 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
            {greeting}, {firstName} <span className="inline-block animate-wave">👋</span>
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-white/85">
            {context}
          </p>

          {/* Weekly dots */}
          <div className="mt-4 flex items-center gap-2">
            {dots.map((d, i) => (
              <div
                key={i}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                  d.isActive
                    ? "bg-white text-[#0177FB] shadow-md shadow-black/20"
                    : d.isToday
                    ? "bg-white/30 text-white ring-2 ring-white/60"
                    : "bg-white/10 text-white/50"
                }`}
              >
                {d.isActive ? "✓" : d.letter}
              </div>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {inProgressCount > 0 && (
            <Link href="/student/courses">
              <Button
                className="h-11 rounded-lg bg-white font-bold text-[#0177FB] shadow-lg shadow-black/10 hover:bg-white/95"
              >
                <TrendingUp className="mr-2 h-4 w-4" /> Continue learning
              </Button>
            </Link>
          )}
          <Link href="/courses">
            <Button
              variant="outline"
              className="h-11 rounded-lg border-white/30 bg-white/10 font-semibold text-white backdrop-blur-sm hover:bg-white/20"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              {hasAnyCourses ? "Browse more" : "Get started"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}