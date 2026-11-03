// app/admin/courses/page.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  BookOpen, Search, Loader2, RefreshCw, AlertCircle, CheckCircle2,
  XCircle, Archive, RotateCcw, Users, Star, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, Clock, ShieldCheck, AlertTriangle,
  GraduationCap, PlayCircle, ClipboardList, FileQuestion,
  File as FileIcon, PartyPopper, ExternalLink, Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

type CourseStatus = "draft" | "published" | "archived" | "under_review";
type AdminTabKey =
  | "pending" | "under_review" | "draft" | "published"
  | "archived" | "rejected" | "deleted" | "all";
type ModerateAction = "approve" | "reject" | "archive" | "restore";

interface LessonBrief { title: string; type: string; duration?: number; }
interface SectionBrief { title: string; lessons: LessonBrief[]; }

interface Course {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  category?: string;
  status: CourseStatus;
  teacher?: { _id?: string; name?: string; email?: string };
  thumbnailMediaId?: { url?: string };
  enrollmentCount?: number;
  ratingAvg?: number;
  ratingCount?: number;
  priceModel?: "free" | "onetime" | "subscription";
  oneTimePricing?: { price: number; currency: string };
  sections?: SectionBrief[];
  sectionsCount?: number;
  lessonsCount?: number;
  totalDurationSec?: number;
  publishedAt?: string | null;
  createdAt: string;
  moderationReason?: string;
  moderatedAt?: string;
  deletedAt?: string | null;
  hardPurgedAt?: string | null;
  mediaRetentionUntil?: string | null;
  deletionReason?: string;
}

type DialogState = { action: ModerateAction; course: Course } | null;

// ═══════════════════════════════════════════════════════════════
// Metadata
// ═══════════════════════════════════════════════════════════════

const STATUS_META: Record<CourseStatus, { label: string; bg: string; text: string; dot: string }> = {
  draft:        { label: "Draft",        bg: "bg-slate-100",  text: "text-slate-600", dot: "bg-slate-400" },
  under_review: { label: "Under review", bg: "bg-[#FFF6E5]",  text: "text-[#B54708]", dot: "bg-[#B54708]" },
  published:    { label: "Published",    bg: "bg-[#E7F6EC]",  text: "text-[#036B26]", dot: "bg-[#036B26]" },
  archived:     { label: "Archived",     bg: "bg-[#FEF3F2]",  text: "text-[#9E0A05]", dot: "bg-[#9E0A05]" },
};

const LESSON_ICON: Record<string, any> = {
  video: PlayCircle, text: BookOpen, quiz: FileQuestion,
  exam: FileQuestion, assignment: ClipboardList, file: FileIcon,
};

const TAB_CONFIG: Record<AdminTabKey, { label: string; state: string; icon: any }> = {
  pending:      { label: "Pending",    state: "pending",      icon: Clock },
  under_review: { label: "In review",  state: "under_review", icon: Clock },
  draft:        { label: "Draft",      state: "draft",        icon: AlertTriangle },
  published:    { label: "Published",  state: "published",    icon: CheckCircle2 },
  archived:     { label: "Archived",   state: "archived",     icon: Archive },
  rejected:     { label: "Rejected",   state: "rejected",     icon: XCircle },
  deleted:      { label: "Deleted",    state: "deleted",      icon: Trash2 },
  all:          { label: "All",        state: "all",          icon: BookOpen },
};

const TAB_ORDER: AdminTabKey[] = [
  "pending", "under_review", "draft", "published", "archived", "rejected", "deleted", "all",
];

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

function money(n: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(n || 0);
}

function fmtDuration(sec?: number) {
  if (!sec || sec <= 0) return "0m";
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

function priceLabel(c: Course) {
  if (c.priceModel === "free") return "Free";
  if (c.priceModel === "onetime" && c.oneTimePricing) return money(c.oneTimePricing.price, c.oneTimePricing.currency);
  if (c.priceModel === "subscription") return "Subscription";
  return "—";
}

function daysLeft(iso?: string | null) {
  if (!iso) return null;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}

// ═══════════════════════════════════════════════════════════════
// Skeleton
// ═══════════════════════════════════════════════════════════════

function CoursesSkeleton() {
  return (
    <div className="flex flex-col gap-5 py-2">
      <style jsx>{`
        @keyframes adminShimmer { 0%{background-position:-1000px 0} 100%{background-position:1000px 0} }
        .admin-shimmer { background: linear-gradient(90deg,#FEE9DE 0%,#FFF5EE 50%,#FEE9DE 100%); background-size: 1000px 100%; animation: adminShimmer 2s infinite linear; }
      `}</style>
      <div className="flex items-center gap-2 rounded-xl border border-[#FFE1C7] bg-[#FEF3EE] px-4 py-2.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-[#EB5017] opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#EB5017]" />
        </span>
        <p className="text-xs font-bold text-[#EB5017]">Loading courses…</p>
      </div>
      <div className="admin-shimmer h-28 rounded-2xl" />
      <div className="admin-shimmer h-14 rounded-2xl" />
      <div className="admin-shimmer h-16 rounded-2xl" />
      <div className="space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="admin-shimmer h-32 rounded-2xl" />)}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════════════════════

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<AdminTabKey>("pending");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;
  const [total, setTotal] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const hasLoadedOnce = useRef(false);

  // Last fetch diagnostic (shows in a small strip for debugging)
  const [lastRequestInfo, setLastRequestInfo] = useState<string>("");

  const [allCounts, setAllCounts] = useState<Record<string, number>>({
    pending: 0, under_review: 0, draft: 0, published: 0, archived: 0, rejected: 0, deleted: 0, all: 0,
  });

  const [dialog, setDialog] = useState<DialogState>(null);
  const [dialogReason, setDialogReason] = useState("");
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [dialogErrors, setDialogErrors] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // ── Main list fetch — no _t param, no extra params ──
  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const cfg = TAB_CONFIG[tab];
      const params: Record<string, string | number> = {
        state: cfg.state,
        page,
        limit,
      };
      if (debouncedSearch) params.q = debouncedSearch;

      const url = `/admin/courses?${new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      ).toString()}`;
      setLastRequestInfo(url);

      console.log(`[admin.courses] GET ${url}`);

      const r = await api.get("/admin/courses", {
        params,
        headers: {
          "Cache-Control": "no-store",
          Pragma: "no-cache",
        },
      });

      const items: Course[] = r.data?.data || [];
      const totalCount: number = r.data?.total || 0;

      console.log(`[admin.courses] ← tab=${tab} state=${cfg.state} items=${items.length} total=${totalCount}`);

      setCourses(items);
      setTotal(totalCount);
    } catch (e: any) {
      if (!silent) setError(e?.response?.data?.message || "Failed to load courses");
      console.error("[admin.courses] fetch failed:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
      hasLoadedOnce.current = true;
    }
  }, [tab, page, debouncedSearch, refreshKey]);

  // ── Counts fetch — parallel, one failure doesn't kill the rest ──
  const loadCounts = useCallback(async () => {
    const keys: AdminTabKey[] = [
      "pending", "under_review", "draft", "published",
      "archived", "rejected", "deleted", "all",
    ];

    const results = await Promise.allSettled(
      keys.map(async (k) => {
        const stateValue = TAB_CONFIG[k].state;
        const r = await api.get("/admin/courses", {
          params: { state: stateValue, limit: 1, page: 1 },
          headers: { "Cache-Control": "no-store" },
        });
        return [k, Number(r.data?.total) || 0] as [string, number];
      })
    );

    const counts: Record<string, number> = {};
    for (const res of results) {
      if (res.status === "fulfilled") {
        counts[res.value[0]] = res.value[1];
      } else {
        console.warn("[admin.courses] count failed:", res.reason);
      }
    }
    setAllCounts((prev) => ({ ...prev, ...counts }));
  }, [refreshKey]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadCounts(); }, [loadCounts]);

  // ── Derived ───────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIdx = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIdx = Math.min(page * limit, total);

  useEffect(() => {
    if (page > totalPages && total > 0) setPage(totalPages);
  }, [page, totalPages, total]);

  // ── Handlers ──────────────────────────────────────────
  const changeTab = (newTab: AdminTabKey) => {
    if (newTab === tab) return;
    setTab(newTab);
    setPage(1);
    setExpandedId(null);
  };

  const refreshAll = () => {
    setRefreshKey((k) => k + 1);
    loadCounts();
  };

  const openDialog = (action: ModerateAction, course: Course) => {
    setDialog({ action, course });
    setDialogReason("");
    setDialogError(null);
    setDialogErrors([]);
  };

  const closeDialog = () => {
    setDialog(null);
    setDialogReason("");
    setDialogError(null);
    setDialogErrors([]);
  };

  const executeAction = async () => {
    if (!dialog) return;
    const { action, course } = dialog;
    if (action === "reject" && !dialogReason.trim()) {
      setDialogError("Rejection reason is required");
      return;
    }
    setDialogError(null);
    setDialogErrors([]);
    setProcessing(true);
    try {
      const body: any = { action };
      if (action === "reject" || action === "archive") {
        if (dialogReason.trim()) body.reason = dialogReason.trim();
      }
      await api.post(`/admin/courses/${course._id}/moderate`, body);
      const verb =
        action === "approve" ? "published" :
        action === "reject" ? "moved to draft" :
        action === "archive" ? "archived" : "restored";
      toast.success(`Course ${verb}`, { description: course.title });
      closeDialog();
      refreshAll();
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Failed to moderate course";
      const errs = e?.response?.data?.errors as string[] | undefined;
      if (errs?.length) setDialogErrors(errs);
      setDialogError(msg);
      toast.error("Action failed", { description: msg });
    } finally {
      setProcessing(false);
    }
  };

  const handlePurge = async (course: Course) => {
    if (!confirm(`Permanently purge "${course.title}"? This deletes all media and cannot be undone.`)) return;
    try {
      await api.delete(`/admin/courses/${course._id}/purge`, { data: { reason: "Admin purge" } });
      toast.success("Course permanently purged");
      refreshAll();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Purge failed");
    }
  };

  // ── Render states ─────────────────────────────────────
  if (loading && !hasLoadedOnce.current) return <CoursesSkeleton />;

  if (error && !hasLoadedOnce.current) {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FEF3F2] to-[#FEE4E2] shadow-lg">
          <AlertCircle className="h-8 w-8 text-[#9E0A05]" />
        </div>
        <h2 className="mt-5 text-xl font-black tracking-tight text-slate-900">Couldn&apos;t load courses</h2>
        <p className="mt-1 max-w-md text-sm text-slate-500">{error}</p>
        <Button
          className="mt-6 h-11 rounded-xl bg-[#EB5017] font-bold text-white shadow-md shadow-[#EB5017]/25 hover:bg-[#D94512]"
          onClick={refreshAll}
        >
          <RefreshCw className="mr-1.5 h-4 w-4" /> Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-5 py-2">
      {refreshing && (
        <div className="fixed right-6 top-20 z-50 flex items-center gap-2 rounded-full border border-[#FFE1C7] bg-white px-3 py-1.5 shadow-lg">
          <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#EB5017]" />
          <span className="text-xs font-bold text-[#EB5017]">Refreshing…</span>
        </div>
      )}

      {/* HERO */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#EB5017] via-[#D94512] to-[#B33A0F] p-6 shadow-lg sm:p-8">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-yellow-400/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-white shadow-lg backdrop-blur">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Content</p>
              <h1 className="mt-0.5 text-2xl font-black tracking-tight text-white sm:text-3xl">Course moderation</h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-white/80">
                <span>{allCounts.pending || 0} awaiting review</span>
                {(allCounts.published || 0) > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 font-black text-white backdrop-blur">
                    <CheckCircle2 className="h-3 w-3" /> {allCounts.published} live
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button
            onClick={refreshAll}
            disabled={refreshing}
            className="h-11 rounded-lg bg-white/15 font-bold text-white backdrop-blur hover:bg-white/25"
          >
            <RefreshCw className={cn("mr-1.5 h-4 w-4", refreshing && "animate-spin")} /> Refresh
          </Button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-sm">
        {TAB_ORDER.map((key) => {
          const cfg = TAB_CONFIG[key];
          const Icon = cfg.icon;
          const active = tab === key;
          const count = allCounts[key] ?? 0;
          return (
            <button
              key={key}
              onClick={() => changeTab(key)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all",
                active
                  ? "bg-gradient-to-r from-[#EB5017] to-[#B33A0F] text-white shadow-md shadow-[#EB5017]/25"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {cfg.label}
              {count > 0 && (
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-[9px] font-black",
                  active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* FILTERS */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${TAB_CONFIG[tab].label.toLowerCase()} courses…`}
            className="h-10 rounded-lg pl-9"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 sm:ml-auto">
          <span>
            Tab: <span className="font-bold text-slate-900">{TAB_CONFIG[tab].label}</span>
            {" · "}state=<span className="font-mono text-slate-700">{TAB_CONFIG[tab].state}</span>
          </span>
        </div>
      </div>

      {/* Error after first load (inline, doesn't wipe list) */}
      {error && hasLoadedOnce.current && (
        <div className="flex items-center gap-2 rounded-xl border border-[#FEE4E2] bg-[#FEF3F2] px-4 py-2.5 text-xs text-[#9E0A05]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <Button size="sm" variant="outline" onClick={refreshAll} className="h-7 rounded-md border-[#FEE4E2]">
            Retry
          </Button>
        </div>
      )}

      {/* LIST */}
      {courses.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white py-16 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FEE9DE] to-[#FFD5A8] shadow-lg">
            <PartyPopper className="h-8 w-8 text-[#EB5017]" />
          </div>
          <h3 className="mt-4 text-lg font-black text-slate-900">
            {debouncedSearch
              ? "No courses match your search"
              : tab === "pending"
              ? "All caught up"
              : `No ${TAB_CONFIG[tab].label.toLowerCase()} courses`}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            {debouncedSearch
              ? "Try a different keyword or clear the search."
              : tab === "pending"
              ? "Nothing is waiting for review right now."
              : tab === "deleted"
              ? "No soft-deleted courses. Teachers can restore them within 90 days."
              : `There are no courses in "${TAB_CONFIG[tab].label.toLowerCase()}" right now.`}
          </p>
          {/* Diagnostic strip — remove after verification */}
          {lastRequestInfo && (
            <p className="mt-4 rounded-md bg-slate-100 px-2 py-1 font-mono text-[10px] text-slate-500">
              GET {lastRequestInfo} → 0 items
            </p>
          )}
        </div>
      ) : (
        <div className={cn("space-y-3 transition-opacity", loading && "opacity-60")}>
          {courses.map((c) => (
            <CourseRow
              key={c._id}
              course={c}
              expanded={expandedId === c._id}
              onToggle={() => setExpandedId(expandedId === c._id ? null : c._id)}
              onAction={(action) => openDialog(action, c)}
              onPurge={() => handlePurge(c)}
            />
          ))}
        </div>
      )}

      {/* STICKY PAGINATION — visible whenever total > 0 */}
      {total > 0 && (
        <div className="sticky bottom-2 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 shadow-xl backdrop-blur">
          <p className="text-sm text-slate-500">
            Showing <span className="font-bold text-slate-900">{startIdx}–{endIdx}</span> of{" "}
            <span className="font-bold text-slate-900">{total}</span>{" "}
            {TAB_CONFIG[tab].label.toLowerCase()} course{total === 1 ? "" : "s"}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || totalPages === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 text-sm font-bold tabular-nums text-slate-700">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || totalPages === 1}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* DIALOG */}
      <ModerateDialog
        dialog={dialog}
        onClose={closeDialog}
        onConfirm={executeAction}
        reason={dialogReason}
        setReason={setDialogReason}
        error={dialogError}
        errors={dialogErrors}
        processing={processing}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Course row
// ═══════════════════════════════════════════════════════════════

function CourseRow({
  course, expanded, onToggle, onAction, onPurge,
}: {
  course: Course;
  expanded: boolean;
  onToggle: () => void;
  onAction: (action: ModerateAction) => void;
  onPurge: () => void;
}) {
  const meta = STATUS_META[course.status];
  const thumbUrl = course.thumbnailMediaId?.url;
  const retention = daysLeft(course.mediaRetentionUntil);
  const isDeleted = !!course.deletedAt;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
      <div className="flex flex-wrap items-center gap-3 p-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#0177FB]/10 to-violet-500/10">
          {thumbUrl ? <img src={thumbUrl} alt="" className="h-full w-full object-cover" /> : <GraduationCap className="h-6 w-6 text-[#0177FB]" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-black text-slate-900">{course.title || "Untitled"}</p>
            {isDeleted ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3F2] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#9E0A05]">
                <Trash2 className="h-2.5 w-2.5" /> Deleted
              </span>
            ) : (
              <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider", meta.bg, meta.text)}>
                <span className={cn("h-1 w-1 rounded-full", meta.dot)} /> {meta.label}
              </span>
            )}
            {!isDeleted && course.moderationReason && course.status === "draft" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3F2] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#9E0A05]">
                <AlertCircle className="h-2.5 w-2.5" /> Rejected
              </span>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#667185]">
            {course.teacher?.name && <span>{course.teacher.name}</span>}
            {course.category && <><span className="text-slate-300">·</span><span className="capitalize">{course.category.replace(/-/g, " ")}</span></>}
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {course.enrollmentCount || 0}</span>
            {(course.ratingCount || 0) > 0 && (
              <><span className="text-slate-300">·</span><span className="inline-flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {(course.ratingAvg || 0).toFixed(1)}
              </span></>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-black tabular-nums text-slate-900">{priceLabel(course)}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">{course.lessonsCount || 0} lessons</p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {!isDeleted && (course.status === "draft" || course.status === "under_review") && (
            <Button onClick={() => onAction("approve")} size="sm" className="h-9 rounded-lg bg-[#E7F6EC] font-bold text-[#036B26] hover:bg-[#D3EEDD]">
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve
            </Button>
          )}
          {!isDeleted && (course.status === "under_review" || course.status === "published") && (
            <Button onClick={() => onAction("reject")} size="sm" variant="outline" className="h-9 rounded-lg border-[#FEE4E2] font-bold text-[#9E0A05] hover:bg-[#FEF3F2]">
              <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
            </Button>
          )}
          {!isDeleted && (course.status === "draft" || course.status === "published" || course.status === "under_review") && (
            <Button onClick={() => onAction("archive")} size="sm" variant="outline" className="h-9 rounded-lg font-bold text-slate-600">
              <Archive className="mr-1 h-3.5 w-3.5" /> Archive
            </Button>
          )}
          {!isDeleted && course.status === "archived" && (
            <Button onClick={() => onAction("restore")} size="sm" className="h-9 rounded-lg bg-[#E0EAFF] font-bold text-[#0177FB] hover:bg-[#C7D7FE]">
              <RotateCcw className="mr-1 h-3.5 w-3.5" /> Restore
            </Button>
          )}
          {isDeleted && (
            <Button onClick={onPurge} size="sm" variant="outline" className="h-9 rounded-lg border-[#FEE4E2] font-bold text-[#9E0A05] hover:bg-[#FEF3F2]">
              <Trash2 className="mr-1 h-3.5 w-3.5" /> Purge
            </Button>
          )}
          <button onClick={onToggle} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 px-4 py-2 text-[11px] text-[#98A2B3]">
        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> Created {formatDistanceToNow(new Date(course.createdAt), { addSuffix: true })}</span>
        {course.publishedAt && <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Published {formatDistanceToNow(new Date(course.publishedAt), { addSuffix: true })}</span>}
        {course.moderatedAt && <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Moderated {formatDistanceToNow(new Date(course.moderatedAt), { addSuffix: true })}</span>}
        {retention !== null && (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 font-bold text-rose-600">
            <AlertTriangle className="h-3 w-3" /> Media expires in {retention}d
          </span>
        )}
        <Link href={`/courses/${course.slug}`} target="_blank" className="ml-auto inline-flex items-center gap-1 font-bold text-[#0177FB] hover:underline">
          View public page <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 bg-gradient-to-br from-slate-50/50 to-white p-4">
          {course.moderationReason && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-[#FEE4E2] bg-[#FEF3F2] p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#9E0A05]" />
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#9E0A05]">Moderation reason</p>
                <p className="mt-0.5 text-sm text-[#7A0704]">{course.moderationReason}</p>
              </div>
            </div>
          )}
          {course.deletionReason && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-slate-600">Deletion reason</p>
                <p className="mt-0.5 text-sm text-slate-700">{course.deletionReason}</p>
              </div>
            </div>
          )}
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#98A2B3]">Description</p>
              <p className="whitespace-pre-line rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700">{course.description || "No description"}</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <SmallStat label="Sections" value={String(course.sectionsCount || 0)} />
                <SmallStat label="Lessons" value={String(course.lessonsCount || 0)} />
                <SmallStat label="Duration" value={fmtDuration(course.totalDurationSec)} />
              </div>
            </div>
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#98A2B3]">Content outline</p>
              <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2">
                {!course.sections || course.sections.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-400">No sections yet</p>
                ) : (
                  <div className="space-y-1.5">
                    {course.sections.map((sec, i) => (
                      <div key={i} className="rounded-lg bg-slate-50 p-2">
                        <p className="text-xs font-bold text-slate-900">{i + 1}. {sec.title}</p>
                        <div className="mt-1 space-y-0.5 pl-2">
                          {sec.lessons.map((l, j) => {
                            const LessonIcon = LESSON_ICON[l.type] || BookOpen;
                            return (
                              <p key={j} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                                <LessonIcon className="h-3 w-3 shrink-0 text-slate-400" />
                                <span className="truncate">{l.title}</span>
                                {l.duration ? <span className="ml-auto text-[10px] text-slate-400">{l.duration}m</span> : null}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2 text-center">
      <p className="text-sm font-black text-slate-900">{value}</p>
      <p className="text-[9px] font-bold uppercase tracking-wider text-[#98A2B3]">{label}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Moderate dialog
// ═══════════════════════════════════════════════════════════════

function ModerateDialog({
  dialog, onClose, onConfirm, reason, setReason, error, errors, processing,
}: {
  dialog: DialogState;
  onClose: () => void;
  onConfirm: () => void;
  reason: string;
  setReason: (v: string) => void;
  error: string | null;
  errors: string[];
  processing: boolean;
}) {
  const open = !!dialog;
  const action = dialog?.action;
  const course = dialog?.course;

  const config: Record<ModerateAction, {
    title: string; description: string; icon: any; iconBg: string;
    confirmLabel: string; confirmClass: string; needsReason: boolean; reasonRequired: boolean;
  }> = {
    approve: {
      title: "Approve & publish", description: "The course goes live in the marketplace.",
      icon: CheckCircle2, iconBg: "bg-[#E7F6EC] text-[#036B26]",
      confirmLabel: "Approve & publish", confirmClass: "bg-[#036B26] hover:bg-[#024D1B] text-white",
      needsReason: false, reasonRequired: false,
    },
    reject: {
      title: "Reject course", description: "The course moves back to draft. The teacher will see your reason.",
      icon: XCircle, iconBg: "bg-[#FEF3F2] text-[#9E0A05]",
      confirmLabel: "Reject", confirmClass: "bg-[#9E0A05] hover:bg-[#7A0704] text-white",
      needsReason: true, reasonRequired: true,
    },
    archive: {
      title: "Archive course", description: "The course is hidden from the marketplace. Existing students keep access.",
      icon: Archive, iconBg: "bg-slate-100 text-slate-700",
      confirmLabel: "Archive", confirmClass: "bg-slate-800 hover:bg-slate-700 text-white",
      needsReason: true, reasonRequired: false,
    },
    restore: {
      title: "Restore to draft", description: "The course becomes a draft again. The teacher can edit and republish it.",
      icon: RotateCcw, iconBg: "bg-[#E0EAFF] text-[#0177FB]",
      confirmLabel: "Restore", confirmClass: "bg-gradient-to-r from-[#0177FB] to-[#0156C7] text-white",
      needsReason: false, reasonRequired: false,
    },
  };

  if (!action || !course) {
    return (
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="sr-only">Moderate course</DialogTitle></DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const cfg = config[action];
  const Icon = cfg.icon;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex items-start gap-3">
            <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", cfg.iconBg)}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-slate-900">{cfg.title}</DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-slate-500">{cfg.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Course</span>
            <span className="line-clamp-1 text-right font-bold text-slate-900">{course.title}</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-slate-500">Teacher</span>
            <span className="font-semibold text-slate-900">{course.teacher?.name || "—"}</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-slate-500">Status</span>
            <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider", STATUS_META[course.status].bg, STATUS_META[course.status].text)}>
              {STATUS_META[course.status].label}
            </span>
          </div>
        </div>
        {cfg.needsReason && (
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {action === "reject" ? "Rejection reason" : "Reason"}{" "}
              {cfg.reasonRequired && <span className="text-[#9E0A05]">*</span>}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={action === "reject" ? "Explain to the teacher what needs to change…" : "Optional internal note…"}
              rows={3}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#EB5017] focus:outline-none focus:ring-2 focus:ring-[#FEE9DE]"
              autoFocus
            />
          </div>
        )}
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-[#FEE4E2] bg-[#FEF3F2] p-2.5 text-xs text-[#9E0A05]">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <div className="flex-1">
              <p className="font-bold">{error}</p>
              {errors.length > 0 && (
                <ul className="mt-1 list-inside list-disc space-y-0.5 pl-1 text-[11px]">
                  {errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              )}
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" className="rounded-lg" onClick={onClose} disabled={processing}>Cancel</Button>
          <Button className={cn("rounded-lg font-bold shadow-md", cfg.confirmClass)} onClick={onConfirm} disabled={processing}>
            {processing ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Processing…</> : <><Icon className="mr-1.5 h-4 w-4" /> {cfg.confirmLabel}</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}