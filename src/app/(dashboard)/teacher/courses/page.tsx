"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  LayoutGrid, List, Plus, Search, BookOpen, Users, Star, DollarSign,
  Clock, Trash2, ChevronLeft, ChevronRight, Edit3, BarChart3,
  CheckSquare, Square, PlayCircle, Archive, RotateCcw, Calendar,
  CheckCircle2, XCircle, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import {
  CourseStatusBadge, EmptyState, ErrorState, LoadingState,
  StatCard, priceLabel,
} from "./_components/ui";
import { DeleteCourseModal } from "./_components/delete-course-modal";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

type BackendState = "active" | "archived" | "deleted" | "rejected";
type TabKey =
  | "all" | "draft" | "rejected" | "in_review"
  | "published" | "archived" | "deleted";

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
  moderationReason?: string;
  moderatedAt?: string;
}

// ═══════════════════════════════════════════════════════════════
// Tab config
// ═══════════════════════════════════════════════════════════════

const TAB_CONFIG: Record<
  TabKey,
  { label: string; state: BackendState; status?: string; icon: any }
> = {
  all:        { label: "All",        state: "active",   status: undefined,       icon: BookOpen },
  draft:      { label: "Draft",      state: "active",   status: "draft",         icon: Edit3 },
  rejected:   { label: "Rejected",   state: "rejected", status: undefined,       icon: XCircle },
  in_review:  { label: "In review",  state: "active",   status: "under_review",  icon: Clock },
  published:  { label: "Published",  state: "active",   status: "published",     icon: CheckCircle2 },
  archived:   { label: "Archived",   state: "archived", status: undefined,       icon: Archive },
  deleted:    { label: "Deleted",    state: "deleted",  status: undefined,       icon: Trash2 },
};

const TAB_ORDER: TabKey[] = [
  "all", "draft", "rejected", "in_review", "published", "archived", "deleted",
];

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

function isRejected(c: Course): boolean {
  return c.status === "draft" && !!c.moderationReason;
}

// ═══════════════════════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════════════════════

export default function CoursesPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("-updatedAt");
  const [page, setPage] = useState(1);
  const limit = 12;
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cfg = TAB_CONFIG[tab];
      const params: any = {
        page,
        limit,
        sort: sortBy,
        state: cfg.state,
      };
      if (cfg.status) params.status = cfg.status;
      if (debouncedSearch) params.q = debouncedSearch;

      console.log("[teacher.courses] fetch", params);

      const r = await api.get("/teacher/courses", { params });
      setCourses(r.data.data || []);
      setTotal(r.data.total || 0);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
      isFirstLoad.current = false;
    }
  }, [tab, page, sortBy, debouncedSearch]);

  const fetchStats = useCallback(async () => {
    try {
      setStats((await api.get("/teacher/courses/stats")).data.data);
    } catch {}
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => {
    setPage(1);
    setSelected([]);
  }, [tab, sortBy]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIdx = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIdx = Math.min(page * limit, total);

  useEffect(() => {
    if (page > totalPages && total > 0) setPage(totalPages);
  }, [page, totalPages, total]);

  const handleDuplicate = async (id: string) => {
    try {
      await api.post(`/teacher/courses/${id}/duplicate`);
      toast.success("Course duplicated");
      fetchCourses();
      fetchStats();
    } catch { toast.error("Duplicate failed"); }
  };

  const handleBulkDelete = async () => {
    if (!selected.length || !confirm(`Delete ${selected.length} course(s)?`)) return;
    try {
      await api.post("/teacher/courses/bulk-delete", { ids: selected });
      setSelected([]);
      toast.success("Courses moved to deleted");
      fetchCourses();
      fetchStats();
    } catch { toast.error("Bulk delete failed"); }
  };

  const toggleSelect = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const onModalDone = () => {
    setDeleteTarget(null);
    fetchCourses();
    fetchStats();
  };

  const activeTabMeta = TAB_CONFIG[tab];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* HEADER */}
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

        {/* STATS */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Published" value={stats?.publishedCourses ?? 0} icon={BookOpen} color="emerald" hint={`${stats?.totalCourses ?? 0} total courses`} />
          <StatCard label="Students Enrolled" value={stats?.totalStudents ?? 0} icon={Users} color="blue" hint="Across all your courses" />
          <StatCard label="Total Revenue" value={`$${(stats?.totalRevenue ?? 0).toFixed(2)}`} icon={DollarSign} color="violet" hint="Lifetime earnings" />
          <StatCard label="Avg Rating" value={(stats?.avgRating ?? 0).toFixed(1)} icon={Star} color="amber" hint="Based on verified reviews" />
        </div>

        {/* TABS */}
        <div className="mt-8 flex gap-1.5 overflow-x-auto rounded-2xl border border-slate-200/60 bg-white/70 p-1.5 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70">
          {TAB_ORDER.map((key) => {
            const cfg = TAB_CONFIG[key];
            const Icon = cfg.icon;
            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {cfg.label}
              </button>
            );
          })}
        </div>

        {/* TOOLBAR */}
        <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-slate-200/60 bg-white/70 p-3 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${activeTabMeta.label.toLowerCase()} courses…`}
                className="h-10 rounded-xl border-slate-200 pl-9 dark:border-slate-700"
              />
            </div>
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
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                view === "list" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500"
              }`}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* BULK BAR */}
        {selected.length > 0 && (tab === "all" || tab === "draft" || tab === "published" || tab === "in_review") && (
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

        {/* CONTENT */}
        <div className="mt-6">
          {loading && isFirstLoad.current ? (
            <LoadingState label={`Loading ${activeTabMeta.label.toLowerCase()} courses…`} />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchCourses} />
          ) : courses.length === 0 ? (
            <EmptyState
              icon={activeTabMeta.icon}
              title={
                tab === "all" ? "Your first course awaits"
                : tab === "draft" ? "No drafts"
                : tab === "rejected" ? "Nothing rejected"
                : tab === "in_review" ? "Nothing in review"
                : tab === "published" ? "Nothing published yet"
                : tab === "archived" ? "No archived courses"
                : "Nothing here"
              }
              description={
                tab === "all" ? "Build a course once and sell it forever. Start with a title and outline — add lessons as you go."
                : tab === "draft" ? "Drafts you're still working on will appear here."
                : tab === "rejected" ? "Courses rejected by the admin team will show up here with the reason. Edit and resubmit."
                : tab === "in_review" ? "Courses awaiting admin approval will appear here."
                : tab === "published" ? "Courses you've published and are selling will appear here."
                : tab === "archived" ? "Courses you archive will appear here. Students still keep access."
                : "Deleted courses appear here for 90 days with a media retention countdown."
              }
              action={
                tab === "all" || tab === "draft"
                  ? { label: "Create your first course", href: "/teacher/courses/new", icon: Plus }
                  : undefined
              }
            />
          ) : view === "grid" ? (
            <div className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${loading ? "opacity-60" : ""}`}>
              {courses.map((c) => (
                <GridCard
                  key={c._id}
                  course={c}
                  tab={tab}
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
            <div className={`overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 ${loading ? "opacity-60" : ""}`}>
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
                  {courses.map((c) => {
                    const rejected = isRejected(c);
                    return (
                      <tr
                        key={c._id}
                        className={`group border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-800/30 ${rejected ? "bg-rose-50/30 dark:bg-rose-500/5" : ""}`}
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
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="line-clamp-1 font-semibold text-slate-900 dark:text-white">{c.title}</p>
                                {rejected && (
                                  <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-rose-700 dark:bg-rose-500/20 dark:text-rose-400">
                                    <XCircle className="h-2.5 w-2.5" /> Rejected
                                  </span>
                                )}
                              </div>
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
                              title="Edit"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => router.push(`/teacher/courses/${c._id}`)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                              title="View"
                            >
                              <BarChart3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(c)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                              title={tab === "deleted" ? "Restore" : "Delete"}
                            >
                              {tab === "deleted" ? <RotateCcw className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PAGINATION — always visible when there are results */}
        {courses.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/60 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Showing{" "}
              <span className="font-bold text-slate-900 dark:text-white">{startIdx}–{endIdx}</span>{" "}
              of{" "}
              <span className="font-bold text-slate-900 dark:text-white">{total}</span>{" "}
              {activeTabMeta.label.toLowerCase()} course{total === 1 ? "" : "s"}
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline" size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline" size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-lg"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
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

// ═══════════════════════════════════════════════════════════════
// Grid card
// ═══════════════════════════════════════════════════════════════

function GridCard({
  course, tab, selected, onSelect, onEdit, onView, onDuplicate, onManage,
}: {
  course: Course;
  tab: TabKey;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onView: () => void;
  onDuplicate: () => void;
  onManage: () => void;
}) {
  const [hover, setHover] = useState(false);
  const thumb = thumbUrl(course);
  const retention = daysLeft(course.mediaRetentionUntil);
  const rejected = isRejected(course);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`group relative overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 dark:bg-slate-900 ${
        rejected
          ? "border-rose-300 hover:border-rose-400 dark:border-rose-500/40 dark:hover:border-rose-500/60"
          : "border-slate-200/60 hover:border-indigo-200 dark:border-slate-800 dark:hover:border-indigo-500/30"
      }`}
    >
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
        {thumb ? (
          <img src={thumb} alt={course.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <PlayCircle className="h-12 w-12 text-slate-300 dark:text-slate-600" />
          </div>
        )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between bg-gradient-to-b from-black/40 to-transparent p-3">
          <div className="flex items-center gap-1.5">
            <CourseStatusBadge status={course.status} />
            {rejected && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
                <XCircle className="h-2.5 w-2.5" /> Rejected
              </span>
            )}
          </div>
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
            <Calendar className="mr-1 inline h-3 w-3" /> Media expires in {retention}d
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

      {/* ⭐ Rejected reason banner */}
      {rejected && (
        <div className="border-y border-rose-200 bg-rose-50 px-3 py-2 dark:border-rose-500/30 dark:bg-rose-500/10">
          <p className="flex items-start gap-1.5 text-[11px] text-rose-700 dark:text-rose-400">
            <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
            <span className="line-clamp-2">
              <span className="font-black uppercase tracking-wider">Admin: </span>
              {course.moderationReason}
            </span>
          </p>
        </div>
      )}

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
              tab === "deleted"
                ? "text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                : "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
            }`}
          >
            {tab === "deleted" ? (
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