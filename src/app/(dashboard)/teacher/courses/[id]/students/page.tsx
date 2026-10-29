"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Users, Search, Mail, Calendar,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import api from "@/lib/api";
import {
  EmptyState, ErrorState, LoadingState,
} from "../../_components/ui";
import { CourseNav } from "../../_components/course-nav";

export default function CourseStudentsPage() {
  const { id: courseId } = useParams<{ id: string }>();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await api.get(`/teacher/courses/${courseId}/students`);
      setStudents(r.data.data || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { load(); }, [load]);

  const filtered = students.filter((s) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      s.user?.name?.toLowerCase().includes(q) ||
      s.user?.email?.toLowerCase().includes(q)
    );
  });

  const active = students.filter((s) => s.status === "active").length;
  const completed = students.filter((s) => s.completedAt).length;
  const avgProgress = students.length
    ? Math.round(
        students.reduce((sum, s) => sum + (s.progressPercent || 0), 0) /
          students.length
      )
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Course Studio
              </p>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Enrolled Students
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                See {`who's`} learning from you and their progress.
              </p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search students..."
              className="h-10 rounded-xl pl-9 sm:w-64"
            />
          </div>
        </div>

        <CourseNav courseId={courseId} counts={{ students: students.length }} />

        {students.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200/60 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs text-slate-500">Total enrolled</p>
              <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                {students.length}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/60 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs text-slate-500">Active</p>
              <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {active}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/60 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs text-slate-500">Avg progress</p>
              <p className="mt-1 text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {avgProgress}%
              </p>
            </div>
          </div>
        )}

        <div className="mt-6">
          {loading ? (
            <LoadingState label="Loading students..." />
          ) : error ? (
            <ErrorState message={error} onRetry={load} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title={query ? "No matching students" : "No students yet"}
              description={
                query
                  ? "Try a different search term."
                  : "Once students enroll, you'll see them here with their progress and contact info."
              }
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Progress</th>
                    <th className="px-4 py-3">Lessons</th>
                    <th className="px-4 py-3">Enrolled</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr
                      key={s._id}
                      className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
                            {s.user?.name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {s.user?.name || "Student"}
                            </p>
                            <p className="flex items-center gap-1 text-xs text-slate-500">
                              <Mail className="h-3 w-3" /> {s.user?.email || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600"
                              style={{
                                width: `${Math.min(100, s.progressPercent || 0)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            {s.progressPercent || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                        {s.lessonsCompleted || 0} done
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(s.enrolledAt))} ago
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {completed > 0 && (
          <p className="mt-4 text-center text-xs text-slate-400">
            {completed} student{completed !== 1 ? "s" : ""} completed this course
          </p>
        )}
      </div>
    </div>
  );
}