"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3, Edit3, MessageSquare, HelpCircle, Users, Sparkles,
} from "lucide-react";

const TABS = [
  { key: "overview", label: "Overview", icon: BarChart3, path: "" },
  { key: "content", label: "Content", icon: Edit3, path: "/edit" },
  { key: "reviews", label: "Reviews", icon: MessageSquare, path: "/reviews" },
  { key: "qa", label: "Q&A", icon: HelpCircle, path: "/qa" },
  { key: "students", label: "Students", icon: Users, path: "/students" },
  { key: "ai", label: "AI Studio", icon: Sparkles, path: "/ai" },   // ⭐ NEW
] as const;

export function CourseNav({
  courseId,
  counts,
}: {
  courseId: string;
  counts?: { reviews?: number; qa?: number; students?: number; aiJobs?: number };
}) {
  const pathname = usePathname();
  const base = `/teacher/courses/${courseId}`;

  return (
    <div className="flex overflow-x-auto rounded-2xl border border-slate-200/60 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const target = `${base}${tab.path}`;
        const active = pathname === target;
        const count =
          tab.key === "reviews" ? counts?.reviews :
          tab.key === "qa" ? counts?.qa :
          tab.key === "students" ? counts?.students :
          tab.key === "ai" ? counts?.aiJobs :
          undefined;

        return (
          <Link
            key={tab.key}
            href={target}
            className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              active
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
            {count !== undefined && count > 0 && (
              <span
                className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  active
                    ? "bg-white/25 text-white"
                    : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}