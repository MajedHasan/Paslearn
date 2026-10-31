"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import { ProgressRowSkeleton } from "./skeletons";

export interface ProgressCourse {
  _id: string;
  title: string;
  slug: string;
  progressPercent: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  teacherName?: string;
}

export function CourseProgressList({
  courses,
  loading = false,
}: {
  courses: ProgressCourse[];
  loading?: boolean;
}) {
  return (
    <Card className="overflow-hidden border-slate-200/80 shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-black text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF7E02] to-[#E66400] shadow-sm">
                <TrendingUp className="h-4 w-4 text-white" />
              </span>
              In Progress
            </CardTitle>
            <CardDescription className="mt-1 text-xs font-medium text-slate-500">
              {`Courses you're working through`}
            </CardDescription>
          </div>
          <Link href="/student/courses">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 rounded-lg px-2 text-[11px] font-bold text-[#0177FB] hover:bg-[#0177FB]/10 hover:text-[#0177FB]"
            >
              All <ArrowRight className="ml-0.5 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => <ProgressRowSkeleton key={i} />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-white py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF7E02]/10">
              <BookOpen className="h-6 w-6 text-[#FF7E02]" />
            </div>
            <p className="mt-2 text-xs font-bold text-slate-900">Nothing in progress</p>
            <p className="mt-0.5 max-w-[220px] text-[10px] text-slate-500">
              Progress will appear as you work through lessons
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {courses.map((c) => (
              <Link
                key={c._id}
                href={`/learn/${c.slug}`}
                className="group block"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="line-clamp-1 flex-1 text-xs font-bold text-slate-900 transition-colors group-hover:text-[#0177FB]">
                    {c.title}
                  </span>
                  <span className="shrink-0 text-[10px] font-black text-slate-600 tabular-nums">
                    {c.lessonsCompleted}/{c.lessonsTotal}
                  </span>
                </div>
                {c.teacherName && (
                  <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-500">
                    {c.teacherName}
                  </p>
                )}
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#0177FB] to-[#0156C7] transition-all duration-700"
                      style={{ width: `${c.progressPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-[#0177FB] tabular-nums">
                    {c.progressPercent}%
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}