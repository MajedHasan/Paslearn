"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, GraduationCap, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export interface TutorItem {
  _id: string;
  name: string;
  profileImageUrl?: string;
  courseCount: number;
}

export function TopTutors({
  tutors,
  loading = false,
}: {
  tutors: TutorItem[];
  loading?: boolean;
}) {
  return (
    <Card className="overflow-hidden border-slate-200/80 shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80">
        <CardTitle className="flex items-center gap-2 text-base font-black text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-sm">
            <GraduationCap className="h-4 w-4 text-white" />
          </span>
          Your Instructors
        </CardTitle>
        <CardDescription className="mt-1 text-xs font-medium text-slate-500">
          {`Experts teaching the courses you're enrolled in`}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : tutors.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-white py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10">
              <GraduationCap className="h-6 w-6 text-indigo-500" />
            </div>
            <p className="mt-2 text-xs font-bold text-slate-900">Meet your instructors</p>
            <p className="mt-0.5 max-w-[240px] text-[10px] text-slate-500">
              {`They'll show up here once you enroll in their courses`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {tutors.map((t) => (
              <Link
                key={t._id}
                href="/courses"
                className="group relative flex flex-col items-center rounded-xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-4 text-center transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
              >
                <div className="relative">
                  <Avatar className="h-14 w-14 ring-2 ring-indigo-100 ring-offset-2 ring-offset-white transition-all group-hover:ring-indigo-300">
                    <AvatarImage src={t.profileImageUrl} alt={t.name} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-sm font-black text-white">
                      {t.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <ArrowUpRight className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-indigo-500 p-0.5 text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100" />
                </div>
                <p className="mt-2 line-clamp-1 text-xs font-bold text-slate-900">
                  {t.name}
                </p>
                <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-indigo-600">
                  <BookOpen className="h-2.5 w-2.5" />
                  {t.courseCount} course{t.courseCount === 1 ? "" : "s"}
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TopTutors;