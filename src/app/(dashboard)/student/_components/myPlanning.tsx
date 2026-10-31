"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PlayCircle,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

export interface ContinueCourse {
  _id: string;
  title: string;
  slug: string;
  thumbnailUrl?: string;
  progressPercent: number;
  teacherName?: string;
  lessonsCompleted?: number;
  lessonsTotal?: number;
  nextLessonTitle?: string;      // ⭐ NEW
}

export function ContinueLearning({
  courses,
  loading = false,
}: {
  courses: ContinueCourse[];
  loading?: boolean;
}) {
  return (
    <Card className="overflow-hidden border-slate-200/80 shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-black text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0177FB] to-[#0156C7] shadow-sm">
                <Sparkles className="h-4 w-4 text-white" />
              </span>
              Continue Learning
            </CardTitle>
            <CardDescription className="mt-1 text-xs font-medium text-slate-500">
              Pick up where you left off
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {loading ? (
          <div className="space-y-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-white py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0177FB]/10">
              <BookOpen className="h-6 w-6 text-[#0177FB]" />
            </div>
            <p className="mt-2 text-xs font-bold text-slate-900">Ready to dive in?</p>
            <p className="mt-0.5 max-w-[220px] text-[10px] text-slate-500">
              Start a lesson to see it here
            </p>
            <Link href="/courses">
              <Button size="sm" variant="link" className="mt-1 h-auto p-0 text-[#0177FB]">
                Browse courses →
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {courses.map((c) => (
              <Link
                key={c._id}
                href={`/learn/${c.slug}`}
                className="group relative block overflow-hidden rounded-xl border border-slate-100 bg-white transition-all hover:-translate-y-0.5 hover:border-[#0177FB]/40 hover:shadow-md"
              >
                <div className="flex items-center gap-3 p-2.5">
                  <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-slate-100 to-slate-200">
                    {c.thumbnailUrl ? (
                      <img
                        src={c.thumbnailUrl}
                        alt={c.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <PlayCircle className="h-5 w-5 text-slate-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <PlayCircle className="h-6 w-6 text-white drop-shadow-lg" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-xs font-bold text-slate-900 group-hover:text-[#0177FB]">
                      {c.title}
                    </p>
                    {c.nextLessonTitle ? (
                      <p className="mt-0.5 line-clamp-1 text-[10px] font-medium text-[#0177FB]">
                        ▶ Next: {c.nextLessonTitle}
                      </p>
                    ) : c.teacherName ? (
                      <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-500">
                        {c.teacherName}
                      </p>
                    ) : null}
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#0177FB] to-[#0156C7]"
                          style={{ width: `${c.progressPercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-black text-[#0177FB] tabular-nums">
                        {c.progressPercent}%
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-[#0177FB]" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Backwards compat
export const MyPlanning = ContinueLearning;
export default ContinueLearning;