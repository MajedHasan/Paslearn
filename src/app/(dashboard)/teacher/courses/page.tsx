"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  LayoutGrid, List, Plus, Search, BookOpen, Users, Star, DollarSign,
  Clock, Copy, Trash2, ChevronLeft, ChevronRight, Edit3, BarChart3,
  CheckSquare, Square, PlayCircle, Archive, RotateCcw, Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import api from "@/lib/api";
import {
  CourseStatusBadge, EmptyState, ErrorState, LoadingState,
  StatCard, priceLabel,
} from "./_components/ui";
import { DeleteCourseModal } from "./_components/delete-course-modal";

type State = "active" | "archived" | "deleted";

interface Course {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  thumbnailMediaId?: string | { _id?: string; url?: string | null };
  status: string;
  priceModel: string;
  oneTimePricing?: { price: number; currency: string };
  subscriptionTiers?: Array<{ interval: string; price: number; isActive: boolean }>;
  enrollmentCount?: number;
  ratingAvg?: number;
  ratingCount?: number;
  lessonsCount?: number;
  sectionsCount?: number;
  updatedAt: string;
  deletedAt?: string | null;
  mediaRetentionUntil?: string | null;
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

function thumbUrl(c: Course): string {
  const t = c.thumbnailMediaId;
  if (!t) return "";
  if (typeof t === "object" && t.url) return t.url.startsWith("/") ? `${BACKEND}${t.url}` : t.url;
  return "";
}

function daysLeft(iso?: string | null): number | null {
  if (!iso) return null;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}

export default function CoursesPage() {
  const router = useRouter();
  const [state, setState] = useState<State>("active");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("-updatedAt");
  const [page, setPage] = useState(1);
  const limit = 9;
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);

  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page, limit, sort: sortBy, state };
      if (search) params.q = search;
      if (statusFilter !== "all" && state === "active") params.status = statusFilter;
      const r = await api.get("/teacher/courses", { params });
      setCourses(r.data.data || []);
      setTotal(r.data.total || 0);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, search, statusFilter, state]);

  const fetchStats = useCallback(async () => {
    try {
      setStats((await api.get("/teacher/courses/stats")).data.data);
    } catch {}
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchCourses(); }, 400);
    return () => clearTimeout(t);
  }, [search, statusFilter, sortBy, state, fetchCourses]);

  const totalPages = Math.ceil(total / limit);

  const handleDuplicate = async (id: string) => {
    try {
      await api.post(`/teacher/courses/${id}/duplicate`);
      toast.success("Course duplicated");
      fetchCourses();
      fetchStats();
    } catch {
      toast.error("Duplicate failed");
    }
  };

  const handleBulkDelete = async () => {
    if (!selected.length || !confirm(`Delete ${selected.length} course(s)?`)) return;
    try {
      await api.post("/teacher/courses/bulk-delete", { ids: selected });
      setSelected([]);
      toast.success("Request submitted");
      fetchCourses();
      fetchStats();
    } catch {
      toast.error("Bulk delete failed");
    }
  };

  const toggleSelect = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const onModalDone = () => {
    setDeleteTarget(null);
    fetchCourses();
    fetchStats();
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="relative hidden sm:block">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 opacity-20 blur-lg" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
                <BookOpen className="h-6 w-6" />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Course Studio
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                My Courses
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                Design world-class courses, track performance, and grow your teaching business.
              </p>
            </div>
          </div>
          <Link href="/teacher/courses/new">
            <Button className="h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 hover:from-indigo-700 hover:to-violet-700">
              <Plus className="mr-2 h-4 w-4" /> New Course
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Published" value={stats?.publishedCourses ?? 0} icon={BookOpen} color="emerald"
            hint={`${stats?.totalCourses ?? 0} total courses`} />
          <StatCard label="Students Enrolled" value={stats?.totalStudents ?? 0} icon={Users} color="blue"
            hint="Across all your courses" />
          <StatCard label="Total Revenue" value={`$${(stats?.totalRevenue ?? 0).toFixed(2)}`} icon={DollarSign} color="violet"
            hint="Lifetime earnings" />
          <StatCard label="Avg Rating" value={(stats?.avgRating ?? 0).toFixed(1)} icon={Star} color="amber"
            hint="Based on verified reviews" />
        </div>

        {/* State tabs */}
        <div className="mt-8 flex gap-2 rounded-2xl border border-slate-200/60 bg-white/70 p-1.5 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70">
          {[
            { key: "active", label: "Active", icon: BookOpen },
            { key: "archived", label: "Archived", icon: Archive },
            { key: "deleted", label: "Deleted", icon: Trash2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = state === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => { setState(tab.key as State); setPage(1); setSelected([]); }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-slate-200/60 bg-white/70 p-3 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..."
                className="h-10 rounded-xl border-slate-200 pl-9 dark:border-slate-700"
              />
            </div>
            {state === "active" && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 w-full rounded-xl sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Drafts</SelectItem>
                  <SelectItem value="under_review">Under review</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-10 w-full rounded-xl sm:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="-updatedAt">Recently updated</SelectItem>
                <SelectItem value="title">Title (A–Z)</SelectItem>
                <SelectItem value="-enrollmentCount">Most students</SelectItem>
                <SelectItem value="-oneTimePricing.price">Price (high → low)</SelectItem>
                <SelectItem value="-ratingAvg">Highest rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              onClick={() => setView("grid")}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                view === "grid" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                view === "list" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Bulk bar */}
        {selected.length > 0 && state === "active" && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 dark:border-indigo-500/30 dark:bg-indigo-500/10">
            <span className="text-sm font-medium text-indigo-900 dark:text-indigo-300">
              {selected.length} selected
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setSelected([])}>Clear</Button>
              <Button size="sm" variant="destructive" className="rounded-lg" onClick={handleBulkDelete}>
                <Trash2 className="mr-1 h-4 w-4" /> Delete
              </Button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="mt-6">
          {loading ? (
            <LoadingState label={`Loading ${state} courses...`} />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchCourses} />
          ) : courses.length === 0 ? (
            <EmptyState
              icon={state === "deleted" ? Trash2 : state === "archived" ? Archive : BookOpen}
              title={
                state === "active"
                  ? "Your first course awaits"
                  : state === "archived"
                  ? "No archived courses"
                  : "Nothing here"
              }
              description={
                state === "active"
                  ? "Build a course once and sell it forever. Start with a title and outline — add lessons as you go."
                  : state === "archived"
                  ? "Courses you archive will appear here. Students still keep access."
                  : "Deleted courses appear here for 90 days with a media retention countdown."
              }
              action={
                state === "active"
                  ? { label: "Create your first course", href: "/teacher/courses/new", icon: Plus }
                  : undefined
              }
            />
          ) : view === "grid" ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((c) => (
                <GridCard
                  key={c._id}
                  course={c}
                  state={state}
                  selected={selected.includes(c._id)}
                  onSelect={() => toggleSelect(c._id)}
                  onEdit={() => router.push(`/teacher/courses/${c._id}/edit`)}
                  onView={() => router.push(`/teacher/courses/${c._id}`)}
                  onDuplicate={() => handleDuplicate(c._id)}
                  onManage={() => setDeleteTarget(c)}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="w-10 px-4 py-3"></th>
                    <th className="px-4 py-3">Course</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Students</th>
                    <th className="px-4 py-3">Rating</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => (
                    <tr
                      key={c._id}
                      className="group border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-800/30"
                    >
                      <td className="px-4 py-3">
                        <button onClick={() => toggleSelect(c._id)} className="text-slate-400 hover:text-indigo-600">
                          {selected.includes(c._id) ? (
                            <CheckSquare className="h-4 w-4 text-indigo-600" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => router.push(`/teacher/courses/${c._id}`)}
                          className="flex items-center gap-3 text-left"
                        >
                          <div className="h-11 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                            {thumbUrl(c) ? (
                              <img src={thumbUrl(c)} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <PlayCircle className="h-4 w-4 text-slate-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="line-clamp-1 font-semibold text-slate-900 dark:text-white">{c.title}</p>
                            <p className="text-xs text-slate-500">
                              {c.lessonsCount ?? 0} lessons · {c.sectionsCount ?? 0} sections
                            </p>
                          </div>
                        </button>
                      </td>
                      <td className="px-4 py-3"><CourseStatusBadge status={c.status} /></td>
                      <td className="px-4 py-3 text-sm">{(c.enrollmentCount || 0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {(c.ratingAvg || 0).toFixed(1)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold">{priceLabel(c)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => router.push(`/teacher/courses/${c._id}/edit`)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/teacher/courses/${c._id}`)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                          >
                            <BarChart3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(c)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                          >
                            {state === "deleted" ? <RotateCcw className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} courses
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-3 text-sm font-medium text-slate-700 dark:text-slate-300">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <DeleteCourseModal
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        courseId={deleteTarget?._id || null}
        courseTitle={deleteTarget?.title || ""}
        onDone={onModalDone}
      />
    </div>
  );
}

// ─── Grid card ──────────────────────────────────────────
function GridCard({
  course, state, selected, onSelect, onEdit, onView, onDuplicate, onManage,
}: {
  course: Course; state: State; selected: boolean;
  onSelect: () => void; onEdit: () => void; onView: () => void;
  onDuplicate: () => void; onManage: () => void;
}) {
  const [hover, setHover] = useState(false);
  const thumb = thumbUrl(course);
  const retention = daysLeft(course.mediaRetentionUntil);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/30"
    >
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
        {thumb ? (
          <img
            src={thumb}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <PlayCircle className="h-12 w-12 text-slate-300 dark:text-slate-600" />
          </div>
        )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between bg-gradient-to-b from-black/40 to-transparent p-3">
          <CourseStatusBadge status={course.status} />
          <button
            onClick={onSelect}
            className={`flex h-7 w-7 items-center justify-center rounded-lg backdrop-blur-md transition-colors ${
              selected ? "bg-white text-indigo-600" : "bg-white/80 text-slate-600 hover:bg-white"
            }`}
          >
            {selected ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
          </button>
        </div>
        {retention !== null && (
          <div className="absolute bottom-3 left-3 rounded-full bg-rose-600/95 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg">
            <Calendar className="mr-1 inline h-3 w-3" />
            Media expires in {retention}d
          </div>
        )}
        {hover && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 backdrop-blur-sm">
            <button
              onClick={onEdit}
              className="flex h-10 items-center gap-1.5 rounded-xl bg-white px-4 text-sm font-semibold text-slate-900 shadow-lg transition-transform hover:scale-105"
            >
              <Edit3 className="h-4 w-4" /> Edit
            </button>
            <button
              onClick={onView}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-900 shadow-lg transition-transform hover:scale-105"
            >
              <BarChart3 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="p-4">
        <button onClick={onView} className="text-left">
          <h3 className="line-clamp-1 text-base font-bold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
            {course.title}
          </h3>
        </button>
        <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-xs text-slate-500 dark:text-slate-400">
          {course.subtitle || course.description || "No description yet"}
        </p>

        <div className="mt-4 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> {(course.enrollmentCount || 0).toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {(course.ratingAvg || 0).toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {course.lessonsCount || 0} lessons
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
          <span className="text-base font-black text-slate-900 dark:text-white">{priceLabel(course)}</span>
          <button
            onClick={onManage}
            className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition-colors ${
              state === "deleted"
                ? "text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                : "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
            }`}
          >
            {state === "deleted" ? (
              <><RotateCcw className="mr-1 inline h-3 w-3" />Restore</>
            ) : (
              <><Trash2 className="mr-1 inline h-3 w-3" />Manage</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}