"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Star,
  CheckCircle2,
  PlayCircle,
  Loader2,
  Sparkles,
  X,
  Award,
  Clock,
} from "lucide-react";
import api from "@/lib/api";

const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

type Filter = "all" | "in-progress" | "not-started" | "completed";

interface Enrollment {
  _id: string;
  course: {
    _id: string;
    title: string;
    slug: string;
    thumbnailUrl?: string;
    lessonsCount?: number;
    ratingAvg?: number;
    ratingCount?: number;
    totalDurationSec?: number;
    category?: string;
    certificateEnabled?: boolean;
    teacher?: { name: string; profileImageUrl?: string };
  };
  progressPercent: number;
  lessonsCompleted: number;
  enrolledAt: string;
  lastAccessedAt?: string;
  completedAt?: string;
  nextLesson?: {
    sectionId: string;
    lessonId: string;
    title: string;
    type: string;
  } | null;
  // ⭐ NEW
  hasReviewed?: boolean;
  reviewRating?: number | null;
  hasCertificate?: boolean;
  certificateSlug?: string | null;
  certificateNumber?: string | null;
}

function fmtDuration(sec?: number): string {
  if (!sec) return "";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function StudentCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("/enrollments/my");
        setEnrollments(r.data.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const counts = useMemo(
    () => ({
      all: enrollments.length,
      inProgress: enrollments.filter(
        (e) => e.progressPercent > 0 && e.progressPercent < 100
      ).length,
      notStarted: enrollments.filter((e) => e.progressPercent === 0).length,
      completed: enrollments.filter((e) => e.progressPercent >= 100).length,
    }),
    [enrollments]
  );

  const filtered = useMemo(() => {
    let list = [...enrollments];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.course?.title?.toLowerCase().includes(q));
    }
    if (filter === "in-progress")
      list = list.filter(
        (e) => e.progressPercent > 0 && e.progressPercent < 100
      );
    else if (filter === "not-started")
      list = list.filter((e) => e.progressPercent === 0);
    else if (filter === "completed")
      list = list.filter((e) => e.progressPercent >= 100);

    list.sort((a, b) => {
      const order = (e: Enrollment) => {
        if (e.progressPercent >= 100) return 2;
        if (e.progressPercent === 0) return 1;
        return 0;
      };
      return order(a) - order(b);
    });

    return list;
  }, [enrollments, filter, search]);

  return (
    <div className="flex flex-col gap-5 py-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-[#0177FB]">
          Your library
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
          My Courses
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {enrollments.length === 0
            ? "Every course you enroll in shows up here"
            : `${counts.inProgress} in progress · ${counts.completed} completed`}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: "all" as Filter, label: "All", count: counts.all },
          {
            key: "in-progress" as Filter,
            label: "In Progress",
            count: counts.inProgress,
          },
          {
            key: "not-started" as Filter,
            label: "Not Started",
            count: counts.notStarted,
          },
          {
            key: "completed" as Filter,
            label: "Completed",
            count: counts.completed,
          },
        ].map((tab) => {
          const active = filter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                active
                  ? "bg-[#0177FB] text-white shadow-md shadow-[#0177FB]/25"
                  : "bg-white text-slate-600 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 text-[10px] font-black ${
                  active
                    ? "bg-white/25 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
        {search && (
          <button
            onClick={() => setSearch("")}
            className="ml-auto flex items-center gap-1 rounded-full bg-[#0177FB]/10 px-2.5 py-1 text-[11px] font-bold text-[#0177FB]"
          >
            &ldquo;{search}&rdquo; <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#0177FB]" />
        </div>
      ) : enrollments.length === 0 ? (
        <EmptyCourses />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
          <BookOpen className="h-8 w-8 text-slate-300" />
          <h3 className="mt-3 text-base font-bold text-slate-900">
            No courses match
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Try a different filter or clear your search.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 rounded-lg"
            onClick={() => {
              setFilter("all");
              setSearch("");
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => (
            <CourseCard key={e._id} enrollment={e} />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCard({ enrollment }: { enrollment: Enrollment }) {
  const thumb = enrollment.course?.thumbnailUrl;
  const pct = enrollment.progressPercent || 0;
  const completed = pct >= 100;
  const notStarted = pct === 0;
  const course = enrollment.course;
  const duration = fmtDuration(course?.totalDurationSec);

  const lastAccessLabel = (() => {
    if (!enrollment.lastAccessedAt) return null;
    const mins = Math.floor(
      (Date.now() - new Date(enrollment.lastAccessedAt).getTime()) / 60000
    );
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  })();

  return (
    <Link
      href={`/student/learn/${course.slug}`}
      className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#0177FB]/40 hover:shadow-xl"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
        {thumb ? (
          <img
            src={thumb}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookOpen className="h-10 w-10 text-slate-300" />
          </div>
        )}

        {completed && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-500/40">
            <CheckCircle2 className="h-3 w-3" /> Completed
          </div>
        )}
        {notStarted && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-gradient-to-r from-[#0177FB] to-[#0156C7] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-[#0177FB]/40">
            <Sparkles className="h-3 w-3" /> New
          </div>
        )}

        {course.category && (
          <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white backdrop-blur-sm">
            {course.category.replace("-", " ")}
          </div>
        )}

        {pct > 0 && pct < 100 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
            <div
              className="h-full bg-gradient-to-r from-[#0177FB] to-[#0156C7] transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-2xl transition-transform duration-300 group-hover:scale-110">
            <PlayCircle className="h-7 w-7 text-[#0177FB]" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-[#0177FB]">
          {course.title}
        </h3>

        {course.teacher?.name && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0177FB] to-[#0156C7] text-[9px] font-black text-white">
              {course.teacher.name.charAt(0).toUpperCase()}
            </div>
            <p className="line-clamp-1 text-[11px] font-medium text-slate-500">
              {course.teacher.name}
            </p>
          </div>
        )}

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
            <span className="font-bold text-slate-900">
              {(course.ratingAvg || 0).toFixed(1)}
            </span>
            <span className="text-slate-400">
              ({(course.ratingCount || 0).toLocaleString()})
            </span>
          </span>
          <span className="text-slate-300">·</span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {course.lessonsCount || 0}
          </span>
          {duration && (
            <>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {duration}
              </span>
            </>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                completed
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                  : "bg-gradient-to-r from-[#0177FB] to-[#0156C7]"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[11px] font-black text-slate-700 tabular-nums">
            {pct}%
          </span>
        </div>

        {/* ⭐ NEW: Review + certificate prompts */}
        {completed && (!enrollment.hasReviewed || enrollment.hasCertificate) && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {!enrollment.hasReviewed && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 ring-1 ring-inset ring-amber-200">
                <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                Leave a review
              </span>
            )}
            {enrollment.hasCertificate && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                <Award className="h-2.5 w-2.5" />
                Certificate earned
              </span>
            )}
          </div>
        )}

        <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2.5">
          {completed ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
              <CheckCircle2 className="h-3 w-3" />
              {enrollment.completedAt
                ? `Completed ${new Date(
                    enrollment.completedAt
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}`
                : "Completed"}
            </span>
          ) : lastAccessLabel ? (
            <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
              <Clock className="h-3 w-3" />
              {lastAccessLabel}
            </span>
          ) : (
            <span className="text-[10px] font-medium text-slate-500">
              Not started yet
            </span>
          )}
          <span className="text-[10px] font-black uppercase tracking-wider text-[#0177FB]">
            {completed ? "Review" : pct > 0 ? "Resume →" : "Start →"}
          </span>
        </div>
      </div>
    </Link>
  );
}

function EmptyCourses() {
  return (
    <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-white to-slate-50/50 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0177FB] to-[#0156C7] shadow-lg shadow-[#0177FB]/25">
        <BookOpen className="h-8 w-8 text-white" />
      </div>
      <h3 className="mt-4 text-xl font-black text-slate-900">
        Your library is empty
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
        Browse our catalog and enroll in your first course. Learn on your
        schedule.
      </p>
      <Link href="/courses">
        <Button className="mt-6 rounded-lg bg-gradient-to-r from-[#0177FB] to-[#0156C7] font-bold shadow-lg shadow-[#0177FB]/25">
          <Sparkles className="mr-2 h-4 w-4" /> Explore courses
        </Button>
      </Link>
    </div>
  );
}