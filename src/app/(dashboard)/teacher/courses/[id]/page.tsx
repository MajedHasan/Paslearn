"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Edit3, Users, Star, DollarSign, BookOpen, TrendingUp,
  MessageSquare, HelpCircle, Award, ExternalLink, ArrowUpRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import api from "@/lib/api";
import {
  CourseStatusBadge, ErrorState, LoadingState, StatCard, priceLabel,
} from "../_components/ui";
import { CourseNav } from "../_components/course-nav";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

function thumbUrl(course: any): string | null {
  const t = course?.thumbnailMediaId;
  if (!t) return null;
  if (typeof t === "object" && t.url) {
    return t.url.startsWith("/") ? `${BACKEND}${t.url}` : t.url;
  }
  return null;
}

export default function CourseHubPage() {
  const { id: courseId } = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [c, a] = await Promise.all([
        api.get(`/teacher/courses/${courseId}`),
        api
          .get(`/teacher/analytics/teacher/courses/${courseId}`, {
            params: { days: 30 },
          })
          .catch(() => ({ data: { data: null } })),
      ]);
      setCourse(c.data.data);
      setAnalytics(a.data.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 dark:bg-slate-950">
        <LoadingState />
      </div>
    );
  }
  if (error || !course) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 dark:bg-slate-950">
        <ErrorState
          message={error || "Course not found"}
          onRetry={load}
        />
      </div>
    );
  }

  const thumb = thumbUrl(course);

  const chartData = (analytics?.enrollmentsByDay || []).map((d: any) => ({
    date: typeof d._id === "string" ? d._id.slice(5) : String(d._id || ""),
    enrollments: d.count || 0,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          className="mb-4 rounded-xl text-slate-600"
          onClick={() => router.push("/teacher/courses")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> All courses
        </Button>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-xl shadow-indigo-500/5 dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-6 md:grid-cols-[320px_1fr]">
            <div className="relative aspect-video overflow-hidden bg-slate-100 md:aspect-auto md:h-full dark:bg-slate-800">
              {thumb ? (
                <img src={thumb} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <BookOpen className="h-12 w-12 text-slate-300" />
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex flex-wrap items-center gap-2">
                <CourseStatusBadge status={course.status} />
                {course.badge && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                    {course.badge}
                  </span>
                )}
              </div>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {course.title}
              </h1>
              {course.subtitle && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {course.subtitle}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-2">
                <Link href={`/teacher/courses/${courseId}/edit`}>
                  <Button className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 font-semibold shadow-lg shadow-indigo-500/25">
                    <Edit3 className="mr-2 h-4 w-4" /> Edit content
                  </Button>
                </Link>
                <Link href={`/courses/${course.slug}`} target="_blank">
                  <Button variant="outline" className="rounded-xl">
                    <ExternalLink className="mr-2 h-4 w-4" /> View public page
                  </Button>
                </Link>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-sm dark:border-slate-800 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-slate-400">Price</p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {priceLabel(course)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Lessons</p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {course.lessonsCount ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Sections</p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {course.sectionsCount ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Language</p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {course.language}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* In-course nav */}
        <div className="mt-6">
          <CourseNav
            courseId={courseId}
            counts={{ reviews: course.ratingCount }}
          />
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Students"
            value={analytics?.summary?.totalEnrollments ?? course.enrollmentCount ?? 0}
            icon={Users}
            color="blue"
            hint="Total active enrollments"
          />
          <StatCard
            label="Revenue"
            value={`$${(
              analytics?.summary?.totalRevenue ??
              (course.revenueCents || 0) / 100
            ).toFixed(2)}`}
            icon={DollarSign}
            color="violet"
            hint="Last 30 days"
          />
          <StatCard
            label="Rating"
            value={(course.ratingAvg ?? 0).toFixed(1)}
            icon={Star}
            color="amber"
            hint={`${course.ratingCount ?? 0} reviews`}
          />
          <StatCard
            label="Completion"
            value={`${analytics?.summary?.completionRate ?? 0}%`}
            icon={Award}
            color="emerald"
            hint="Students finishing all lessons"
          />
        </div>

        {/* Enrollment chart */}
        <div className="mt-6 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Enrollments (last 30 days)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                New students joining over time
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" /> Live
            </div>
          </div>
          <div className="mt-4 h-64">
            {chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No enrollment data yet — share your course to start getting students.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="grad-enroll" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                  <Area
                    type="monotone"
                    dataKey="enrollments"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#grad-enroll)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              label: "Manage reviews",
              desc: "Reply and moderate",
              icon: MessageSquare,
              href: "reviews",
              color: "from-indigo-500 to-violet-600",
            },
            {
              label: "Answer Q&A",
              desc: "Help your students",
              icon: HelpCircle,
              href: "qa",
              color: "from-emerald-500 to-teal-600",
            },
            {
              label: "See students",
              desc: "Track progress",
              icon: Users,
              href: "students",
              color: "from-amber-500 to-orange-600",
            },
          ].map((l) => {
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={`/teacher/courses/${courseId}/${l.href}`}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${l.color} text-white shadow-lg`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {l.label}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {l.desc}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            );
          })}
        </div>

        {/* Analytics deep stats */}
        {analytics?.summary && (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/60 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs text-slate-500">Total orders</p>
              <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                {analytics.summary.totalOrders ?? 0}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/60 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs text-slate-500">Course views</p>
              <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                {analytics.summary.views ?? 0}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/60 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs text-slate-500">Total reviews</p>
              <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                {analytics.summary.totalReviews ?? 0}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/60 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs text-slate-500">Avg rating</p>
              <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                {(analytics.summary.ratingAvg ?? 0).toFixed(1)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}